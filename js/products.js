/**
 * products.js — Fetch, render, filter, search, sort product cards
 */

import { fetchProducts } from './api.js';
import { addItem } from './cart.js';

let allProducts  = [];
let activeCategory = 'all';
let activeSort     = 'default';
let searchQuery    = '';

/* ── Skeleton ─────────────────────────────────────────── */
function renderSkeletons(count = 8) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }).map(() => `
    <div class="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div class="bg-gray-200 h-52 w-full"></div>
      <div class="p-4 space-y-3">
        <div class="h-3 bg-gray-200 rounded w-1/3"></div>
        <div class="h-4 bg-gray-200 rounded w-full"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-9 bg-gray-200 rounded-xl w-full mt-2"></div>
      </div>
    </div>
  `).join('');
}

/* ── Stars ────────────────────────────────────────────── */
function starsHTML(rate) {
  const full  = Math.floor(rate);
  const half  = rate % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return `
    ${'<svg class="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>'.repeat(full)}
    ${half ? '<svg class="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0v15z"/></svg>' : ''}
    ${'<svg class="w-3.5 h-3.5 text-gray-300 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>'.repeat(empty)}
  `;
}

/* ── Card ─────────────────────────────────────────────── */
function cardHTML(p) {
  const badgeColors = {
    "men's clothing":    'bg-blue-100 text-blue-700',
    "women's clothing":  'bg-pink-100 text-pink-700',
    'jewelery':          'bg-purple-100 text-purple-700',
    'electronics':       'bg-teal-100 text-teal-700',
  };
  const badge = badgeColors[p.category] || 'bg-gray-100 text-gray-600';
  const shortTitle = p.title.length > 55 ? p.title.substring(0, 55) + '…' : p.title;

  return `
    <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col group">
      <div class="relative overflow-hidden bg-gray-50 h-52 flex items-center justify-center p-4">
        <span class="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${badge}">${p.category}</span>
        <img src="${p.image}" alt="${p.title}" loading="lazy"
          class="max-h-40 max-w-full object-contain transition-transform duration-500 group-hover:scale-110"/>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <p class="text-sm font-semibold text-gray-800 leading-snug mb-2 flex-1">${shortTitle}</p>
        <div class="flex items-center gap-1 mb-2">
          ${starsHTML(p.rating.rate)}
          <span class="text-xs text-gray-500 ml-1">(${p.rating.count})</span>
        </div>
        <div class="flex items-center justify-between mt-auto">
          <span class="text-lg font-bold text-primary">$${p.price.toFixed(2)}</span>
          <button
            data-id="${p.id}"
            class="add-to-cart-btn bg-accent hover:bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ── Render filtered list ─────────────────────────────── */
function getFiltered() {
  let list = [...allProducts];
  if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
  if (searchQuery)               list = list.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  if (activeSort === 'asc')      list.sort((a, b) => a.price - b.price);
  if (activeSort === 'desc')     list.sort((a, b) => b.price - a.price);
  return list;
}

function renderProducts() {
  const grid    = document.getElementById('products-grid');
  const countEl = document.getElementById('product-count');
  if (!grid) return;
  const list = getFiltered();
  if (countEl) countEl.textContent = '';
  if (list.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-16 text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <p class="text-lg font-medium">No products found</p>
      <p class="text-sm">Try a different search or filter</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(cardHTML).join('');
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = parseInt(btn.dataset.id);
      const product = allProducts.find(p => p.id === id);
      if (product) addItem(product);
    });
  });
}

/* ── Category dropdown ────────────────────────────────── */
function populateCategories() {
  const sel = document.getElementById('category-filter');
  if (!sel) return;
  const cats = ['all', ...new Set(allProducts.map(p => p.category))];
  sel.innerHTML = cats.map(c =>
    `<option value="${c}">${c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>`
  ).join('');
}

/* ── Init ─────────────────────────────────────────────── */
export async function init() {
  renderSkeletons();

  const errBanner = document.getElementById('products-error');

  try {
    allProducts = await fetchProducts();
    populateCategories();
    renderProducts();

    /* Search */
    document.getElementById('search-input')?.addEventListener('input', e => {
      searchQuery = e.target.value;
      renderProducts();
    });

    /* Category filter */
    document.getElementById('category-filter')?.addEventListener('change', e => {
      activeCategory = e.target.value;
      renderProducts();
    });

    /* Sort */
    document.getElementById('sort-select')?.addEventListener('change', e => {
      activeSort = e.target.value;
      renderProducts();
    });

  } catch (err) {
    console.error(err);
    if (errBanner) {
      errBanner.classList.remove('hidden');
      errBanner.querySelector('#retry-btn')?.addEventListener('click', () => {
        errBanner.classList.add('hidden');
        init();
      });
    }
  }
}
