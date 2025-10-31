import { request } from './api';

export function setGoal(token, target_amount, target_date) {
  return request('/goals', { method: 'POST', token, body: { target_amount, target_date } });
}

export function getGoal(token) {
  return request('/goals', { token });
}

export function getGoalProgress(token) {
  return request('/goals/progress', { token });
}


