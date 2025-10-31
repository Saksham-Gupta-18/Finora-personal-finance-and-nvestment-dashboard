import { request } from './api';

export function listAssets(token) {
  return request('/portfolio', { token });
}

export function createAsset(token, asset) {
  return request('/portfolio', { method: 'POST', token, body: asset });
}

export function updateAsset(token, id, asset) {
  return request(`/portfolio/${id}`, { method: 'PUT', token, body: asset });
}

export function deleteAsset(token, id) {
  return request(`/portfolio/${id}`, { method: 'DELETE', token });
}


