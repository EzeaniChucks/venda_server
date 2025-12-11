# VENDA API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+234xxxxxxxxxx",
  "role": "customer",  // customer | vendor | rider | admin
  "businessData": {    // Required only for vendors
    "business_name": "My Store",
    "business_description": "Fashion store",
    "business_phone": "+234xxxxxxxxxx"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Default Admin Credentials:**
- Email: `admin@venda.com`
- Password: `admin123`

### Get Profile
```http
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "full_name": "John Doe",
  "phone": "+234xxxxxxxxxx",
  "avatar_url": "https://...",
  "profileData": {
    "address": "123 Street",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postal_code": "100001",
    "date_of_birth": "1990-01-01",
    "gender": "male"
  }
}
```

---

## 🛍️ Product Endpoints

### Get All Products
```http
GET /api/products?gender=women&category=dresses&page=1&limit=20
```

**Query Parameters:**
- `gender`: women | men | kids | unisex
- `category`: Category slug
- `search`: Search term
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `isFeatured`: true | false
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Get Product by ID
```http
GET /api/products/:id
```

### Create Product (Vendor Only)
```http
POST /api/products
Headers: Authorization: Bearer <vendor_token>
```

**Body:**
```json
{
  "category_id": "uuid",
  "name": "Summer Dress",
  "description": "Beautiful summer dress",
  "price": 25000,
  "discount_price": 20000,
  "stock_quantity": 50,
  "gender": "women",
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["#FF0000", "#00FF00"],
  "images": ["url1", "url2"]
}
```

### Update Product (Vendor Only)
```http
PUT /api/products/:id
Headers: Authorization: Bearer <vendor_token>
```

### Delete Product (Vendor Only)
```http
DELETE /api/products/:id
Headers: Authorization: Bearer <vendor_token>
```

### Add Review (Customer Only)
```http
POST /api/products/:id/reviews
Headers: Authorization: Bearer <customer_token>
```

**Body:**
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```

---

## 🛒 Cart Endpoints (Customer Only)

### Get Cart
```http
GET /api/cart
Headers: Authorization: Bearer <customer_token>
```

### Add to Cart
```http
POST /api/cart
Headers: Authorization: Bearer <customer_token>
```

**Body:**
```json
{
  "product_id": "uuid",
  "quantity": 2,
  "size": "M",
  "color": "#FF0000"
}
```

### Update Cart Item
```http
PUT /api/cart/:id
Headers: Authorization: Bearer <customer_token>
```

**Body:**
```json
{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /api/cart/:id
Headers: Authorization: Bearer <customer_token>
```

### Clear Cart
```http
DELETE /api/cart
Headers: Authorization: Bearer <customer_token>
```

---

## 💝 Wishlist Endpoints (Customer Only)

### Get Wishlist
```http
GET /api/wishlist
Headers: Authorization: Bearer <customer_token>
```

### Add to Wishlist
```http
POST /api/wishlist
Headers: Authorization: Bearer <customer_token>
```

**Body:**
```json
{
  "product_id": "uuid"
}
```

### Remove from Wishlist
```http
DELETE /api/wishlist/:id
Headers: Authorization: Bearer <customer_token>
```

### Check if in Wishlist
```http
GET /api/wishlist/check/:productId
Headers: Authorization: Bearer <customer_token>
```

---

## 📦 Order Endpoints

### Create Order (Customer)
```http
POST /api/orders
Headers: Authorization: Bearer <customer_token>
```

**Body:**
```json
{
  "delivery_address": "123 Main Street",
  "delivery_city": "Lagos",
  "delivery_state": "Lagos",
  "delivery_postal_code": "100001",
  "delivery_phone": "+234xxxxxxxxxx",
  "delivery_notes": "Please call before delivery",
  "payment_method": "wallet"  // wallet | card | transfer | cash
}
```

### Get User Orders
```http
GET /api/orders?status=pending&page=1&limit=10
Headers: Authorization: Bearer <customer_token>
```

**Query Parameters:**
- `status`: pending | confirmed | processing | shipped | out_for_delivery | delivered | cancelled
- `page`: Page number
- `limit`: Items per page

### Get Order by ID
```http
GET /api/orders/:id
Headers: Authorization: Bearer <customer_token>
```

### Cancel Order
```http
POST /api/orders/:id/cancel
Headers: Authorization: Bearer <customer_token>
```

**Body:**
```json
{
  "reason": "Changed my mind"
}
```

### Get Vendor Orders
```http
GET /api/orders/vendor/all?status=pending
Headers: Authorization: Bearer <vendor_token>
```

### Update Order Item Status (Vendor)
```http
PUT /api/orders/vendor/items/:id
Headers: Authorization: Bearer <vendor_token>
```

**Body:**
```json
{
  "status": "accepted"  // pending | accepted | rejected | preparing | ready
}
```

---

## 💰 Wallet Endpoints

### Get Wallet Balance
```http
GET /api/wallet
Headers: Authorization: Bearer <token>
```

### Get Transactions
```http
GET /api/wallet/transactions?type=deposit&page=1&limit=20
Headers: Authorization: Bearer <token>
```

**Query Parameters:**
- `type`: deposit | withdrawal | refund | payment | commission
- `page`: Page number
- `limit`: Items per page

### Fund Wallet
```http
POST /api/wallet/fund
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 50000,
  "method": "Bank Transfer"
}
```

### Withdraw from Wallet
```http
POST /api/wallet/withdraw
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 20000,
  "recipient": "John Doe",
  "account_number": "0123456789",
  "bank_name": "First Bank"
}
```

---

## 📰 News Endpoints

### Get All Articles
```http
GET /api/news?category=fashion&page=1&limit=10
```

**Query Parameters:**
- `category`: Article category
- `page`: Page number
- `limit`: Items per page

### Get Article by ID or Slug
```http
GET /api/news/:idOrSlug
```

### Create Article (Admin Only)
```http
POST /api/news
Headers: Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "title": "Fashion Trends 2024",
  "slug": "fashion-trends-2024",
  "excerpt": "Brief description",
  "content": "Full article content",
  "featured_image": "https://...",
  "category": "Fashion",
  "tags": ["trends", "2024"]
}
```

### Publish Article (Admin Only)
```http
POST /api/news/:id/publish
Headers: Authorization: Bearer <admin_token>
```

---

## 👗 Fashion Models Endpoints

### Get All Models
```http
GET /api/models
```

### Get Model by ID
```http
GET /api/models/:id
```

### Create Model (Admin Only)
```http
POST /api/models
Headers: Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "name": "Model Name",
  "bio": "Model biography",
  "image_url": "https://...",
  "instagram_handle": "@modelname",
  "portfolio_images": ["url1", "url2"],
  "specialties": ["runway", "editorial"]
}
```

### Update Model (Admin Only)
```http
PUT /api/models/:id
Headers: Authorization: Bearer <admin_token>
```

### Delete Model (Admin Only)
```http
DELETE /api/models/:id
Headers: Authorization: Bearer <admin_token>
```

---

## 🏥 Health Check

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]  // Optional validation errors
}
```

