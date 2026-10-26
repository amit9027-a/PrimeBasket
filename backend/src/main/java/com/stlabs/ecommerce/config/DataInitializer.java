package com.stlabs.ecommerce.config;

import com.stlabs.ecommerce.auth.security.SecurityConstants;
import com.stlabs.ecommerce.category.entity.Category;
import com.stlabs.ecommerce.category.repository.CategoryRepository;
import com.stlabs.ecommerce.product.entity.Product;
import com.stlabs.ecommerce.product.entity.ProductImage;
import com.stlabs.ecommerce.product.repository.ProductRepository;
import com.stlabs.ecommerce.role.entity.Role;
import com.stlabs.ecommerce.role.repository.RoleRepository;
import com.stlabs.ecommerce.user.entity.User;
import com.stlabs.ecommerce.user.repository.UserRepository;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Value("${app.bootstrap.admin.email}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password}")
    private String adminPassword;

    @Value("${app.bootstrap.admin.first-name}")
    private String adminFirstName;

    @Value("${app.bootstrap.admin.last-name}")
    private String adminLastName;

    @Value("${app.bootstrap.seed-sample-data:true}")
    private boolean seedSampleData;

    @Bean
    CommandLineRunner seedSecurityData() {
        return args -> {
            Role adminRole = roleRepository.findByName(SecurityConstants.ROLE_ADMIN)
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName(SecurityConstants.ROLE_ADMIN);
                        return roleRepository.save(role);
                    });

            roleRepository.findByName(SecurityConstants.ROLE_CUSTOMER)
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName(SecurityConstants.ROLE_CUSTOMER);
                        return roleRepository.save(role);
                    });

            if (!userRepository.existsByEmail(adminEmail.toLowerCase())) {
                User admin = new User();
                admin.setFirstName(adminFirstName);
                admin.setLastName(adminLastName);
                admin.setEmail(adminEmail.toLowerCase());
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(adminRole);
                userRepository.save(admin);
            }

            if (seedSampleData && categoryRepository.count() == 0 && productRepository.count() == 0) {
                seedCatalog();
            }
        };
    }

    private void seedCatalog() {
        Category electronics = new Category();
        electronics.setName("Electronics");
        electronics.setDescription("Phones, accessories, and everyday gadgets");
        electronics = categoryRepository.save(electronics);

        Category fashion = new Category();
        fashion.setName("Fashion");
        fashion.setDescription("Shoes, clothing, and style essentials");
        fashion = categoryRepository.save(fashion);

        Category home = new Category();
        home.setName("Home & Kitchen");
        home.setDescription("Furniture and kitchen essentials");
        home = categoryRepository.save(home);

        Category books = new Category();
        books.setName("Books");
        books.setDescription("Educational and entertainment books");
        books = categoryRepository.save(books);

        Category sports = new Category();
        sports.setName("Sports");
        sports.setDescription("Fitness and outdoor equipment");
        sports = categoryRepository.save(sports);

        // Electronics
        productRepository.save(createProduct(
                "Wireless Headphones",
                "Noise-isolating headphones with long battery life",
                2499.0,
                25,
                electronics,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"));

        productRepository.save(createProduct(
                "Bluetooth Speaker",
                "Portable waterproof speaker with deep bass",
                1799.0,
                35,
                electronics,
                "https://images.unsplash.com/photo-1589003077984-894e133dabab"));

        productRepository.save(createProduct(
                "Smart Watch",
                "Fitness tracking smartwatch with AMOLED display",
                4999.0,
                20,
                electronics,
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30"));

        productRepository.save(createProduct(
                "Gaming Mouse",
                "RGB gaming mouse with programmable buttons",
                1299.0,
                50,
                electronics,
                "https://images.unsplash.com/photo-1527814050087-3793815479db"));

        productRepository.save(createProduct(
                "Mechanical Keyboard",
                "RGB mechanical keyboard with blue switches",
                3499.0,
                30,
                electronics,
                "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae"));

        productRepository.save(createProduct(
                "USB-C Power Bank",
                "20000mAh fast charging power bank",
                2299.0,
                45,
                electronics,
                "https://images.unsplash.com/photo-1609592806787-3d9f8d4f0d44"));

        // Fashion
        productRepository.save(createProduct(
                "Classic White Sneakers",
                "Comfortable sneakers for daily wear",
                1999.0,
                40,
                fashion,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff"));

        productRepository.save(createProduct(
                "Denim Jacket",
                "Premium slim fit denim jacket",
                2799.0,
                25,
                fashion,
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518"));

        productRepository.save(createProduct(
                "Cotton T-Shirt",
                "Soft breathable cotton t-shirt",
                599.0,
                100,
                fashion,
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"));

        productRepository.save(createProduct(
                "Leather Wallet",
                "Genuine leather wallet with RFID protection",
                999.0,
                60,
                fashion,
                "https://images.unsplash.com/photo-1627123424574-724758594e93"));

        productRepository.save(createProduct(
                "Running Shoes",
                "Lightweight running shoes with cushioned sole",
                3499.0,
                28,
                fashion,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff"));

        // Home & Kitchen
        productRepository.save(createProduct(
                "Coffee Maker",
                "Automatic coffee maker with timer",
                3999.0,
                18,
                home,
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"));

        productRepository.save(createProduct(
                "Air Fryer",
                "Healthy oil-free air fryer",
                5999.0,
                15,
                home,
                "https://images.unsplash.com/photo-1585515656973-94b8d6ef0f26"));

        productRepository.save(createProduct(
                "Office Chair",
                "Ergonomic office chair with lumbar support",
                7499.0,
                10,
                home,
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"));

        productRepository.save(createProduct(
                "Table Lamp",
                "Modern LED desk lamp",
                1499.0,
                40,
                home,
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"));

        // Books
        productRepository.save(createProduct(
                "Clean Code",
                "A Handbook of Agile Software Craftsmanship",
                899.0,
                50,
                books,
                "https://images.unsplash.com/photo-1512820790803-83ca734da794"));

        productRepository.save(createProduct(
                "Spring Boot in Action",
                "Comprehensive Spring Boot guide",
                1099.0,
                30,
                books,
                "https://images.unsplash.com/photo-1512820790803-83ca734da794"));

        productRepository.save(createProduct(
                "Atomic Habits",
                "Build good habits and break bad ones",
                699.0,
                80,
                books,
                "https://images.unsplash.com/photo-1512820790803-83ca734da794"));

        // Sports
        productRepository.save(createProduct(
                "Yoga Mat",
                "Non-slip exercise yoga mat",
                999.0,
                70,
                sports,
                "https://images.unsplash.com/photo-1518611012118-696072aa579a"));

        productRepository.save(createProduct(
                "Football",
                "Professional size 5 football",
                899.0,
                45,
                sports,
                "https://images.unsplash.com/photo-1517466787929-bc90951d0974"));

        productRepository.save(createProduct(
                "Adjustable Dumbbells",
                "20kg adjustable dumbbell set",
                6499.0,
                12,
                sports,
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438"));

        productRepository.save(createProduct(
                "Cricket Bat",
                "English willow cricket bat",
                4599.0,
                20,
                sports,
                "https://images.unsplash.com/photo-1547347298-4074fc3086f0"));
    }

    private Product createProduct(
            String name,
            String description,
            Double price,
            int stock,
            Category category,
            String imageUrl) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStockQuantity(stock);
        product.setCategory(category);
        product.setImages(new ArrayList<>());

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(imageUrl);
        image.setPublicId("seed-" + name.toLowerCase().replace(" ", "-"));
        image.setPrimaryImage(true);
        product.getImages().add(image);

        return product;
    }
}
