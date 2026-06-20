<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import { animate } from 'motion';
  import { api } from '$lib/api';
  import { cart } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { ShoppingCart, Star, Minus, Plus, ChevronLeft, Package, Truck, Shield, PackageX } from 'lucide-svelte';

  let product = $state<any>(null);
  let loading = $state(true);
  let qty = $state(1);
  let selectedImg = $state(0);
  let adding = $state(false);
  let activeTab = $state<'description'|'reviews'>('description');

  onMount(async () => {
    try {
      const id = $page.params.id;
      product = await api.get<any>(`/products/${id}`);
    } catch { } finally { loading = false; }
    if (product) {
      await tick(); // wait for DOM to render product elements
      (animate as any)('.product-image', { opacity: [0, 1], x: [-30, 0] }, { duration: 0.6 });
      (animate as any)('.product-info',  { opacity: [0, 1], x: [30,  0] }, { duration: 0.6, delay: 0.1 });
    }
  });

  async function addToCart() {
    if (!$auth.user) { goto('/auth/login'); return; }
    adding = true;
    await cart.add(product.id, qty);
    animate('.cart-btn', { scale: [1, 0.95, 1.05, 1] }, { duration: 0.4 });
    await new Promise(r => setTimeout(r, 800));
    adding = false;
  }

  const images = $derived(product ? [product.image_url, ...(product.images || [])].filter(Boolean) : []);
  const avgRating = $derived(product?.rating ? parseFloat(product.rating) : 0);
</script>

<svelte:head>
  <title>{product?.name || 'Product'} — NEXMART</title>
</svelte:head>

