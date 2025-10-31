import { request } from './api';

export function setBudget(token, month, limit_amount) {
  return request('/budgets', { method: 'POST', token, body: { month, limit_amount } });
}

export function getBudgetProgress(token, month) {
  return request(`/budgets/progress?month=${encodeURIComponent(month)}`, { token });
}


