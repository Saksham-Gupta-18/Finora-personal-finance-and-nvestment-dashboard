import { request } from './api';

export function listCategories(token) {
  return request('/categories', { token });
}

export function createCategory(token, name) {
  return request('/categories', { method: 'POST', token, body: { name } });
}

export function deleteCategory(token, id) {
  return request(`/categories/${id}`, { method: 'DELETE', token });
}


