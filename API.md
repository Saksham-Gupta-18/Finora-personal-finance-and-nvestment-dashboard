# Finora REST API

Base URL: /api

Authentication: Bearer JWT in Authorization header.

## Auth

- POST /auth/signup
  - Body: { name, email, password }
  - 201 -> { token, user }

- POST /auth/signin
  - Body: { email, password }
  - 200 -> { token, user }

- POST /auth/logout (requires auth)
  - 200 -> { success: true } (client should delete token)

- GET /auth/me (requires auth)
  - 200 -> { user }

- PUT /auth/me (requires auth)
  - Body: { name }
  - 200 -> { user }

## Transactions (requires auth)

- GET /transactions
  - 200 -> { transactions: [...], stats: { total_income, total_expense } }

- POST /transactions
  - Body: { type: 'income'|'expense', amount: Number, category?, note?, date? }
  - 201 -> { transaction }

- GET /transactions/:id
  - 200 -> { transaction }

- PUT /transactions/:id
  - Body: any of { type, amount, category, note, date }
  - 200 -> { transaction }

- DELETE /transactions/:id
  - 200 -> { success: true }

## Health

- GET /health
  - 200 -> { status: 'ok', service: 'finora-backend' }
