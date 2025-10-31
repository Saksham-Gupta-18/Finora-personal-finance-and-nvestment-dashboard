import { request } from './api';

export function listTransactions(token) {
  return request('/transactions', { token });
}

export function getTransaction(token, id) {
  return request(`/transactions/${id}`, { token });
}

export function createTransaction(token, body) {
  return request('/transactions', { method: 'POST', token, body });
}

export function updateTransaction(token, id, body) {
  return request(`/transactions/${id}`, { method: 'PUT', token, body });
}

export function deleteTransaction(token, id) {
  return request(`/transactions/${id}`, { method: 'DELETE', token });
}


