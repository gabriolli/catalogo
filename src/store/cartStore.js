// Key used for LocalStorage
const CART_STORAGE_KEY = 'catalogo-cart';

// Custom event name for cart updates
const CART_EVENT = 'cart:updated';

// Helper to get cart from LocalStorage
export function getCart() {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse cart JSON', e);
    return [];
  }
}

// Helper to save cart and dispatch event
function saveCart(cart) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  
  const detail = {
    cart,
    count: getItemCount(),
    total: getTotal()
  };
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail }));
}

// Add item to cart
export function addItem(item) {
  // item expect { id, nome, preco, imagem, tamanho, quantidade }
  const cart = getCart();
  
  // Identifica produto pelo ID + Tamanho
  const existingItemIndex = cart.findIndex(
    (i) => i.id === item.id && i.tamanho === item.tamanho
  );

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantidade += (item.quantidade || 1);
  } else {
    cart.push({ ...item, quantidade: item.quantidade || 1 });
  }

  saveCart(cart);
}

// Remove item from cart
export function removeItem(id, tamanho) {
  let cart = getCart();
  cart = cart.filter((i) => !(i.id === id && i.tamanho === tamanho));
  saveCart(cart);
}

// Update quantity
export function updateQuantity(id, tamanho, newQuantity) {
  const cart = getCart();
  const existingItem = cart.find((i) => i.id === id && i.tamanho === tamanho);
  
  if (existingItem) {
    if (newQuantity <= 0) {
      removeItem(id, tamanho);
      return;
    }
    existingItem.quantidade = newQuantity;
    saveCart(cart);
  }
}

// Get total count of items (sum of quantities)
export function getItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantidade, 0);
}

// Get total price
export function getTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}
