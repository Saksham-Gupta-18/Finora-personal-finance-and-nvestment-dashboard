import { request } from './api';

export function listRecurring(token) {
  return request('/recurring', { token });
}

export function createRecurring(token, payload) {
  return request('/recurring', { method: 'POST', token, body: payload });
}

export function applyRecurring(token) {
  return request('/recurring/apply', { method: 'POST', token });
}


