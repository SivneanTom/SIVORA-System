# Lunora Fashion — Full E-commerce Frontend (React + Tailwind)

A complete e-commerce storefront + admin panel built with React, React Router, Tailwind CSS, and Axios, designed to work with your Laravel API at `http://127.0.0.1:8000/api`.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

> **Important:** Make sure your Laravel backend is running at `http://127.0.0.1:8000` and that CORS is configured to allow requests from `http://localhost:5173`.

## 📁 Project Structure

```
src/
├── api/
│   └── index.js          # All API calls (axios instance + endpoints)
├── components/
│   ├── Header.jsx         # Site nav: Home, About, Shop, Blog, Contact
│   ├── Footer.jsx
│   ├── Layout.jsx          # Wraps storefront pages with Header/Footer
│   ├── ProductCard.jsx     # Reusable product card (wishlist + add to cart)
│   ├── ProtectedRoute.jsx  # Route guards (auth + admin)
│   └── Spinner.jsx
├── context/
│   ├── AuthContext.jsx     # Login/Register/Logout, stores token + user
│   ├── CartContext.jsx     # Cart state synced with /api/cart
│   └── ToastContext.jsx    # Toast notifications
├── pages/
│   ├── HomePage.jsx                 → /
│   ├── ShopPage.jsx                  → /shop  (Product Listing + filters)
│   ├── ProductDetailPage.jsx         → /products/:id
│   ├── CartPage.jsx                  → /cart
│   ├── CheckoutPage.jsx              → /checkout
│   ├── OrdersPage.jsx                → /orders (My Orders)
│   ├── WishlistPage.jsx              → /wishlist
│   ├── ProfilePage.jsx               → /profile (profile + addresses)
│   ├── LoginPage.jsx                 → /login (login + register tabs)
│   ├── AboutPage.jsx                 → /about
│   ├── BlogPage.jsx                  → /blog
│   ├── ContactPage.jsx               → /contact
│   └── admin/
│       ├── AdminLayout.jsx           # Sidebar layout for all admin pages
│       ├── AdminDashboard.jsx        → /admin   (stats + recent orders)
│       ├── AdminProducts.jsx         → /admin/products    (CRUD)
│       ├── AdminCategories.jsx       → /admin/categories  (CRUD)
│       ├── AdminOrders.jsx           → /admin/orders      (status, cancel)
│       ├── AdminUsers.jsx            → /admin/users       (block/delete)
│       └── AdminPayments.jsx         → /admin/payments    (view)
├── App.jsx                # All routing
├── main.jsx
└── index.css
```

## 🔌 API Endpoints Used

All requests go through `src/api/index.js`, which automatically attaches the
`Authorization: Bearer <token>` header from `localStorage` (set after login/register).

| Page | Method | Endpoint |
|---|---|---|
| Home | GET | `/products`, `/categories` |
| Login | POST | `/login` |
| Register | POST | `/register` |
| Shop | GET | `/products?search=&category_id=` |
| Product Detail | GET | `/products/{id}` |
| Cart | GET/POST/PUT/DELETE | `/cart`, `/cart/{id}` |
| Checkout | POST | `/checkout` |
| Addresses | GET/POST/PUT/DELETE | `/addresses`, `/addresses/{id}` |
| My Orders | GET | `/my-orders` (falls back to `/orders`) |
| Order Detail | GET | `/orders/{id}` |
| Wishlist | GET/POST/DELETE | `/wishlist`, `/wishlist/{id}` |
| Profile | — | uses `user` stored from login/register |
| Admin Dashboard | GET | `/admin/dashboard` |
| Admin Products | CRUD | `/products` |
| Admin Categories | CRUD | `/categories` |
| Admin Orders | PUT | `/orders/{id}/status` |
| Admin Users | GET/PUT/DELETE | `/users`, `/users/{id}` |
| Admin Payments | GET | `/payments` |

## 🔐 Authentication

- On login/register, the response is expected to contain a `token` and `user` object
  (adjust the shape in `src/pages/LoginPage.jsx` if your Laravel response differs,
  e.g. `data.user` vs `data.data.user`).
- The user's `role` field determines admin access (`user.role === 'admin'`).
- Token is stored in `localStorage` and auto-attached to every request.
- A 401 response automatically logs the user out and redirects to `/login`.

## 🖼️ Product Images

Product images are expected at `product.image` as either a full URL or a relative
path served from `http://127.0.0.1:8000/storage/{image}` (Laravel's default
`storage:link` setup). If `image` is missing, a placeholder Unsplash photo is shown.

## 🎨 Design System

- **Colors:** cream `#F7F4EF`, sand `#E8E0D5`, stone `#B8A99A`, espresso `#2C2018`, charcoal `#1A1A1A`
- **Fonts:** Playfair Display (serif/headings), Inter (sans/body)
- Fully responsive: mobile nav, mobile filter drawer, responsive admin sidebar

## 🛠️ Customizing the API Base URL

Edit `BASE_URL` in `src/api/index.js`:

```js
const BASE_URL = 'http://127.0.0.1:8000/api';
```

## 📦 Build for Production

```bash
npm run build
```

Output goes to `dist/`.
