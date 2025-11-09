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

# 📘 Finora – Complete Project Documentation (A to Z)

## ✅ 1. Project Overview

### What Finora is
Finora is a comprehensive personal finance and investment dashboard designed to help users manage their income, expenses, savings, and portfolio in one intuitive platform. It provides real-time insights through interactive charts, automated forecasting, and goal tracking to empower users to make informed financial decisions.

### Purpose of the project
The purpose of Finora is to simplify personal finance management by offering a user-friendly interface for tracking financial activities, setting budgets, monitoring investments, and planning savings goals. It addresses the common challenges of disorganized financial data by centralizing all aspects into a single, secure application with predictive analytics.

### Problem it solves
Finora solves the problem of fragmented financial tracking by providing:
- Unified view of income, expenses, and savings
- Automated expense and savings forecasting
- Portfolio performance monitoring with profit/loss analysis
- Goal-based savings planning with progress tracking
- Secure, private data management with JWT authentication

### Tech stack used
- **Frontend**: React.js (with hooks and context), HTML, CSS, JavaScript, Tailwind CSS for styling
- **Charts**: Recharts library for data visualization
- **Backend**: Node.js with Express.js framework
- **Forecasting Service**: Python with FastAPI for AI-driven predictions
- **Database**: PostgreSQL for relational data storage
- **Authentication**: JWT (JSON Web Token) with bcrypt password hashing
- **API**: RESTful API design
- **Version Control**: Git + GitHub

### Summary of all major features
- User authentication (Sign Up/Sign In) with secure JWT tokens
- Income, expense, and savings tracking with categorized transactions
- Interactive dashboard with financial summaries and charts
- Budget management with monthly limits and progress tracking
- Savings goals with progress bars, forecasts, and completion predictions
- Portfolio tracking for stocks, mutual funds, crypto, and other assets
- Real-time profit/loss calculations and portfolio allocation charts
- Expense forecasting based on historical data
- Savings forecasting for goal achievement
- Responsive UI with Tailwind CSS
- Contact form for user feedback

## Application Architecture

### Frontend architecture (pages, components, data flow)
The frontend is built with React.js and follows a component-based architecture:
- **Pages**: Home, Dashboard, SignUp, SignIn, AddTransaction, SavingsGoals, Portfolio, Profile
- **Components**: Layout (with NavBar and ProtectedRoute), Chart, StatCard, BudgetSection, etc.
- **Context**: AuthContext for global authentication state management
- **Services**: API service layer for backend communication (auth, transactions, goals, portfolio, etc.)
- **Data Flow**: User actions trigger API calls via services, responses update state via hooks, components re-render with new data

### Backend architecture (routes, controllers, services)
The backend uses Node.js and Express.js with a modular structure:
- **Routes**: Organized by feature (authRoutes, transactionRoutes, goalRoutes, portfolioRoutes, etc.)
- **Controllers**: Handle business logic (authController, transactionController, goalController, etc.)
- **Models**: Database interaction layers (userModel, transactionModel, etc.)
- **Middleware**: Authentication (auth.js), error handling (errorHandler.js)
- **Utils**: Validation helpers and other utilities

### Database structure (tables: users, transactions, savings_goals, portfolio)
PostgreSQL database with the following core tables:
- `users`: User accounts with authentication data
- `transactions`: Financial transactions (income, expense, saving)
- `categories`: Transaction categories for organization
- `savings_goals`: User-defined savings targets
- `savings_contributions`: Manual contributions to savings goals
- `portfolio`: Investment holdings with prices and quantities
- `budgets`: Monthly spending limits
- `savings`: Historical savings snapshots

### Forecasting system (Python API + integration flow)
- **Python FastAPI Service**: Runs separately on port 8000, exposes `/forecast` and `/forecast/savings` endpoints
- **Integration Flow**: Frontend requests forecast data from Node backend, which proxies to Python service
- **Expense Forecasting**: Analyzes monthly expense patterns to predict next month's spending
- **Savings Forecasting**: Calculates goal completion timelines and required monthly contributions

