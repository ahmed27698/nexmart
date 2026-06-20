import { writable, derived } from 'svelte/store';
import { api } from '$lib/api';

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  quantity: number;
  stock: number;
}

function createCartStore() {
  const { subscribe, set, update } = writable<CartItem[]>([]);

  return {
    subscribe,
    async load() {
      try {
        const items = await api.get<CartItem[]>('/cart');
        set(items);
      } catch { set([]); }
    },
    async add(product_id: number, quantity = 1) {
      await api.post('/cart', { product_id, quantity });
      await this.load();
    },
    async updateQty(product_id: number, quantity: number) {
      await api.put(`/cart/${product_id}`, { quantity });
      if (quantity < 1) {
        update(items => items.filter(i => i.product_id !== product_id));
      } else {
        update(items => items.map(i => i.product_id === product_id ? { ...i, quantity } : i));
      }
    },
    async remove(product_id: number) {
      await api.delete(`/cart/${product_id}`);
      update(items => items.filter(i => i.product_id !== product_id));
    },
    addLocal(item: Omit<CartItem, 'id'>) {
      update(items => {
        const existing = items.find(i => i.product_id === item.product_id);
        if (existing) return items.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + item.quantity } : i);
        return [...items, { ...item, id: Date.now() }];
      });
    },
    clear() { set([]); }
  };
}

export const cart = createCartStore();
export const cartCount = derived(cart, $cart => $cart.reduce((sum, i) => sum + i.quantity, 0));
export const cartTotal = derived(cart, $cart => $cart.reduce((sum, i) => sum + i.price * i.quantity, 0));
