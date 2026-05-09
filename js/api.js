/**
 * api.js — Fetch wrappers for all external/local data sources
 */

export async function fetchProducts() {
  const res = await fetch('https://fakestoreapi.com/products');
  if (!res.ok) throw new Error(`Product fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchReviews() {
  const res = await fetch('./data/reviews.json');
  if (!res.ok) throw new Error(`Reviews fetch failed: ${res.status}`);
  return res.json();
}
