/**
 * main.js — Bootstrap entry point: initialises all modules in order
 */

import { init as uiInit }       from './ui.js';
import { init as authInit }     from './auth.js';
import { init as balanceInit }  from './balance.js';
import { init as cartInit }     from './cart.js';
import { init as navbarInit }   from './navbar.js';
import { init as bannerInit }   from './banner.js';
import { init as productsInit } from './products.js';
import { init as reviewsInit }  from './reviews.js';

document.addEventListener('DOMContentLoaded', async () => {
  uiInit();       // First — exposes window.showToast globally
  authInit();     // Auth modals & session restore
  balanceInit();  // Balance display & add-money modal
  cartInit();     // Cart sidebar & badge
  navbarInit();   // Hamburger, active links, scroll shadow
  bannerInit();   // Hero slider
  await productsInit();  // Fetch API → render products
  await reviewsInit();   // Local JSON → render reviews
});