### Folder structure overview
```
finora/
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Business logic handlers
│   │   ├── middleware/      # Auth and error middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API route definitions
│   │   └── utils/           # Helper functions
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   └── utils/           # Utility functions
│   └── package.json
├── forecast_service/        # Python FastAPI forecasting
│   ├── main.py              # Forecasting logic
│   └── requirements.txt
├── database/                # Database schema and migrations
└── README.md
```

## Pages (Explain Every Page in Detail)

### Home Page
The landing page that introduces Finora to new users.
- **Hero section**: Animated title with call-to-action buttons (Get Started for new users, Go to Dashboard for logged-in users)
- **Features cards**: Horizontal scrollable cards highlighting key features (Smart Budgeting, Portfolio Tracking, Secure & Private, Goals & Savings)
- **Additional sections**: Why Finora is better, Income & Expense Tracker details, Portfolio Tracker overview
- **Contact form**: Simple form at bottom for user inquiries (currently stores locally, can be wired to backend)

### Authentication Pages
Secure user registration and login system.

#### Sign Up
- **Password hashing**: Uses bcrypt to securely hash passwords before database storage
- **Validation**: Client-side and server-side validation for name, email, password
- **DB insert**: Creates new user record in `users` table with hashed password
- **Post-signup**: Redirects to dashboard upon successful registration

#### Login
- **JWT verification**: Validates email/password, issues JWT token upon success
- **Session management**: Stores token in localStorage for persistent sessions
- **Redirect**: Navigates to intended page or dashboard after login

### Dashboard Page
The main financial overview page with comprehensive analytics.

#### Income Summary Card
Displays total income with green color coding.

#### Expense Summary Card
Shows total expenses with red color coding.

#### Savings Summary Card
Presents total savings amount with blue color coding.

#### Monthly Overview Chart (Income vs Expense vs Savings)
Line chart showing monthly trends for the last 6 months using Recharts.

#### Expenses by Category Pie Chart
Visual breakdown of spending by category with color-coded segments.

#### Savings Pie Chart
Distribution of savings across different goals or categories.

#### Latest Transactions Table
Recent transactions list with date, type, category, amount, and delete functionality.

#### Budget Section (set & edit budget)
- Monthly budget input with progress bar
- Visual indicator turns red when over budget
- "Over budget" warning message when exceeded

### Transactions Page (Add Transaction)
Form for adding new financial entries.

#### Form fields
- Type: Dropdown (Income, Expense, Saving)
- Amount: Number input with decimal support
- Category: Datalist input (categories for income/expense, goals for savings)
- Note: Optional text field
- Date: Date picker (defaults to today)

#### Three types: Income, Expense, Saving
- Income: Adds positive cash flow
- Expense: Records spending, optionally links to savings goals
- Saving: Direct contribution to savings goals

#### Validation
- Required fields: type, amount, date
- Amount must be positive number
- Category/goal required for savings type

#### DB insertion
Creates transaction record with proper relationships (category_id for income/expense, goal_id for savings).

#### Auto-refresh logic
After successful submission, redirects to dashboard where data automatically refreshes.

### Savings Goals Page
Dedicated page for managing savings objectives.

#### All goals displayed
Grid layout showing each goal as a card.

#### Add new goal form
- Name: Goal description
- Target amount: Numerical target
- Target date: Date picker for completion deadline

#### Each goal card:
- **Target**: Displays target amount and date
- **Current saved**: Shows current savings progress
- **Progress bar**: Visual progress indicator (current / target)
- **Forecast completion date**: Predicted completion based on historical contributions
- **Status badge**: On Track / Slightly Behind / Behind / Not enough data
- **Required monthly saving**: Calculated amount needed to meet target

#### Savings forecast graph
Line chart showing historical monthly contributions with target line reference.

### Portfolio Page
Investment tracking and analysis interface.

#### Add asset form
- Asset name: Text input
- Type: Dropdown (Stock, Mutual Fund, Crypto, Other)
- Quantity: Number input
- Buy price: Number input
- Current price: Number input

#### Asset list
Table displaying all holdings with inline editing for current price.

#### Update current price
Click "Edit" to modify current price, instantly recalculates P/L.

#### Profit/Loss calculation
Real-time calculation: (current_price - buy_price) * quantity

