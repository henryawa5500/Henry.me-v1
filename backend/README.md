# HenryME Backend

This backend provides a secure API for the HenryME frontend. It uses SQLite for durable storage and includes authentication, product management, order processing, payment verification, and notifications.

## Setup

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` values as needed.

4. Start the server:
```bash
npm run dev
```

The backend listens on `http://localhost:4000` by default.

## Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`
- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PUT /orders/:id`
- `PATCH /orders/:id/status`
- `GET /users/me`
- `GET /notifications`
- `POST /payments/verify`

## Notes

- Admin-only endpoints require a valid JWT with `role: admin`.
- Payment receipts are stored in `backend/uploads`.
- The initial database is created automatically.
