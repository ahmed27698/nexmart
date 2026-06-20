<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { cart } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { Flame, Tag, ArrowRight } from 'lucide-svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';

  let products = $state<any[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const res = await api.get<any>('/products?sort=discount&limit=24');
      products = res.products || [];
    } catch { } finally { loading = false; }
  });

  async function addToCart(product: any) {
    if (!$auth.user) { goto('/auth/login'); return; }
    await cart.add(product.id, 1);
  }
</script>

<svelte:head><title>Deals — NEXMART</title></svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
  <!-- Header -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-950 via-red-950 to-gray-900 border border-orange-500/20 p-10 sm:p-14 mb-12 text-center">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.2)_0%,transparent_70%)] pointer-events-none"></div>
    <div class="relative">
      <div class="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-4 py-1.5 rounded-full mb-5">
        <Flame class="w-4 h-4 text-orange-400 animate-pulse" />
        <span class="text-orange-400 text-sm font-bold uppercase tracking-wider">Limited Time Offers</span>
      </div>
      <h1 class="text-5xl sm:text-6xl font-black mb-3">
        Today's <span style="background: linear-gradient(135deg, #fb923c, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Deals</span>
      </h1>
      <p class="text-gray-400 text-lg">Exclusive discounts on top products. Grab them before they're gone.</p>
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
      <Tag class="w-16 h-16 mx-auto mb-4 opacity-20" />
      <p class="text-xl font-semibold">No deals right now</p>
      <p class="mt-2 text-sm">Check back soon for new offers.</p>
      <a href="/products" class="mt-6 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
        Browse all products <ArrowRight class="w-4 h-4" />
      </a>
    </div>
  {:else}
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">{products.length} deals available</h2>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each products as product}
        <ProductCard {product} on:addToCart={() => addToCart(product)} />
      {/each}
    </div>
  {/if}
</div>