#### Profit/Loss summary
Total portfolio value, total cost, and net profit/loss at top.

#### Charts:
- **Asset distribution pie chart**: Shows portfolio allocation by asset
- **Portfolio performance line chart**: Displays unrealized gains/losses per asset

### Profile Page
User account management.

#### User info
Displays current name and email.

#### Edit profile (optional)
Form to update user name.

#### Logout
Button to clear JWT token and redirect to home.

#### Settings
Basic profile update functionality.

## Features Explained (in Depth)

### Budget Management
Allows users to set monthly spending limits with visual progress tracking. The budget section on the dashboard shows a progress bar that turns red when expenses exceed the limit, with an "Over budget" warning. Budgets are stored per user per month in the `budgets` table.

### Income Tracking
Users can add income transactions with categories for organization. Income data feeds into dashboard summaries and monthly charts, helping users monitor cash flow patterns.

### Expense Tracking
Comprehensive expense logging with category selection. Expenses are visualized in pie charts by category and contribute to budget monitoring and forecasting models.

### Savings Tracking
Tracks savings contributions either as direct "saving" transactions or through goal-linked expenses. Savings data is aggregated in dashboard summaries and goal progress tracking.

### Savings Forecasting
Advanced prediction system that analyzes historical contribution patterns to forecast goal completion dates and required monthly amounts. Uses average monthly saving calculations with status indicators (on track, behind, etc.).

### Portfolio Tracking
Manages investment holdings with real-time price updates. Tracks multiple asset types (stocks, crypto, funds) with automatic profit/loss calculations and portfolio allocation visualization.

### Portfolio Profit/Loss Analysis
Calculates both individual asset P/L and total portfolio performance. Displays current value vs. cost basis with percentage gains/losses.

### Expense Forecasting
Predicts next month's expenses based on historical spending patterns. Uses growth rate calculations from recent vs. previous periods to provide actionable insights.

### Contact Form Integration
Simple contact form on the home page for user feedback. Currently stores submissions locally but can be extended to send emails or store in database.

### Navbar structure
Responsive navigation bar with links to Home, Dashboard, Profile, and logout. Includes sidebar navigation for authenticated users with access to all main sections.

### Authentication System
JWT-based authentication with secure password hashing using bcrypt. Implements stateless sessions with token storage in localStorage. Includes protected routes and automatic token validation.

### Form Validations
Client-side and server-side validation for all forms:
- Required field checks
- Email format validation
- Number input constraints
- Date validations
- Custom business logic (e.g., positive amounts only)

## Database Design

### Tables

#### users
- `id` (SERIAL PRIMARY KEY): Unique user identifier
- `name` (TEXT NOT NULL): User's full name
- `email` (TEXT NOT NULL UNIQUE): User's email address
- `password_hash` (TEXT NOT NULL): Bcrypt-hashed password
- `created_at` (TIMESTAMP): Account creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

#### transactions
- `id` (SERIAL PRIMARY KEY): Transaction identifier
- `user_id` (INTEGER REFERENCES users(id)): Owner of transaction
- `category_id` (INTEGER REFERENCES categories(id)): Category (nullable)
- `type` (transaction_type ENUM): 'income', 'expense', or 'saving'
- `amount` (NUMERIC(12,2)): Transaction amount (must be >= 0)
- `note` (TEXT DEFAULT ''): Optional transaction note
- `date` (DATE DEFAULT CURRENT_DATE): Transaction date
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Update timestamp

#### categories
- `id` (SERIAL PRIMARY KEY): Category identifier
- `user_id` (INTEGER REFERENCES users(id)): Owner
- `name` (TEXT NOT NULL): Category name
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Update timestamp
- UNIQUE(user_id, name): Prevents duplicate categories per user

#### savings_goals
- `id` (SERIAL PRIMARY KEY): Goal identifier
- `user_id` (INTEGER REFERENCES users(id)): Owner
- `name` (TEXT NOT NULL DEFAULT 'Goal'): Goal name
- `target_amount` (NUMERIC(12,2)): Target savings amount
- `target_date` (DATE NOT NULL): Target completion date
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Update timestamp

