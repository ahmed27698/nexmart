<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { cart } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { Sparkles, Package } from 'lucide-svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';

  let products = $state<any[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const res = await api.get<any>('/products?sort=created_at&limit=24');
      products = res.products || [];
    } catch { } finally { loading = false; }
  });

  async function addToCart(product: any) {
    if (!$auth.user) { goto('/auth/login'); return; }
    await cart.add(product.id, 1);
  }
</script>

<svelte:head><title>New Arrivals — NEXMART</title></svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
  <!-- Header -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-900 border border-indigo-500/20 p-10 sm:p-14 mb-12 text-center">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25)_0%,transparent_70%)] pointer-events-none"></div>
    <div class="relative">
      <div class="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full mb-5">
        <Sparkles class="w-4 h-4 text-indigo-400" />
        <span class="text-indigo-400 text-sm font-bold uppercase tracking-wider">Just In</span>
      </div>
      <h1 class="text-5xl sm:text-6xl font-black mb-3">
        New <span class="gradient-text">Arrivals</span>
      </h1>
      <p class="text-gray-400 text-lg">The latest products, freshly added to our catalog.</p>
    </div>
  </div>

  <!-- Products -->
  {#if loading}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each {length: 12} as _}
        <div class="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse"></div>
      {/each}
    </div>
  {:else if products.length === 0}
    <div class="text-center py-24 text-gray-400">
      <Package class="w-16 h-16 mx-auto mb-4 opacity-20" />
      <p class="text-xl font-semibold">No products yet</p>
      <p class="mt-2 text-sm">New items are added regularly. Check back soon!</p>
    </div>
  {:else}
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">{products.length} new products</h2>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each products as product}
        <ProductCard {product} on:addToCart={() => addToCart(product)} />
      {/each}
    </div>
  {/if}
</div>
