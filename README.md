# Finora – Personal Finance & Investment Dashboard

Finora helps users manage income, expenses, and investments via a clean, responsive dashboard.

## Tech Stack
- Frontend: React.js, HTML, CSS, JavaScript, Tailwind CSS
- Charts: Recharts
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Auth: JWT (JSON Web Token) with bcrypt password hashing
- API: REST
- Version Control: Git + GitHub

## Project Structure
```
finora/
  backend/
    src/
      config/
        db.js
      controllers/
        authController.js
        transactionController.js
        categoryController.js
        portfolioController.js
        savingsController.js
        recurringController.js
        budgetController.js
        goalController.js
      middleware/
        auth.js
        errorHandler.js
      models/
        userModel.js
        transactionModel.js
        categoryModel.js
        portfolioModel.js
        savingsModel.js
        recurringModel.js
        budgetModel.js
        goalModel.js
      routes/
        authRoutes.js
        transactionRoutes.js
        categoryRoutes.js
        portfolioRoutes.js
        savingsRoutes.js
        recurringRoutes.js
        budgetRoutes.js
        goalRoutes.js
        contactRoutes.js
      index.js
    package.json
    env.example
    .gitignore

  frontend/
    public/
      index.html
      images/
        hero.png
    src/
      components/
        Layout.jsx
        NavBar.jsx
        ProtectedRoute.jsx
        Chart.jsx
      context/
        AuthContext.jsx
      pages/
        Home.jsx
        Dashboard.jsx
        AddTransaction.jsx
        Categories.jsx
        Portfolio.jsx
        Savings.jsx
        SavingsGoals.jsx
        Profile.jsx
      services/
        api.js
        auth.js
        transactions.js
        categories.js
        portfolio.js
        budgets.js
        goals.js
        recurring.js
      App.js
      index.js
      index.css
    package.json
    tailwind.config.js
    postcss.config.js
    env.example
    .gitignore

  database/
    schema.sql
  API.md
  README.md
```

## Prerequisites
- Node.js 18+
- PostgreSQL 13+

## Database Setup
1. Create a PostgreSQL database (default name used: `finora_db`).
2. Run the SQL schema:
   - psql example:
     ```bash
     psql -U postgres -d finora_db -f database/schema.sql
     ```
   - Tables created: `users`, `categories`, `transactions`, `savings`, `portfolio`, `recurring_transactions`, `budgets`, `savings_goals`.

## Backend Setup
```bash
cd backend
cp env.example .env
npm install
npm run dev
```
- The server runs on `http://localhost:5000` by default.
- Configure `.env`:
  - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
  - `JWT_SECRET` (required)
  - `CLIENT_ORIGIN` (e.g., http://localhost:3000)

## Frontend Setup
```bash
cd frontend
cp env.example .env
npm install
npm start
```
- The app runs on `http://localhost:3000`.
- A proxy is set to `http://localhost:5000` in `package.json` for API calls.
 - Recharts is included as a dependency.

## Environment Variables
- Backend: see `backend/env.example`
- Frontend: see `frontend/env.example` (uses `REACT_APP_` prefix)

## Running the App
1. Start PostgreSQL and ensure the schema is applied.
2. Start backend: `npm run dev` in `backend/`.
3. Start frontend: `npm start` in `frontend/`.
4. Visit `http://localhost:3000`.

## Features
- Sign Up / Sign In with JWT
- Modern dashboard with sidebar and top bar
- Charts (Recharts):
  - Line: monthly income vs expenses (supports custom date range)
  - Pie: expense distribution by category
  - Bar: income/expense quick views where applicable
- Income & Expense Tracker:
  - Categories management and dropdown selection in forms
  - Recurring transactions (monthly) – create templates and auto-apply
- Portfolio Tracker:
  - Assets (name, type, qty, buy/current price) + charts (pie and line)
  - Inline "Edit Current Price" per asset, instant P/L refresh
  - Portfolio summary at top (Profit/Loss with value vs cost)
- Savings & Planning:
  - Monthly budget limit with progress bar
  - Date-range filter on dashboard
  - Separate Savings Goals page: multiple goals, contributions, and progress
- Profile view & update name
- Responsive UI with Tailwind CSS

### Recent UI/UX Upgrades
- Homepage hero with animated CTA and feature cards; contact form at bottom
- Sidebar navigation: Home, Dashboard, Profile, plus modules inside layout
- Dashboard:
  - Budget bar turns red and shows "Over budget" when exceeded
  - New "Income and Expenses for last 10 days" chart
  - Date range filter placed directly below Budget
- Add Transaction: "Add to savings" appears only for expenses and tags entries as `saved to {goal}` in the list
- Savings Goals moved to its own page with add form (name, target amount, required target date)

## API Docs
See `API.md` for full route documentation.

Quick reference (JWT required unless noted):
- Auth: POST `/api/auth/signup`, `/api/auth/signin`, GET/PUT `/api/auth/me`, POST `/api/auth/logout`
- Transactions: CRUD `/api/transactions`, GET `/api/transactions/stats/summary?start=YYYY-MM-DD&end=YYYY-MM-DD`
- Categories: GET/POST `/api/categories`, DELETE `/api/categories/:id`
- Portfolio: GET/POST `/api/portfolio`, PUT/DELETE `/api/portfolio/:id`
- Recurring: GET/POST `/api/recurring`, DELETE `/api/recurring/:id`, POST `/api/recurring/apply`
- Budgets: POST `/api/budgets` { month, limit_amount }, GET `/api/budgets/progress?month=YYYY-MM`
- Goals: POST `/api/goals`, GET `/api/goals`, GET `/api/goals/progress`

## Notes
- Logout is stateless (client deletes stored JWT).
- Recurring transactions are applied on demand via `POST /api/recurring/apply` (you can trigger this at login or from a scheduled job).
- For production, serve frontend separately and set `CLIENT_ORIGIN` accordingly.

## Scripts
- Backend:
  - `npm run dev` – start with nodemon
  - `npm start` – start production server
- Frontend:
  - `npm start` – run CRA dev server
  - `npm build` – production build

## License
MIT (for educational use)
