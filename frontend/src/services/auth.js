import { request } from './api';

export function signIn(email, password) {
  return request('/auth/signin', { method: 'POST', body: { email, password } });
}

export function signUp(name, email, password) {
  return request('/auth/signup', { method: 'POST', body: { name, email, password } });
}

export function logout(token) {
  return request('/auth/logout', { method: 'POST', token });
}

export function getProfile(token) {
  return request('/auth/me', { token });
}

export function updateProfile(token, { name }) {
  return request('/auth/me', { method: 'PUT', token, body: { name } });
}


