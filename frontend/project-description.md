## Week 1 - Day 1: Project Planning & Architecture

Before writing a single line of code we should:

1. What business problem are wee solving?
2. How user interact with the system?
3. What modules are required
4. How data flows through the system?
5. How the system will scale later?

### 1. E-commerce Business Flow (Amazon, Flipkart, Myntra)

#### Actors

#### Customer

- Register
- Login
- Browse Products
- Search Products
- Add to Cart
- Place Order
- View Order History

#### Admin

- Login
- Manage products
- Manage categories
- Manage inventory
- Manage orders
- Manage users

#### Customer Flow

Register -> Login -> Browse Products -> View Product -> Add to Cart -> Checkout -> Place Order -> Order history

#### Admin Flow

Login -> Dashboard -> Manage Categories -> Manage Products -> Manage Orders -> Manage Users

### 2. System Design Overview

For a 1-month project, use a Monolithic Architecture

#### High-level Architecture (HLD)

React Frontend -> Send Request -> Spring Boot API -> MySQL DB -> Spring Boot API -> Send Response -> React Frontend

#### Backend Internal Architecture

Controller -> Service -> Repository -> Database

#### Why this Architecture

benefits:

- Easy to understand
- Industry standard
- Good for internship
- Easy to deploy
- Easy to convert into microservices later

### 3. Monolith Vs Microservices

#### Monolith Architecture

Everything in one application
user, product, category, cart, order,security

Single deployment
ecommerce.jar

##### Advantages

- Easy Development
- Easy Debugging
- Easy Deployment
- Perfect for learning

##### Disadvantages

- Harder to scale large system
- Large codebase over time

#### Microservices Architecture

Separate Services.
user-service
product-service
cart-service
order-service
notification-service

Each service:
Own Database
Own Deployment
Own Team

##### Advantages

- Independent Scaling
- Independent Deployment
- Better for large companies

##### Disadvantages

- Complex
- Distributed system challenges
- Service Communication
- Monitoring Complexity

##### We are choosing Monolith!

- Spring Boot
- React
- Security
- Database Design
- Docker

---

---

---

## Layered Architecture

A common mistake done by beginners:

```java
@RestController
public class ProductController {
    // validation
    // business logic
    // db Call
}
```

#### Correct Architecture

Controller -> Service -> Repository -> Database

Example:

Client -> POST /products -> ProductController -> ProductService -> ProductRepository -> MySQL

#### ControllerLayer

handle

- HTTP Request
- HTTP Response
- Request Validation

never put business logic here

#### ServiceLayer

handle

- Business logic
- Calculations
- Workflow

Example: Calculate Discount, Validate Stock, Place Order, Check Inventory

#### RepositoryLayer

handle

- Database interaction

never put business logic here

#### DTO Layer

DTO = Data transfer Object
Used to transfer data between client and server

## Database

### First: Understand Business

Think about what data an Ecommerce Website need

#### User

Rahul, Ajay, Vishal
Name, email, password, Role

#### Category

Electronics, Fashion, Books

#### Product

IPhone, MacBook, T-Shirt

#### Product Image

One Product can have multiple images
iphone Front, iphone back, iphone side

#### Cart

Temporary Shopping Basket

#### Order

When user Checks out

#### Order Items

Store products inside an order

## Relationships

#### USER -> ROLE

Many Users can have the Same Role
ROLE 1 --- \* Users

#### CATEGORY -> PRODUCT

One Category contains many Products
CATEGORY 1 --- \* PRODUCT

#### PRODUCT -> PRODUCT_IMAGE

One Product contains many Products images
PRODUCT 1 --- \* PRODUCT_IMAGE

#### USER -> CART

One User can have one Cart
USER 1 --- 1 CART

#### CART -> CART_ITEM

One Cart contains many Cart Items
CART 1 --- \* CART_ITEM

#### USER -> ORDER

One User can place many order
USER 1 --- \* ORDER

#### ORDER -> ORDER_ITEM

One Order can contain many Order items
ORDER 1 --- \* ORDER_ITEM
