# VENDA API Endpoints Documentation

Base URL: `http://localhost:3000/api`

## Authentication Endpoints
**Base**: `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user (customer/vendor/rider) | No |
| POST | `/login` | Login user | No |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |

## Customer Endpoints

### Products
**Base**: `/api/products`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all products (with filters) | No |
| GET | `/:id` | Get single product details | No |
| GET | `/categories/:id` | Get products by category | No |
| GET | `/search` | Search products by query | No |

### Cart
**Base**: `/api/cart`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's cart | Yes (Customer) |
| POST | `/` | Add item to cart | Yes (Customer) |
| PUT | `/:id` | Update cart item quantity | Yes (Customer) |
| DELETE | `/:id` | Remove item from cart | Yes (Customer) |
| DELETE | `/` | Clear entire cart | Yes (Customer) |

### Wishlist
**Base**: `/api/wishlist`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's wishlist | Yes (Customer) |
| POST | `/` | Add product to wishlist | Yes (Customer) |
| DELETE | `/:id` | Remove from wishlist | Yes (Customer) |

### Orders
**Base**: `/api/orders`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's orders | Yes (Customer) |
| GET | `/:id` | Get single order details | Yes (Customer) |
| POST | `/` | Create new order | Yes (Customer) |
| PUT | `/:id/cancel` | Cancel order | Yes (Customer) |

### Wallet
**Base**: `/api/wallet`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/balance` | Get wallet balance | Yes (Customer) |
| POST | `/fund` | Add funds to wallet | Yes (Customer) |
| POST | `/withdraw` | Withdraw from wallet | Yes (Customer) |
| GET | `/transactions` | Get transaction history | Yes (Customer) |

### News
**Base**: `/api/news`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all news articles | No |
| GET | `/:id` | Get single news article | No |

### Models
**Base**: `/api/models`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all fashion models | No |
| GET | `/:id` | Get single model details | No |

## Vendor Endpoints
**Base**: `/api/vendor`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get vendor dashboard stats | Yes (Vendor) |
| GET | `/profile` | Get vendor profile | Yes (Vendor) |
| PUT | `/profile` | Update vendor profile | Yes (Vendor) |
| GET | `/products` | Get vendor's products | Yes (Vendor) |
| GET | `/orders` | Get vendor's orders | Yes (Vendor) |
| PUT | `/orders/items/:id` | Update order item status | Yes (Vendor) |

**Vendor Order Item Status**: `accepted`, `rejected`, `preparing`, `ready`

## Rider Endpoints
**Base**: `/api/rider`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/deliveries/available` | Get available deliveries | Yes (Rider) |
| GET | `/deliveries` | Get rider's deliveries | Yes (Rider) |
| POST | `/deliveries/accept` | Accept delivery | Yes (Rider) |
| PUT | `/deliveries/:id/status` | Update delivery status | Yes (Rider) |
| PUT | `/location` | Update rider location | Yes (Rider) |
| PUT | `/availability` | Update availability status | Yes (Rider) |
| GET | `/earnings` | Get earnings summary | Yes (Rider) |

**Delivery Status**: `out_for_delivery`, `delivered`

## Admin Endpoints
**Base**: `/api/admin`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Yes (Admin) |
| PUT | `/users/:id/status` | Update user status | Yes (Admin) |
| GET | `/products` | Get products for approval | Yes (Admin) |
| PUT | `/products/:id/approval` | Approve/reject product | Yes (Admin) |
| PUT | `/vendors/:id/approval` | Approve/reject vendor | Yes (Admin) |
| PUT | `/riders/:id/approval` | Approve/reject rider | Yes (Admin) |
| GET | `/analytics` | Get platform analytics | Yes (Admin) |

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Default Admin Account
- **Email**: admin@venda.com
- **Password**: admin123

## Query Parameters

### Products Filtering
- `gender`: Filter by gender (male/female)
- `category_id`: Filter by category
- `search`: Search in product name/description
- `min_price`: Minimum price
- `max_price`: Maximum price
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Orders Filtering
- `status`: Filter by order status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Vendor Orders Filtering
- `status`: Filter by vendor status (pending/accepted/rejected/preparing/ready)
- `page`: Page number
- `limit`: Items per page

## Order Status Flow
1. **pending** - Order placed by customer
2. **confirmed** - Payment confirmed
3. **processing** - Vendor preparing items
4. **shipped** - Order shipped, ready for rider assignment
5. **out_for_delivery** - Rider picked up order
6. **delivered** - Successfully delivered
7. **cancelled** - Cancelled by customer/admin

## Payment Methods
- `card` - Credit/Debit card
- `wallet` - VENDA wallet
- `cash` - Cash on delivery

## User Roles
- `customer` - Shopping customers
- `vendor` - Product sellers
- `rider` - Delivery personnel
- `admin` - Platform administrators
