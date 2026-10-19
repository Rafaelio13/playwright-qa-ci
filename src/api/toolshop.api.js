const { expect } = require('@playwright/test');
const { apiUrl } = require('../config/env');

const API_TIMEOUT_MS = 30_000;

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

function callOpts(headers = {}, extra = {}) {
  return {
    timeout: API_TIMEOUT_MS,
    ...extra,
    headers: { Accept: 'application/json', ...headers },
  };
}

async function login(request, email, password) {
  return request.post(
    `${apiUrl}/users/login`,
    callOpts({}, { data: { email, password } }),
  );
}

async function loginToken(request, email, password) {
  const response = await login(request, email, password);
  expect(response.ok(), `login failed for ${email}: ${response.status()}`).toBeTruthy();
  const body = await response.json();
  expect(body.access_token, 'login did not return an access token').toBeTruthy();
  return body.access_token;
}

async function me(request, token) {
  return request.get(`${apiUrl}/users/me`, callOpts(authHeaders(token)));
}

async function products(request, query = '') {
  const url = query
    ? `${apiUrl}/products?q=${encodeURIComponent(query)}`
    : `${apiUrl}/products`;
  const response = await request.get(url, callOpts());
  expect(response.ok(), `products ${response.status()}`).toBeTruthy();
  return response.json();
}

async function productById(request, id) {
  const response = await request.get(`${apiUrl}/products/${id}`, callOpts());
  expect(response.ok(), `product ${id} ${response.status()}`).toBeTruthy();
  return response.json();
}

async function invoices(request, token) {
  const response = await request.get(`${apiUrl}/invoices`, callOpts(authHeaders(token)));
  expect(response.ok(), `invoices ${response.status()}`).toBeTruthy();
  return response.json();
}

async function brands(request) {
  const response = await request.get(`${apiUrl}/brands`, callOpts());
  expect(response.ok(), `brands ${response.status()}`).toBeTruthy();
  return response.json();
}

async function categories(request) {
  const response = await request.get(`${apiUrl}/categories`, callOpts());
  expect(response.ok(), `categories ${response.status()}`).toBeTruthy();
  return response.json();
}

async function categoriesTree(request) {
  const response = await request.get(`${apiUrl}/categories/tree`, callOpts());
  expect(response.ok(), `categories/tree ${response.status()}`).toBeTruthy();
  return response.json();
}

async function productsByQuery(request, params) {
  const query = new URLSearchParams(params).toString();
  const response = await request.get(`${apiUrl}/products?${query}`, callOpts());
  expect(response.ok(), `products?${query} ${response.status()}`).toBeTruthy();
  return response.json();
}

async function allProductsByQuery(request, params = {}) {
  const first = await productsByQuery(request, { ...params, page: '1' });
  const collected = [...rows(first)];
  const lastPage = first.last_page || 1;
  for (let page = 2; page <= lastPage; page += 1) {
    const next = await productsByQuery(request, { ...params, page: String(page) });
    collected.push(...rows(next));
  }
  return collected;
}

async function relatedProducts(request, productId) {
  const response = await request.get(
    `${apiUrl}/products/${productId}/related`,
    callOpts(),
  );
  expect(response.ok(), `related ${productId} ${response.status()}`).toBeTruthy();
  return response.json();
}

async function favorites(request, token) {
  return request.get(`${apiUrl}/favorites`, callOpts(authHeaders(token)));
}

async function addFavorite(request, token, productId) {
  return request.post(
    `${apiUrl}/favorites`,
    callOpts(authHeaders(token), { data: { product_id: productId } }),
  );
}

async function deleteFavorite(request, token, favoriteId) {
  return request.delete(
    `${apiUrl}/favorites/${favoriteId}`,
    callOpts(authHeaders(token)),
  );
}

async function paymentCheck(request, method) {
  return request.post(
    `${apiUrl}/payment/check`,
    callOpts({}, { data: { method } }),
  );
}

async function register(request, data = {}) {
  return request.post(`${apiUrl}/users/register`, callOpts({}, { data }));
}

function rows(list) {
  return Array.isArray(list) ? list : list.data || [];
}

function firstMatching(list, predicate) {
  const match = rows(list).find(predicate);
  expect(match, 'expected at least one matching record').toBeTruthy();
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
  brands,
  categories,
  categoriesTree,
  productsByQuery,
  allProductsByQuery,
  relatedProducts,
  favorites,
  addFavorite,
  deleteFavorite,
  paymentCheck,
  register,
  rows,
  firstMatching,
};