{#if loading}
  <div class="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
    <div class="aspect-square rounded-2xl bg-white/5"></div>
    <div class="space-y-4">
      <div class="h-8 bg-white/5 rounded-xl w-3/4"></div>
      <div class="h-4 bg-white/5 rounded w-1/2"></div>
      <div class="h-12 bg-white/5 rounded-xl w-1/3"></div>
    </div>
  </div>
{:else if product}
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-400 mb-8">
      <a href="/" class="hover:text-white transition-colors">Home</a>
      <span>/</span>
      <a href="/products" class="hover:text-white transition-colors">Products</a>
      {#if product.category_name}
        <span>/</span>
        <a href="/products?category={product.category_slug}" class="hover:text-white transition-colors">{product.category_name}</a>
      {/if}
      <span>/</span>
      <span class="text-white truncate max-w-xs">{product.name}</span>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <!-- Images -->
      <div class="product-image opacity-0">
        <div class="aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-white/5 mb-3">
          <img src={images[selectedImg] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600'}
            alt={product.name} class="w-full h-full object-cover" />
        </div>
        {#if images.length > 1}
          <div class="flex gap-2 overflow-x-auto">
            {#each images as img, i}
              <button onclick={() => selectedImg = i}
                class="w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors shrink-0 {i === selectedImg ? 'border-indigo-500' : 'border-white/10 hover:border-white/30'}">
                <img src={img} alt="" class="w-full h-full object-cover" />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Info -->
      <div class="product-info opacity-0 flex flex-col">
        {#if product.brand}
          <p class="text-indigo-400 text-sm font-semibold mb-1">{product.brand}</p>
        {/if}
        <h1 class="text-3xl font-bold mb-3">{product.name}</h1>

        <!-- Rating -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex">
            {#each {length: 5} as _, i}
              <Star class="w-4 h-4 {i < Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}" />
            {/each}
          </div>
          <span class="text-sm text-gray-400">{avgRating.toFixed(1)} ({product.review_count} reviews)</span>
        </div>

        <!-- Price -->
        <div class="flex items-end gap-3 mb-6">
          <span class="text-4xl font-black text-white">${parseFloat(product.price).toFixed(2)}</span>
          {#if product.original_price}
            <span class="text-xl text-gray-500 line-through">${parseFloat(product.original_price).toFixed(2)}</span>
            <span class="bg-red-500/20 text-red-400 text-sm font-bold px-2 py-0.5 rounded-full">
              -{Math.round((1 - product.price / product.original_price) * 100)}%
            </span>
          {/if}
        </div>

        <!-- Stock -->
        <div class="flex items-center gap-2 mb-6">
          <div class="w-2 h-2 rounded-full {product.stock > 0 ? 'bg-green-400' : 'bg-red-500'}"></div>
          <span class="text-sm {product.stock > 0 ? 'text-green-400' : 'text-red-400'}">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <!-- Quantity -->
        {#if product.stock > 0}
          <div class="flex items-center gap-4 mb-6">
            <span class="text-sm text-gray-400">Quantity</span>
            <div class="flex items-center glass rounded-xl">
              <button onclick={() => qty = Math.max(1, qty - 1)} class="p-2 hover:text-indigo-400 transition-colors"><Minus class="w-4 h-4" /></button>
              <span class="w-10 text-center font-semibold">{qty}</span>
              <button onclick={() => qty = Math.min(product.stock, qty + 1)} class="p-2 hover:text-indigo-400 transition-colors"><Plus class="w-4 h-4" /></button>
            </div>
          </div>
        {/if}

        <!-- CTA -->
        <button
          onclick={addToCart}
          disabled={adding || product.stock === 0}
          class="cart-btn btn-primary flex items-center justify-center gap-3 text-lg mb-4 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <ShoppingCart class="w-5 h-5" />
          {adding ? 'Added to Cart!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>

        <!-- Trust Badges -->
        <div class="grid grid-cols-3 gap-3 mt-2">
          <div class="glass rounded-xl p-3 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
            <Truck class="w-5 h-5 text-indigo-400" />Free Shipping
          </div>
          <div class="glass rounded-xl p-3 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
            <Shield class="w-5 h-5 text-indigo-400" />Secure Pay
          </div>
          <div class="glass rounded-xl p-3 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
            <Package class="w-5 h-5 text-indigo-400" />Easy Returns
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs: Description / Reviews -->
    <div class="mt-12 border-t border-white/10 pt-8">
      <div class="flex gap-6 mb-6 border-b border-white/10">
        {#each [['description','Description'],['reviews','Reviews']] as [tab, label]}
          <button
            onclick={() => activeTab = tab as any}
            class="pb-3 text-sm font-semibold transition-colors relative {activeTab === tab ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}"
          >
            {label}
            {#if activeTab === tab}
              <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"></span>
            {/if}
          </button>
        {/each}
      </div>

      {#if activeTab === 'description'}
        <div class="prose prose-invert max-w-none">
          <p class="text-gray-300 leading-relaxed">{product.description || 'No description available.'}</p>
          {#if product.tags?.length}
            <div class="flex flex-wrap gap-2 mt-4">
              {#each product.tags as tag}
                <span class="glass px-3 py-1 rounded-full text-xs text-gray-300">{tag}</span>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <div class="space-y-4">
          {#if product.reviews?.length === 0}
            <p class="text-gray-400">No reviews yet. Be the first!</p>
          {:else}
            {#each product.reviews || [] as review}
              <div class="glass rounded-2xl p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold">{review.user_name}</span>
                  <div class="flex">
                    {#each {length: 5} as _, i}
                      <Star class="w-3.5 h-3.5 {i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}" />
                    {/each}
                  </div>
                </div>
                <p class="text-gray-300 text-sm">{review.comment}</p>
                <p class="text-gray-500 text-xs mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="text-center py-24 text-gray-400">
    <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
      <PackageX class="w-8 h-8 opacity-40" />
    </div>
    <p class="text-xl font-semibold">Product not found</p>
    <a href="/products" class="mt-4 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
      <ChevronLeft class="w-4 h-4" /> Back to products
    </a>
  </div>
{/if}