#### savings_contributions
- `id` (SERIAL PRIMARY KEY): Contribution identifier
- `user_id` (INTEGER REFERENCES users(id)): Owner
- `goal_id` (INTEGER REFERENCES savings_goals(id)): Associated goal
- `amount` (NUMERIC(12,2)): Contribution amount
- `date` (DATE DEFAULT CURRENT_DATE): Contribution date
- `created_at` (TIMESTAMP): Creation timestamp

#### portfolio
- `id` (SERIAL PRIMARY KEY): Asset identifier
- `user_id` (INTEGER REFERENCES users(id)): Owner
- `asset_name` (TEXT NOT NULL): Asset name
- `type` (TEXT NOT NULL): Asset type (stock, mutual_fund, crypto, other)
- `quantity` (NUMERIC(18,8)): Quantity held
- `buy_price` (NUMERIC(18,8)): Purchase price per unit
- `current_price` (NUMERIC(18,8)): Current market price
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Update timestamp

#### budgets
- `id` (SERIAL PRIMARY KEY): Budget identifier
- `user_id` (INTEGER REFERENCES users(id)): Owner
- `month` (TEXT NOT NULL): Month in YYYY-MM format
- `limit_amount` (NUMERIC(12,2)): Monthly spending limit
- `created_at` (TIMESTAMP): Creation timestamp
- UNIQUE(user_id, month): One budget per user per month

### Relationships
- **1 user → many transactions**: Users can have multiple financial transactions
- **1 user → many savings goals**: Users can set multiple savings objectives
- **1 user → many portfolio assets**: Users can hold multiple investments
- **1 user → many categories**: Users can create custom transaction categories
- **1 user → many budgets**: Users can set budgets for different months
- **1 goal → many contributions**: Goals can receive multiple savings contributions
- **1 category → many transactions**: Categories can be used for multiple transactions

### Sample ER Diagram (Text representation)
```
users (1) ──── (many) transactions
  │                    │
  │                    └── categories (many)
  │
  ├── (many) savings_goals (1) ──── (many) savings_contributions
  │
  ├── (many) portfolio
  │
  └── (many) budgets
```

## How Forecasting Works

### Expense Forecasting
Predicts future spending based on historical expense data.

#### Monthly growth rate
Calculated as: `growth_rate = (recent_avg - previous_avg) / previous_avg`

Where:
- `recent_avg`: Average expenses from the most recent 3 months (or fewer if less data)
- `previous_avg`: Average expenses from the 3 months before that

#### Next month prediction
Formula: `forecast_next_month = last_month_expense * (1 + growth_rate)`

Where `last_month_expense` is the most recent month's actual spending.

#### Example
If previous 3 months averaged ₹10,000 and recent 3 months averaged ₹12,000:
- Growth rate = (12,000 - 10,000) / 10,000 = 0.2 (20%)
- If last month was ₹12,500, next month forecast = 12,500 * (1 + 0.2) = ₹15,000

### Savings Forecasting
Predicts goal completion based on contribution patterns.

#### Average monthly saving
Calculated from historical contributions: `avg_monthly = sum(recent_contributions) / number_of_months`

Uses the last 6 months of data or all available data if less.

#### Completion date prediction
`months_needed = (target_amount - current_savings) / avg_monthly`

Estimated completion date is calculated by adding `months_needed` to the last contribution month.

#### Goal status logic
- **On Track**: `months_needed <= months_left_until_target_date`
- **Slightly Behind**: `months_needed <= months_left_until_target_date + 2`
- **Behind**: `months_needed > months_left_until_target_date + 2`
- **Unknown**: Insufficient data or calculation errors

#### Required monthly saving
To meet target by deadline: `required_per_month = remaining_amount / months_left`

Where `months_left` is calculated from current date to target date.

#### Example
Goal: Save ₹100,000 by Dec 31, 2024
- Current savings: ₹30,000
- Average monthly: ₹5,000
- Months left: 6
- Months needed: (100,000 - 30,000) / 5,000 = 14 months
- Status: Behind (14 > 6)
- Required monthly: (100,000 - 30,000) / 6 = ₹11,667
