const { expect } = require('@playwright/test');
const { apiUrl } = require('../config/env');

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

async function login(request, email, password) {
  return request.post(`${apiUrl}/users/login`, {
    data: { email, password },
    headers: { Accept: 'application/json' },
  });
}

async function loginToken(request, email, password) {
  const response = await login(request, email, password);
  expect(response.ok(), `login failed for ${email}: ${response.status()}`).toBeTruthy();
  const body = await response.json();
  expect(body.access_token, 'login did not return an access token').toBeTruthy();
  return body.access_token;
}

async function me(request, token) {
  return request.get(`${apiUrl}/users/me`, { headers: authHeaders(token) });
}

async function products(request, query = '') {
  const url = query
    ? `${apiUrl}/products?q=${encodeURIComponent(query)}`
    : `${apiUrl}/products`;
  const response = await request.get(url, { headers: { Accept: 'application/json' } });
  expect(response.ok(), `products ${response.status()}`).toBeTruthy();
  return response.json();
}

async function productById(request, id) {
  const response = await request.get(`${apiUrl}/products/${id}`, {
    headers: { Accept: 'application/json' },
  });
  expect(response.ok(), `product ${id} ${response.status()}`).toBeTruthy();
  return response.json();
}

async function invoices(request, token) {
  const response = await request.get(`${apiUrl}/invoices`, {
    headers: authHeaders(token),
  });
  expect(response.ok(), `invoices ${response.status()}`).toBeTruthy();
  return response.json();
}

function firstMatching(list, predicate) {
  const rows = Array.isArray(list) ? list : list.data || [];
  const match = rows.find(predicate);
  expect(match, 'expected at least one matching product').toBeTruthy();
  return match;
}

module.exports = {
  apiUrl,
  login,
  loginToken,
  me,
  products,
  productById,
  invoices,
  firstMatching,
};
