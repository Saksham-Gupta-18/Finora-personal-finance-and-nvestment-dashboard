import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import expensesRoutes from './routes/expensesRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'finora-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/expenses', expensesRoutes);

// Proxy to Python forecast service
app.get('/api/forecast', async (req, res) => {
  try {
    const url = process.env.FORECAST_SERVICE_URL || 'http://localhost:8000/forecast';
    const response = await fetch(url, {
      headers: {
        // forward JWT so the Python service can call back to /api/expenses
        Authorization: req.headers['authorization'] || ''
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ message: 'Forecast service unavailable' });
  }
});

app.get('/api/forecast/savings', async (req, res) => {
  try {
    const urlBase = process.env.FORECAST_SERVICE_URL?.replace(/\/forecast$/, '') || 'http://localhost:8000';
    const url = `${urlBase}/forecast/savings`;
    const response = await fetch(url, {
      headers: { Authorization: req.headers['authorization'] || '' }
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ message: 'Savings forecast service unavailable' });
  }
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Finora backend listening on port ${port}`);
});


