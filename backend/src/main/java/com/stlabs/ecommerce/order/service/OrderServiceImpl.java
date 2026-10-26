package com.stlabs.ecommerce.order.service;

import com.stlabs.ecommerce.cart.entity.Cart;
import com.stlabs.ecommerce.cart.entity.CartItem;
import com.stlabs.ecommerce.cart.repository.CartItemRepository;
import com.stlabs.ecommerce.cart.repository.CartRepository;
import com.stlabs.ecommerce.common.security.CurrentUserService;
import com.stlabs.ecommerce.exception.ResourceNotFoundException;
import com.stlabs.ecommerce.giftcard.service.GiftCardCheckoutService;
import com.stlabs.ecommerce.order.dto.CreateOrderRequest;
import com.stlabs.ecommerce.order.dto.OrderItemResponse;
import com.stlabs.ecommerce.order.dto.OrderResponse;
import com.stlabs.ecommerce.order.dto.OrderStatusUpdateRequest;
import com.stlabs.ecommerce.order.entity.Order;
import com.stlabs.ecommerce.order.entity.OrderItem;
import com.stlabs.ecommerce.order.entity.OrderStatus;
import com.stlabs.ecommerce.order.repository.OrderRepository;
import com.stlabs.ecommerce.product.entity.Product;
import com.stlabs.ecommerce.product.repository.ProductRepository;
import com.stlabs.ecommerce.user.entity.User;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;
    private final RazorpayPaymentService razorpayPaymentService;
    private final GiftCardCheckoutService giftCardCheckoutService;

    @Override
    @Transactional(readOnly = true)
    public double getCurrentCartTotal() {
        return calculateCartTotal();
    }

    @Override
    @Transactional(readOnly = true)
    public double getCheckoutTotal(String giftCardCode) {
        BigDecimal cartTotal = money(calculateCartTotal());

        BigDecimal discount =
                giftCardCheckoutService.calculateDiscount(
                        giftCardCode,
                        cartTotal);

        return cartTotal.subtract(discount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private double calculateCartTotal() {
        Cart cart = getCurrentCart();
        double total = 0.0;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product == null) {
                throw new IllegalArgumentException(
                        "A cart item has no product");
            }

            if (cartItem.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Invalid product quantity");
            }

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getName());
            }

            total += product.getPrice() * cartItem.getQuantity();
        }

        if (!Double.isFinite(total) || total <= 0) {
            throw new IllegalArgumentException(
                    "Order total must be greater than zero");
        }

        return total;
    }

    @Override
    public OrderResponse placeOrder(CreateOrderRequest request) {
        return placeOrder(request, null);
    }

    @Override
    public OrderResponse placeOrder(
            CreateOrderRequest request,
            String giftCardCode) {

        return createOrder(
                request,
                "COD",
                "PENDING",
                giftCardCode);
    }

    @Override
    public OrderResponse placePaidOrder(
            CreateOrderRequest request,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature,
            String paymentMethod) {

        return placePaidOrder(
                request,
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                paymentMethod,
                null);
    }

    @Override
    public OrderResponse placePaidOrder(
            CreateOrderRequest request,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature,
            String paymentMethod,
            String giftCardCode) {

        if (isBlank(razorpayOrderId)
                || isBlank(razorpayPaymentId)
                || isBlank(razorpaySignature)) {
            throw new IllegalArgumentException(
                    "All Razorpay payment details are required");
        }

        String normalizedMethod = paymentMethod == null
                ? ""
                : paymentMethod.trim().toUpperCase();

        if (!normalizedMethod.equals("CARD")
                && !normalizedMethod.equals("UPI")) {
            throw new IllegalArgumentException(
                    "Payment method must be CARD or UPI");
        }

        BigDecimal cartTotal = money(calculateCartTotal());

        BigDecimal discount =
                giftCardCheckoutService.calculateDiscount(
                        giftCardCode,
                        cartTotal);

        BigDecimal payable = cartTotal.subtract(discount)
                .setScale(2, RoundingMode.HALF_UP);

        if (payable.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Your Gift Card covers the full cart. "
                            + "Please choose COD for this checkout.");
        }

        try {
            boolean amountMatches =
                    razorpayPaymentService.verifyOrderAmount(
                            razorpayOrderId,
                            payable.doubleValue());

            if (!amountMatches) {
                throw new IllegalArgumentException(
                        "Payment amount does not match the discounted "
                                + "cart total. Please contact support "
                                + "if you were charged.");
            }

            boolean signatureValid =
                    razorpayPaymentService.verifyPaymentSignature(
                            razorpayOrderId,
                            razorpayPaymentId,
                            razorpaySignature);

            if (!signatureValid) {
                throw new IllegalArgumentException(
                        "Payment signature verification failed");
            }

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error(
                    "Razorpay verification failed. Order ID: {}",
                    razorpayOrderId,
                    e);

            throw new IllegalArgumentException(
                    "Unable to verify Razorpay payment",
                    e);
        }

        return createOrder(
                request,
                normalizedMethod,
                "PAID",
                giftCardCode);
    }

    private OrderResponse createOrder(
            CreateOrderRequest request,
            String paymentMethod,
            String paymentStatus,
            String giftCardCode) {

        if (request == null || isBlank(request.shippingAddress())) {
            throw new IllegalArgumentException(
                    "Shipping address is required");
        }

        User user = currentUserService.getCurrentUser();
        Cart cart = getCurrentCart();

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.shippingAddress().trim());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentStatus);
        order.setItems(new ArrayList<>());

        double originalTotal = 0.0;

        // Validate every item and prepare the order before changing stock.
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (product == null) {
                throw new IllegalArgumentException(
                        "A cart item has no product");
            }

            if (cartItem.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Invalid product quantity");
            }

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());

            order.getItems().add(orderItem);

            originalTotal +=
                    product.getPrice() * cartItem.getQuantity();
        }

        if (!Double.isFinite(originalTotal) || originalTotal <= 0) {
            throw new IllegalArgumentException(
                    "Order total must be greater than zero");
        }

        BigDecimal cartTotal = money(originalTotal);

        BigDecimal discount =
                giftCardCheckoutService.calculateDiscount(
                        giftCardCode,
                        cartTotal);

        BigDecimal payable = cartTotal.subtract(discount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        if ("PAID".equals(paymentStatus)
                && payable.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "A zero-amount order cannot use Razorpay");
        }

        // Save the amount the customer actually pays after the discount.
        order.setTotalAmount(payable.doubleValue());

        // Stock updates are part of the same database transaction.
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            product.setStockQuantity(
                    product.getStockQuantity()
                            - cartItem.getQuantity());

            productRepository.save(product);
        }

        Order savedOrder = orderRepository.saveAndFlush(order);

        /*
         * Deduct the Gift Card only after the order is saved.
         * Any exception rolls back the transaction, including stock/order
         * changes, provided these operations use the same database transaction.
         */
        if (giftCardCode != null && !giftCardCode.isBlank()) {
            giftCardCheckoutService.redeem(
                    giftCardCode,
                    cartTotal,
                    discount,
                    savedOrder);
        }

        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();

        return mapToResponse(savedOrder);
    }

    private Cart getCurrentCart() {
        User user = currentUserService.getCurrentUser();

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        return cart;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders() {
        User user = currentUserService.getCurrentUser();

        List<Order> orders = currentUserService.isAdmin()
                ? orderRepository.findAll()
                : orderRepository.findByUserIdOrderByCreatedAtDesc(
                        user.getId());

        return orders.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        return mapToResponse(findAccessibleOrder(id));
    }

    @Override
    public OrderResponse updateStatus(
            Long id,
            OrderStatusUpdateRequest request) {

        if (!currentUserService.isAdmin()) {
            throw new IllegalArgumentException(
                    "Only admin can update order status");
        }

        Order order = findOrder(id);

        if (request.status() == OrderStatus.CANCELLED) {
            applyCancellation(order);
        } else {
            order.setOrderStatus(request.status());
        }

        return mapToResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse cancelOrder(Long id) {
        Order order = findAccessibleOrder(id);

        applyCancellation(order);

        return mapToResponse(orderRepository.save(order));
    }

    private Order findAccessibleOrder(Long id) {
        if (currentUserService.isAdmin()) {
            return findOrder(id);
        }

        return orderRepository.findByIdAndUserId(
                        id,
                        currentUserService.getCurrentUser().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));
    }

    private void applyCancellation(Order order) {
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return;
        }

        if (order.getOrderStatus() == OrderStatus.SHIPPED
                || order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new IllegalArgumentException(
                    "This order can no longer be cancelled");
        }

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();

            product.setStockQuantity(
                    product.getStockQuantity() + item.getQuantity());

            productRepository.save(product);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
    }

    private OrderResponse mapToResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getOrderStatus(),
                order.getCreatedAt(),
                order.getItems().stream()
                        .map(this::mapToItemResponse)
                        .toList(),
                order.getPaymentMethod(),
                order.getPaymentStatus());
    }

    private OrderItemResponse mapToItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProductName(),
                item.getQuantity(),
                item.getPrice(),
                item.getPrice() * item.getQuantity());
    }

    private BigDecimal money(double amount) {
        return BigDecimal.valueOf(amount)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}