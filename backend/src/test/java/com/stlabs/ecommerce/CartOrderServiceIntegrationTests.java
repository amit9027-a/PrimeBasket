package com.stlabs.ecommerce;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.stlabs.ecommerce.auth.security.AuthenticatedUser;
import com.stlabs.ecommerce.auth.security.SecurityConstants;
import com.stlabs.ecommerce.cart.dto.CartItemRequest;
import com.stlabs.ecommerce.cart.dto.CartResponse;
import com.stlabs.ecommerce.cart.service.CartService;
import com.stlabs.ecommerce.category.entity.Category;
import com.stlabs.ecommerce.category.repository.CategoryRepository;
import com.stlabs.ecommerce.order.dto.CreateOrderRequest;
import com.stlabs.ecommerce.order.dto.OrderResponse;
import com.stlabs.ecommerce.order.entity.OrderStatus;
import com.stlabs.ecommerce.order.service.OrderService;
import com.stlabs.ecommerce.product.entity.Product;
import com.stlabs.ecommerce.product.repository.ProductRepository;
import com.stlabs.ecommerce.role.entity.Role;
import com.stlabs.ecommerce.role.repository.RoleRepository;
import com.stlabs.ecommerce.user.entity.User;
import com.stlabs.ecommerce.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class CartOrderServiceIntegrationTests {

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addToCartAndPlaceOrderUpdatesTotalsAndStock() {
        Product product = createAuthenticatedCustomerAndProduct();

        CartResponse cart = cartService.addItem(new CartItemRequest(product.getId(), 2));
        assertEquals(2, cart.totalItems());
        assertEquals(3000.0, cart.totalAmount());

        OrderResponse order = orderService.placeOrder(new CreateOrderRequest("123 College Road, Jaipur"));
        assertNotNull(order.id());
        assertEquals(OrderStatus.PENDING, order.status());
        assertEquals(3000.0, order.totalAmount());
        assertEquals(1, order.items().size());

        Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(8, updatedProduct.getStockQuantity());
    }

    @Test
    void cancellingOrderRestoresProductStock() {
        Product product = createAuthenticatedCustomerAndProduct();

        cartService.addItem(new CartItemRequest(product.getId(), 3));
        OrderResponse order = orderService.placeOrder(new CreateOrderRequest("456 Market Street, Delhi"));
        OrderResponse cancelled = orderService.cancelOrder(order.id());

        assertEquals(OrderStatus.CANCELLED, cancelled.status());

        Product restoredProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(10, restoredProduct.getStockQuantity());
    }

    private Product createAuthenticatedCustomerAndProduct() {
        Role customerRole = roleRepository.findByName(SecurityConstants.ROLE_CUSTOMER).orElseThrow();

        User user = new User();
        user.setFirstName("Test");
        user.setLastName("Customer");
        user.setEmail("customer" + System.nanoTime() + "@example.com");
        user.setPassword(passwordEncoder.encode("Password@123"));
        user.setRole(customerRole);
        user = userRepository.save(user);

        AuthenticatedUser principal = new AuthenticatedUser(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        Category category = new Category();
        category.setName("Testing-" + System.nanoTime());
        category.setDescription("Testing category");
        category = categoryRepository.save(category);

        Product product = new Product();
        product.setName("Testing Product " + System.nanoTime());
        product.setDescription("A product used in tests");
        product.setPrice(1500.0);
        product.setStockQuantity(10);
        product.setCategory(category);
        return productRepository.save(product);
    }
}
