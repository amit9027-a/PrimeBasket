# E-Commerce Backend Flow

1. Project structure
2. Application startup flow
3. Request flow inside Spring Boot
4. Security and JWT flow
5. Business modules flow
6. Database layer flow
7. Error handling flow
8. Overall end-to-end example

---

## 1. Project Structure

Inside the backend, the main Java code is present in:

`src/main/java/com/stlabs/ecommerce`

The resources are inside:

`src/main/resources`

The tests are inside:

`src/test`

### `auth`

Here I keep everything related to authentication and login flow.

- `controller`  
  Handles auth endpoints like register and login.
- `dto`  
  Contains request and response objects for auth APIs.
- `security`  
  Contains JWT classes, security filter, custom user details, and security helpers.
- `service`  
  Contains the actual business logic for register and login.

### `cart`

Here I manage shopping cart functionality.

- `controller`  
  Exposes cart APIs.
- `dto`  
  Defines cart request and response models.
- `entity`  
  Defines `Cart` and `CartItem`.
- `repository`  
  Handles cart database access.
- `service`  
  Contains cart business logic.

### `category`

This package manages product categories.

- `controller`
- `dto`
- `entity`
- `repository`
- `service`

This is a very standard Spring Boot module structure, and I always tell students to notice this pattern because it repeats in real projects.

### `common`

This package contains common reusable backend pieces.

- `controller/HealthController`  
  Simple health-check endpoint.
- `entity/BaseEntity`  
  Common fields like `id`, `createdAt`, and `updatedAt`.
- `security/CurrentUserService`  
  Helper to get the currently logged-in user from the security context.

### `config`

This package contains project-wide configuration.

- `SecurityConfig`  
  Main Spring Security rules.
- `CorsConfig`  
  Controls frontend-backend CORS access.
- `CloudinaryConfig`  
  Configures Cloudinary bean.
- `OpenApiConfig`  
  Swagger/OpenAPI setup.
- `DataInitializer`  
  Seeds roles, admin user, categories, and sample products at startup.

### `exception`

This package handles exceptions in a clean centralized way.

- `GlobalExceptionHandler`
- `ResourceNotFoundException`
- `EmailAlreadyExistsException`
- `ApiErrorResponse`

### `order`

This module manages checkout and orders.

- `controller`
- `dto`
- `entity`
- `repository`
- `service`

### `product`

This module manages products and product images.

- `controller`
- `dto`
- `entity`
- `repository`
- `service`

### `role`

This package stores role-related data like `ROLE_ADMIN` and `ROLE_CUSTOMER`.

### `storage`

This package is responsible for image upload abstraction.

- `dto/StoredImage`
- `service/ImageStorageService`
- `service/CloudinaryImageStorageService`

This is a nice design because the product module does not directly depend on Cloudinary details. It talks to an interface, and the Cloudinary service implements it.

### `user`

This package manages users.

- `controller`
- `dto`
- `entity`
- `repository`
- `service`

---

## 2. Application Startup Flow

When I run the backend, the entry point is:

`EcommerceApplication.java`

This class starts Spring Boot. It also enables JPA auditing, so fields like `createdAt` and `updatedAt` can be managed automatically.

After the app starts, Spring scans all components and creates beans for controllers, services, repositories, and configuration classes.

Then an important startup bean runs:

`DataInitializer`

I want you to understand this part carefully.

When the app starts, `DataInitializer` does the following:

1. Checks whether roles exist.
2. Creates `ROLE_ADMIN` if missing.
3. Creates `ROLE_CUSTOMER` if missing.
4. Creates a default admin user if not present.
5. Optionally seeds sample categories and products.

So before I even send my first API request, the backend already prepares important base data.

---

## 3. How a Request Flows in This Backend

Now let me explain the most important Spring Boot idea:

Whenever a request comes, it usually follows this path:

**Client -> Controller -> Service -> Repository -> Database**

Then the response comes back in reverse order.

Let me explain each layer in my own words.

### Controller

The controller is the entry gate. It receives HTTP requests.

Example:

- `ProductController`
- `CategoryController`
- `CartController`
- `OrderController`
- `AuthController`

The controller should stay thin. Its job is to:

1. Receive request data
2. Validate request body
3. Call the correct service
4. Return response

### Service

The service contains the business logic.

This is where I write actual backend thinking like:

- find the product
- check stock
- verify user role
- place order
- upload image
- update cart

Examples:

- `ProductServiceImpl`
- `OrderServiceImpl`
- `CartServiceImpl`
- `AuthServiceImpl`

### Repository (SQL Query)

The repository talks to the database using Spring Data JPA.

Here I do operations like:

- `findById`
- `findAll`
- `save`
- `delete`
- custom queries like `findByUserId`

Examples:

- `ProductRepository`
- `OrderRepository`
- `CartRepository`
- `UserRepository`

### Entity

The entity is the Java class that maps to a database table.

Examples:

- `User`
- `Product`
- `Category`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Role`
- `ProductImage`

---

## 4. Security and JWT Flow

Now I want to explain the security flow because this is one of the most important parts of the project.

### SecurityConfig

The main security rules are inside:

`SecurityConfig`

Here I configure:

- stateless session management
- JWT filter
- custom authentication provider
- password encoder
- route access rules

This backend does **not** use session-based login. It uses **JWT authentication**.

That means:

1. User logs in once
2. Backend returns a token
3. Frontend sends that token in the `Authorization` header
4. Backend verifies the token on every protected request

### Login Flow

The login flow works like this:

1. User sends email and password to `AuthController`
2. `AuthServiceImpl` authenticates the user using Spring Security
3. `CustomUserDetailsService` loads the user from database
4. Password is checked using `BCryptPasswordEncoder`
5. If valid, `JwtService` generates a token
6. Backend returns `AuthResponse`

### Register Flow

The register flow is similar:

1. Frontend sends registration data
2. `AuthServiceImpl` checks if email already exists
3. Password is encoded
4. User is saved with `ROLE_CUSTOMER`
5. JWT token is generated immediately
6. Response is sent back

### JWT Filter Flow

This is where many students get confused, so let me simplify it.

The class:

`JwtAuthenticationFilter`

intercepts requests before they reach controllers.

It does this:

1. Reads the `Authorization` header
2. Checks whether it starts with `Bearer `
3. Extracts the JWT token
4. Uses `JwtService` to extract the username
5. Loads user details using `CustomUserDetailsService`
6. Validates the token
7. If valid, sets authentication inside Spring Security context

Once the user is inside the security context, the backend knows:

- who the user is
- what role the user has

That is why `CurrentUserService` can later fetch the logged-in user.

### Roles and Authorization

This backend mainly uses:

- `ROLE_ADMIN`
- `ROLE_CUSTOMER`

Examples of route access:

- public:
  - `/health`
  - auth APIs
  - GET categories
  - GET products
- authenticated:
  - cart APIs
  - order APIs
  - `/users/me`
- admin only:
  - category create/update/delete
  - product create/update/delete
  - image upload/delete
  - `/users/**`

One thing I would point out to students is that `SecurityConfig` currently ends with `anyRequest().permitAll()`, which is more open than a stricter production setup. In a fully locked production system, we often use `anyRequest().authenticated()`.

---

## 5. Business Module Flow

Now let me explain each business module as if I am walking through the app.

### A. Category Flow

Category flow starts from:

`CategoryController`

Then moves to:

`CategoryServiceImpl`

Then to:

`CategoryRepository`

Category operations:

- create category
- get all categories
- get category by id
- update category
- delete category

Important logic:

- category name is validated for uniqueness
- category deletion is blocked if products still belong to it

This is a good example of business validation happening in the service layer, not in the controller.

### B. Product Flow

Product flow starts from:

`ProductController`

Then:

`ProductServiceImpl`

Then:

`ProductRepository`

Product operations:

- create product
- get single product
- get all products
- update product
- delete product

The product is connected to:

- one `Category`
- many `ProductImage`

### C. Product Image Upload Flow

This is one of the more interesting backend flows.

When I upload a product image:

1. Request reaches `ProductController`
2. Controller calls `ProductServiceImpl.uploadImage`
3. Service finds the product
4. Service calls `ImageStorageService`
5. Actual implementation is `CloudinaryImageStorageService`
6. Cloudinary uploads the file
7. Returned URL and public ID are stored in `ProductImage`
8. Image is linked back to the product

This is a nice layered design because if one day I want AWS S3 instead of Cloudinary, I can replace the implementation without changing the product business logic too much.

### D. Cart Flow

The cart module is handled by:

- `CartController`
- `CartServiceImpl`
- `CartRepository`
- `CartItemRepository`

Cart operations:

- get current cart
- add item
- update item quantity
- remove item
- clear cart

Now let me explain the logic.

When a logged-in user adds an item to cart:

1. `CurrentUserService` gets the logged-in user
2. Cart is fetched or created
3. Product is fetched
4. Existing cart item is checked
5. Quantity is updated or item is created
6. Stock validation is performed
7. Response is built with totals

The response includes:

- cart items
- total item count
- total amount

This is a good example of service-layer computation.

### E. Order Flow

The order module is handled by:

- `OrderController`
- `OrderServiceImpl`
- `OrderRepository`

Order operations:

- place order from cart
- list orders
- get order by id
- update order status
- cancel order

Now let me explain checkout.

When the user places an order:

1. Backend gets current user
2. Backend fetches the cart
3. Backend verifies cart is not empty
4. Backend loops through cart items
5. Backend checks stock for each product
6. Backend reduces product stock
7. Backend creates `OrderItem` records
8. Backend calculates total amount
9. Backend saves the order
10. Backend clears the cart

This is the real heart of the e-commerce flow.

### F. Order Cancellation Flow

If an order is cancelled:

1. Backend checks whether order is cancellable
2. If already shipped or delivered, cancellation is blocked
3. If valid, backend restores stock
4. Order status becomes `CANCELLED`

This is a very important business rule example. It shows that service logic is not just CRUD. It also protects business correctness.

### G. User Flow

The user module is lightweight here.

`UserController` mainly exposes:

- get all users
- get current logged-in user

Admin can list users, and authenticated users can get their own profile through `/users/me`.

---

## 6. Database Layer Flow

This project uses Spring Data JPA and MySQL in the main environment.

Configuration is stored in:

`src/main/resources/application.properties`

Important properties include:

- datasource URL
- username
- password
- JPA settings
- JWT settings
- Cloudinary settings
- bootstrap settings

The entities extend `BaseEntity`, which provides:

- `id`
- `createdAt`
- `updatedAt`

This avoids duplication across all entities.

Now let me explain relationships quickly:

- `User` -> many-to-one with `Role`
- `Product` -> many-to-one with `Category`
- `Product` -> one-to-many with `ProductImage`
- `Cart` -> one-to-one with `User`
- `Cart` -> one-to-many with `CartItem`
- `CartItem` -> many-to-one with `Product`
- `Order` -> many-to-one with `User`
- `Order` -> one-to-many with `OrderItem`
- `OrderItem` -> many-to-one with `Product`

When students understand relationships, they understand why repositories and services behave the way they do.

---

## 7. Error Handling Flow

Instead of writing try-catch in every controller, this project uses:

`GlobalExceptionHandler`

This class catches exceptions globally and converts them into clean API responses.

Examples:

- `ResourceNotFoundException` -> 404
- `EmailAlreadyExistsException` -> 409
- validation errors -> 400
- invalid credentials -> 401
- illegal arguments -> 400
- illegal state -> 500

This is a good backend practice because it keeps controllers clean and gives consistent error output to the frontend.

---

## 8. OpenAPI / Swagger Flow

This project also includes:

`OpenApiConfig`

This sets up Swagger documentation.

Why is this useful?

Because when I teach APIs, I want students to:

1. understand the endpoint
2. see request/response structure
3. test the API easily

So Swagger becomes a learning tool as well as a development tool.

---

## 9. Storage Flow with Cloudinary

Cloudinary integration is configured through:

- `CloudinaryConfig`
- `CloudinaryImageStorageService`

The app reads credentials from properties or environment variables.

Flow:

1. Image file comes from frontend
2. Service checks whether Cloudinary is configured
3. File is uploaded
4. URL and public ID are returned
5. Data is saved in database

If Cloudinary is not configured, the backend throws a clear error.

This is a good example of integrating a third-party service into a Spring Boot project.

---

## 10. Testing Flow

Inside `src/test`, there are tests that validate:

- application startup
- auth and docs integration
- cart and order business flow

Why is this important?

Because testing confirms that:

- login works
- OpenAPI endpoint works
- cart totals are correct
- stock reduces when ordering
- stock restores on cancellation

So the tests are not just checking syntax. They are checking business correctness.

---

## 11. Full End-to-End Example

Now let me explain the full backend story using one real scenario.

### Scenario: Customer buys a product

#### Step 1: Admin creates category

- Request hits `CategoryController`
- Service validates and saves category
- Repository stores it in database

#### Step 2: Admin creates product

- Request hits `ProductController`
- Service checks category
- Product is saved

#### Step 3: Admin uploads product image

- Request hits `ProductController`
- Service uploads image to Cloudinary
- URL is saved in `ProductImage`

#### Step 4: Customer registers

- Request hits `AuthController`
- Service creates user with encoded password
- User gets `ROLE_CUSTOMER`
- JWT token is returned

#### Step 5: Customer logs in

- Auth manager verifies credentials
- JWT token is generated
- Frontend stores the token

#### Step 6: Customer views products

- GET products is public
- `ProductController` returns product list with image and category data

#### Step 7: Customer adds item to cart

- JWT filter authenticates user
- Cart service gets current user
- Product is added to cart
- Totals are calculated

#### Step 8: Customer places order

- Order service checks cart
- Validates stock
- Deducts stock
- Creates order and order items
- Clears cart

#### Step 9: Customer checks orders

- Order controller fetches only that user’s orders
- Admin can view all orders

#### Step 10: Admin updates order status

- Admin moves order from `PENDING` to `CONFIRMED`, `SHIPPED`, or `DELIVERED`

That is the complete backend business journey.

---

## 12. What I Want Students to Learn from This Backend

If I were teaching this project in class, I would want you to observe these lessons:

### A. Package structure matters

This backend is organized by feature and responsibility, which makes scaling easier.

### B. Controllers should be thin

Controllers receive and return data, but business rules stay in services.

### C. Services are the real brain

Stock validation, cart logic, order placement, and cancellation all happen in service classes.

### D. Repositories should stay simple

Repositories should focus on database access, not business decisions.

### E. JWT makes APIs stateless

This is how modern frontend-backend apps often work.

### F. DTOs protect the API layer

We do not directly expose entity objects everywhere. We shape request and response data properly.

### G. Global exception handling is important

A backend should fail gracefully and consistently.

### H. Third-party integrations should be abstracted

Cloudinary is wrapped behind a storage service interface.
