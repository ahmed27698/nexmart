<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';
  import { cart } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { Filter, SlidersHorizontal, Search } from 'lucide-svelte';

  let products = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let total = $state(0);
  let loading = $state(true);
  let page_num = $state(1);
  const limit = 20;

  const search = $derived($page.url.searchParams.get('search') || '');
  const category = $derived($page.url.searchParams.get('category') || '');

  let minPrice = $state('');
  let maxPrice = $state('');
  let sortBy = $state('created_at');
  let sidebarOpen = $state(false);

  async function loadProducts() {
    loading = true;
    try {
      let url = `/products?page=${page_num}&limit=${limit}&sort=${sortBy}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      const data = await api.get<any>(url);
      products = data.products || [];
      total = data.total || 0;
    } catch { products = []; } finally { loading = false; }
  }

  onMount(async () => {
    const cats = await api.get<any[]>('/categories').catch(() => []);
    categories = cats;
  });

  $effect(() => {
    // fires once on mount and again whenever search/category URL params change
    search; category;
    page_num = 1;
    loadProducts();
  });

  async function addToCart(product: any) {
    if (!$auth.user) { goto('/auth/login'); return; }
    await cart.add(product.id, 1);
  }

  const totalPages = $derived(Math.ceil(total / limit));
</script>

<svelte:head>
  <title>{search ? `Search: ${search}` : category ? category : 'All Products'} — NEXMART</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold">
        {#if search}Results for "<span class="gradient-text">{search}</span>"{:else if category}<span class="capitalize gradient-text">{category.replace('-',' ')}</span>{:else}All Products{/if}
      </h1>
      {#if !loading}<p class="text-gray-400 text-sm mt-1">{total} products found</p>{/if}
    </div>
    <div class="flex items-center gap-3">
      <select bind:value={sortBy} onchange={loadProducts}
        class="glass border border-white/10 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 bg-transparent">
        <option value="created_at" class="bg-gray-900">Newest</option>
        <option value="price" class="bg-gray-900">Price: Low to High</option>
        <option value="rating" class="bg-gray-900">Top Rated</option>
      </select>
      <button onclick={() => sidebarOpen = !sidebarOpen}
        class="glass px-3 py-2 rounded-xl flex items-center gap-2 text-sm hover:border-indigo-500/50 transition-colors md:hidden">
        <Filter class="w-4 h-4" /> Filters
      </button>
    </div>
  </div>

  <div class="flex gap-6">
    <!-- Sidebar Filters -->
    <aside class="w-56 shrink-0 {sidebarOpen ? 'block' : 'hidden'} md:block">
      <div class="glass rounded-2xl p-4 sticky top-28 space-y-6">
        <div>
          <h3 class="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Categories</h3>
          <div class="space-y-1">
            <a href="/products" class="block text-sm px-2 py-1.5 rounded-lg {!category ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400 hover:text-white hover:bg-white/5'} transition-colors">All Products</a>
            {#each categories as cat}
              <a href="/products?category={cat.slug}"
                class="block text-sm px-2 py-1.5 rounded-lg {category === cat.slug ? 'bg-indigo-600/30 text-indigo-300' : 'text-gray-400 hover:text-white hover:bg-white/5'} transition-colors">
                {cat.name}
              </a>
            {/each}
          </div>
        </div>

        <div>
          <h3 class="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-400">Price Range</h3>
          <div class="flex gap-2">
            <input bind:value={minPrice} type="number" placeholder="Min" class="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
            <input bind:value={maxPrice} type="number" placeholder="Max" class="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <button onclick={loadProducts} class="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors">Apply</button>
        </div>
      </div>
    </aside>

    <!-- Product Grid -->
    <div class="flex-1">
      {#if loading}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {#each {length: 12} as _}
            <div class="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse"></div>
          {/each}
        </div>
      {:else if products.length === 0}
        <div class="text-center py-24 text-gray-400">
          <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Search class="w-8 h-8 opacity-40" />
          </div>
          <p class="text-xl font-semibold">No products found</p>
          <p class="mt-2 text-sm">Try a different search or category</p>
        </div>
      {:else}
        <div class="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {#each products as product}
            <div class="product-item">
              <ProductCard {product} on:addToCart={() => addToCart(product)} />
            </div>
          {/each}
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
          <div class="flex justify-center gap-2 mt-10">
            <button disabled={page_num === 1} onclick={() => { page_num--; loadProducts(); }}
              class="px-4 py-2 glass rounded-xl text-sm disabled:opacity-40 hover:border-indigo-500/50 transition-colors">
              Previous
            </button>
            {#each Array.from({length: Math.min(totalPages, 7)}, (_, i) => i + 1) as p}
              <button onclick={() => { page_num = p; loadProducts(); }}
                class="w-10 h-10 rounded-xl text-sm {p === page_num ? 'bg-indigo-600' : 'glass hover:border-indigo-500/50'} transition-colors">
                {p}
              </button>
            {/each}
            <button disabled={page_num === totalPages} onclick={() => { page_num++; loadProducts(); }}
              class="px-4 py-2 glass rounded-xl text-sm disabled:opacity-40 hover:border-indigo-500/50 transition-colors">
              Next
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>
