# Fashion Style E-Commerce 🛍️

A full-stack, responsive fashion e-commerce application designed to provide a seamless shopping experience. Built with a modern aesthetic, it includes features for product browsing, user authentication, a shopping cart, secure checkout, and a comprehensive admin dashboard for managing the store.

## Features ✨

### User Facing
*   **Product Catalog:** Browse a diverse range of fashion items.
*   **Search & Filtering:** Easily find products based on categories or keywords.
*   **Shopping Cart:** Add, remove, and manage items in your cart.
*   **Checkout & Payments:** Integrated secure checkout flow.
*   **User Authentication:** Secure login and registration.

### Admin Dashboard
*   **Manage Products:** Add new items, update details, or remove products from the catalog.
*   **Order Management:** Track and process customer orders.
*   **Admin Authentication:** Secure access restricted to store administrators.

## Tech Stack 🛠️

*   **Frontend:** React (Vite), React Router for navigation, Context API/Redux for state management.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB.
*   **Authentication:** JSON Web Tokens (JWT).

## Installation and Setup 🚀

To run this project locally, follow these steps:

### Prerequisites
*   Node.js installed on your machine.
*   MongoDB database instance.

### 1. Clone the repository
```bash
git clone https://github.com/sahare-mayur-0071/fashion-style.git
cd fashion-style
```

### 2. Backend Setup
```bash
cd server
npm install
```
*   Create a `.env` file in the `server` directory and add your environment variables (e.g., `MONGO_URI`, `PORT`, `JWT_SECRET`).
*   Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
*   Start the frontend development server:
```bash
npm run dev
```

The application should now be running! The frontend will typically be accessible at `http://localhost:5173` and the backend on the port specified in your `.env`.


