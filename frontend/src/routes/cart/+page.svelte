<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { animate } from 'motion';
  import { cart, cartTotal } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-svelte';

  let animatedOnce = false;

  $effect(() => {
    if ($cart.length > 0 && !animatedOnce) {
      animatedOnce = true;
      tick().then(() => {
        (animate as any)('.cart-item', { opacity: [0, 1], x: [-30, 0] }, { duration: 0.4, delay: (_: any, i: number) => i * 0.08 });
      });
    }
  });

  onMount(() => {
    if (!$auth.user) { goto('/auth/login'); return; }
  });

  async function remove(product_id: number) {
    await cart.remove(product_id);
  }
</script>

<svelte:head><title>Cart — NEXMART</title></svelte:head>

<div class="max-w-5xl mx-auto px-4 py-10">
  <h1 class="text-3xl font-bold mb-8">Your Cart</h1>

  {#if $cart.length === 0}
    <div class="text-center py-24 text-gray-400">
      <ShoppingBag class="w-20 h-20 mx-auto mb-4 opacity-30" />
      <p class="text-xl font-semibold">Your cart is empty</p>
      <a href="/products" class="mt-4 inline-block btn-primary">Start Shopping</a>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Items -->
      <div class="lg:col-span-2 space-y-3">
        {#each $cart as item}
          <div class="cart-item glass rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-500/20 transition-colors">
            <img src={item.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'}
              alt={item.name} class="w-20 h-20 object-cover rounded-xl shrink-0" />
            <div class="flex-1 min-w-0">
              <a href="/products/{item.product_id}" class="font-semibold hover:text-indigo-400 transition-colors line-clamp-2 text-sm">{item.name}</a>
              <div class="flex items-center gap-2 mt-2">
                <span class="font-bold text-indigo-400">${(item.price * item.quantity).toFixed(2)}</span>
                {#if item.original_price}
                  <span class="text-gray-500 line-through text-xs">${(item.original_price * item.quantity).toFixed(2)}</span>
                {/if}
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div class="flex items-center glass rounded-xl">
                <button onclick={() => cart.updateQty(item.product_id, item.quantity - 1)} class="p-1.5 hover:text-indigo-400 transition-colors"><Minus class="w-3.5 h-3.5" /></button>
                <span class="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                <button onclick={() => cart.updateQty(item.product_id, item.quantity + 1)} disabled={item.quantity >= item.stock} class="p-1.5 hover:text-indigo-400 transition-colors disabled:opacity-40"><Plus class="w-3.5 h-3.5" /></button>
              </div>
              <button onclick={() => remove(item.product_id)} class="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        {/each}
      </div>

      <!-- Summary -->
      <div class="lg:col-span-1">
        <div class="glass rounded-2xl p-6 sticky top-28">
          <h2 class="text-xl font-bold mb-6">Order Summary</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between text-gray-400">
              <span>Subtotal</span><span>${$cartTotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span>Shipping</span><span class="text-green-400">{$cartTotal >= 50 ? 'Free' : '$5.99'}</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span>Tax (8%)</span><span>${($cartTotal * 0.08).toFixed(2)}</span>
            </div>
            <div class="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span class="gradient-text">${($cartTotal + ($cartTotal < 50 ? 5.99 : 0) + $cartTotal * 0.08).toFixed(2)}</span>
            </div>
          </div>
          <button onclick={() => goto('/checkout')} class="w-full btn-primary mt-6 flex items-center justify-center gap-2">
            Checkout <ArrowRight class="w-4 h-4" />
          </button>
          <a href="/products" class="block text-center text-indigo-400 hover:text-indigo-300 text-sm mt-3 transition-colors">
            ← Continue Shopping
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>
