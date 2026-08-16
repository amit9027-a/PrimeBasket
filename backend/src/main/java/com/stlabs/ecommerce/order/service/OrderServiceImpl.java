package com.stlabs.ecommerce.order.service;

import com.stlabs.ecommerce.cart.entity.Cart;
import com.stlabs.ecommerce.cart.entity.CartItem;
import com.stlabs.ecommerce.cart.repository.CartItemRepository;
import com.stlabs.ecommerce.cart.repository.CartRepository;
import com.stlabs.ecommerce.common.security.CurrentUserService;
import com.stlabs.ecommerce.exception.ResourceNotFoundException;
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
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;
    private final RazorpayPaymentService razorpayPaymentService;

    @Override
    public OrderResponse placeOrder(CreateOrderRequest request) {

        User user = currentUserService.getCurrentUser();

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Order order = new Order();

        order.setUser(user);
        order.setShippingAddress(request.shippingAddress().trim());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setItems(new ArrayList<>());

        double total = 0.0;

        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            // Check stock before creating order
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            // Reduce stock
            product.setStockQuantity(
                    product.getStockQuantity()
                            - cartItem.getQuantity()
            );

            productRepository.save(product);

            // Create order item
            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());

            order.getItems().add(orderItem);

            total += product.getPrice() * cartItem.getQuantity();
        }

        // Set total amount
        order.setTotalAmount(total);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();

        return mapToResponse(savedOrder);
    }

    /**
     * Paid checkout flow.
     *
     * Razorpay payment signature is verified first.
     * Only after successful verification is the actual order created.
     */
    @Override
    public OrderResponse placePaidOrder(
            CreateOrderRequest request,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {

        if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
            throw new IllegalArgumentException(
                    "Razorpay order ID is required"
            );
        }

        if (razorpayPaymentId == null || razorpayPaymentId.isBlank()) {
            throw new IllegalArgumentException(
                    "Razorpay payment ID is required"
            );
        }

        if (razorpaySignature == null || razorpaySignature.isBlank()) {
            throw new IllegalArgumentException(
                    "Razorpay signature is required"
            );
        }

        try {

            boolean verified =
                    razorpayPaymentService.verifyPaymentSignature(
                            razorpayOrderId,
                            razorpayPaymentId,
                            razorpaySignature
                    );

            if (!verified) {
                throw new IllegalArgumentException(
                        "Payment verification failed"
                );
            }

        } catch (IllegalArgumentException e) {
            throw e;

        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Unable to verify Razorpay payment",
                    e
            );
        }

        /*
         * Payment is verified successfully.
         *
         * Now create the actual ecommerce order.
         */
        return placeOrder(request);
    }

    /**
     * Get orders for current user.
     *
     * Admin gets all orders.
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders() {

        User user = currentUserService.getCurrentUser();

        List<Order> orders =
                currentUserService.isAdmin()
                        ? orderRepository.findAll()
                        : orderRepository
                                .findByUserIdOrderByCreatedAtDesc(
                                        user.getId()
                                );

        return orders.stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Get a single accessible order.
     */
    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {

        return mapToResponse(
                findAccessibleOrder(id)
        );
    }

    /**
     * Admin updates order status.
     */
    @Override
    public OrderResponse updateStatus(
            Long id,
            OrderStatusUpdateRequest request
    ) {

        if (!currentUserService.isAdmin()) {
            throw new IllegalArgumentException(
                    "Only admin can update order status"
            );
        }

        Order order = findOrder(id);

        if (request.status() == OrderStatus.CANCELLED) {

            applyCancellation(order);

        } else {

            order.setOrderStatus(
                    request.status()
            );
        }

        return mapToResponse(
                orderRepository.save(order)
        );
    }

    /**
     * Cancel order.
     */
    @Override
    public OrderResponse cancelOrder(Long id) {

        Order order = findAccessibleOrder(id);

        if (
                currentUserService.isAdmin()
                        || order.getUser()
                                .getId()
                                .equals(
                                        currentUserService
                                                .getCurrentUser()
                                                .getId()
                                )
        ) {

            applyCancellation(order);

            return mapToResponse(
                    orderRepository.save(order)
            );
        }

        throw new IllegalArgumentException(
                "You cannot cancel this order"
        );
    }

    /**
     * Find order accessible by current user.
     *
     * Admin can access any order.
     * Normal user can access only their own order.
     */
    private Order findAccessibleOrder(Long id) {

        if (currentUserService.isAdmin()) {
            return findOrder(id);
        }

        return orderRepository
                .findByIdAndUserId(
                        id,
                        currentUserService
                                .getCurrentUser()
                                .getId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"
                        )
                );
    }

    /**
     * Find order by ID.
     */
    private Order findOrder(Long id) {

        return orderRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"
                        )
                );
    }

    /**
     * Cancel order and restore stock.
     */
    private void applyCancellation(Order order) {

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return;
        }

        if (
                order.getOrderStatus() == OrderStatus.SHIPPED
                        || order.getOrderStatus()
                                == OrderStatus.DELIVERED
        ) {

            throw new IllegalArgumentException(
                    "This order can no longer be cancelled"
            );
        }

        for (OrderItem item : order.getItems()) {

            Product product = item.getProduct();

            product.setStockQuantity(
                    product.getStockQuantity()
                            + item.getQuantity()
            );

            productRepository.save(product);
        }

        order.setOrderStatus(
                OrderStatus.CANCELLED
        );
    }

    /**
     * Convert Order entity to API response.
     */
    private OrderResponse mapToResponse(Order order) {

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getOrderStatus(),
                order.getCreatedAt(),
                order.getItems()
                        .stream()
                        .map(this::mapToItemResponse)
                        .toList()
        );
    }

    /**
     * Convert OrderItem entity to API response.
     */
    private OrderItemResponse mapToItemResponse(
            OrderItem item
    ) {

        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProductName(),
                item.getQuantity(),
                item.getPrice(),
                item.getPrice()
                        * item.getQuantity()
        );
    }
}