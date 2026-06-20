<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { animate } from 'motion';
  import { ShoppingCart, Star, Heart } from 'lucide-svelte';

  let { product } = $props<{ product: any }>();
  const dispatch = createEventDispatcher();

  let cardEl = $state<HTMLElement | null>(null);
  let wishlist = $state(false);
  let adding = $state(false);

  const discount = $derived(
    product.original_price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : 0
  );

  function onMouseEnter() {
    if (!cardEl) return;
    animate(cardEl.querySelector('.card-img'), { scale: 1.08 }, { duration: 0.4 });
    animate(cardEl.querySelector('.add-btn'), { y: [10, 0], opacity: [0, 1] }, { duration: 0.25 });
  }

  function onMouseLeave() {
    if (!cardEl) return;
    animate(cardEl.querySelector('.card-img'), { scale: 1 }, { duration: 0.4 });
    animate(cardEl.querySelector('.add-btn'), { y: [0, 8], opacity: [1, 0] }, { duration: 0.2 });
  }

  async function handleAdd() {
    adding = true;
    if (cardEl) {
      animate(cardEl.querySelector('.cart-icon'), { scale: [1, 1.4, 1], rotate: [0, -15, 0] }, { duration: 0.4 });
    }
    dispatch('addToCart');
    await new Promise(r => setTimeout(r, 600));
    adding = false;
  }

  function toggleWishlist() {
    wishlist = !wishlist;
    if (cardEl) {
      animate(cardEl.querySelector('.heart-icon'), { scale: [1, 1.5, 1] }, { duration: 0.3 });
    }
  }
</script>

<div
  bind:this={cardEl}
  role="article"
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  class="group relative bg-gray-900 rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
>
  <!-- Image -->
  <a href="/products/{product.id}" class="block relative aspect-square overflow-hidden bg-gray-800">
    <img
      src={product.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'}
      alt={product.name}
      class="card-img w-full h-full object-cover"
    />
    <!-- Badges -->
    <div class="absolute top-2 left-2 flex flex-col gap-1">
      {#if discount > 0}
        <span class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
      {/if}
      {#if product.is_featured}
        <span class="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Featured</span>
      {/if}
      {#if product.stock === 0}
        <span class="bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">Out of Stock</span>
      {/if}
    </div>
    <!-- Wishlist -->
    <button
      onclick={toggleWishlist}
      class="heart-icon absolute top-2 right-2 w-8 h-8 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Heart class="w-4 h-4 {wishlist ? 'fill-red-500 text-red-500' : 'text-white'}" />
    </button>
  </a>

  <!-- Info -->
  <div class="p-3">
    <a href="/products/{product.id}">
      <p class="text-xs text-indigo-400 mb-1">{product.category_name || 'General'}</p>
      <h3 class="font-semibold text-sm leading-tight line-clamp-2 hover:text-indigo-300 transition-colors">{product.name}</h3>

      <!-- Rating -->
      {#if product.rating > 0}
        <div class="flex items-center gap-1 mt-1.5">
          <Star class="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span class="text-xs text-gray-300">{parseFloat(product.rating).toFixed(1)}</span>
          <span class="text-xs text-gray-500">({product.review_count})</span>
        </div>
      {/if}

      <!-- Price -->
      <div class="flex items-center gap-2 mt-2">
        <span class="font-bold text-white">${parseFloat(product.price).toFixed(2)}</span>
        {#if product.original_price}
          <span class="text-gray-500 line-through text-sm">${parseFloat(product.original_price).toFixed(2)}</span>
        {/if}
      </div>
    </a>

    <!-- Add to Cart -->
    <button
      onclick={handleAdd}
      disabled={adding || product.stock === 0}
      class="add-btn opacity-0 w-full mt-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-xl transition-colors"
    >
      <ShoppingCart class="cart-icon w-4 h-4" />
      {adding ? 'Added!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
    </button>
  </div>
</div>