---

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Schema

The database includes the following tables:
- **users** - All user accounts (customer, vendor, rider, admin)
- **customer_profiles** - Customer-specific data
- **vendor_profiles** - Vendor-specific data
- **rider_profiles** - Rider-specific data
- **categories** - Product categories
- **products** - Product catalog
- **product_reviews** - Product ratings and reviews
- **cart_items** - Shopping cart items
- **wishlist_items** - Wishlist items
- **orders** - Customer orders
- **order_items** - Individual items in orders
- **wallets** - User wallet balances
- **wallet_transactions** - Transaction history
- **news_articles** - Blog/news content
- **fashion_models** - Fashion model profiles
- **notifications** - User notifications

---

## Getting Started

1. **Initialize Database:**
```bash
npm run db:init
```

2. **Start API Server:**
```bash
npm run server
```

3. **Start Frontend:**
```bash
npm start
```

4. **Login as Admin:**
- Email: `admin@venda.com`
- Password: `admin123`

---

## Future Rider & Admin Features

### Rider Endpoints (To Be Implemented)
- Accept/reject delivery assignments
- Update delivery status
- Update location tracking
- View earnings and delivery history

### Admin Endpoints (To Be Implemented)
- User management (activate/deactivate users)
- Product approval/rejection
- View analytics and reports
- Manage categories
- View all orders and transactions
- Content management

---

## Notes

- All timestamps are in UTC
- All monetary amounts are in Naira (₦)
- Product images should be array of URLs
- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Wallet transactions are atomic (use database transactions)
- Order creation automatically deducts from product stock
- Free delivery for orders above ₦50,000
