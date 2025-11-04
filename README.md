# Finora – Personal Finance & Investment Dashboard

Finora helps users manage income, expenses, and investments via a clean, responsive dashboard.

## Tech Stack
- Frontend: React.js, HTML, CSS, JavaScript, Tailwind CSS
- Charts: Recharts
- Backend: Node.js, Express.js
- Forecasting Service: Python (FastAPI)
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
        budgetModel.js
        goalModel.js
      routes/
        authRoutes.js
        transactionRoutes.js
        categoryRoutes.js
        portfolioRoutes.js
        savingsRoutes.js
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
      App.js
      index.js
      index.css
    package.json
    tailwind.config.js
    postcss.config.js
    env.example
    .gitignore

  forecast_service/
    main.py
    requirements.txt

  database/
    schema.sql
  API.md
  README.md
```

## Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 13+

## Database Setup
1. Create a PostgreSQL database (default name used: `finora_db`).
2. Run the SQL schema:
   - psql example:
     ```bash
     psql -U postgres -d finora_db -f database/schema.sql
     ```
   - Tables created: `users`, `categories`, `transactions`, `savings`, `portfolio`, `budgets`, `savings_goals`, `savings_contributions`.

## Backend Setup (Node + Express)
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
  - `FORECAST_SERVICE_URL` (default `http://localhost:8000/forecast`)

## Frontend Setup (React)
```bash
cd frontend
cp env.example .env
npm install
npm start
```
- The app runs on `http://localhost:3000`.
- A proxy is set to `http://localhost:5000` in `package.json` for API calls.
 - Recharts is included as a dependency.

## Forecasting Service Setup (Python + FastAPI)
```bash
cd forecast_service
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt

# Optional: set env (or create forecast_service/.env)
# FORECAST_PORT=8000
# CLIENT_ORIGIN=http://localhost:3000
# NODE_API_BASE=http://localhost:5000/api

python main.py
```
- The service runs on `http://localhost:8000` by default and exposes `GET /forecast`.
- It fetches authenticated expenses from the Node backend at `GET /api/expenses` and returns:
  - `forecast_next_month`, `growth_rate`, `message`, and a `monthly` series for charting.

## Environment Variables
- Backend: see `backend/env.example`
- Frontend: see `frontend/env.example` (uses `REACT_APP_` prefix)

## Running the App (All Services)
1. Start PostgreSQL and ensure the schema is applied.
2. Backend (Node): in `backend/` → `npm run dev`.
3. Forecasting service (Python): in `forecast_service/` → `python main.py`.
4. Frontend (React): in `frontend/` → `npm start`.
5. Visit `http://localhost:3000` and go to Dashboard → Forecast section.

Environment quick reference: see `ENV_SETUP.md` for consolidated `.env` examples for both services.

## Features
- Sign Up / Sign In with JWT
- Modern dashboard with sidebar and top bar
- Charts (Recharts):
  - Line: monthly income vs expenses (supports custom date range)
  - Pie: expense distribution by category
  - Bar: income/expense quick views where applicable
- Income & Expense Tracker:
  - Categories management and dropdown selection in forms
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
- Budgets: POST `/api/budgets` { month, limit_amount }, GET `/api/budgets/progress?month=YYYY-MM`
- Goals: POST `/api/goals`, GET `/api/goals`, GET `/api/goals/progress`
- Expenses (for forecasting): GET `/api/expenses` (JWT required)
- Forecast proxy: GET `/api/forecast` (proxies to Python service)

## Notes
- Logout is stateless (client deletes stored JWT).
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
