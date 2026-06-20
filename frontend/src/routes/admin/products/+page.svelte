<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { animate } from 'motion';
  import { api } from '$lib/api';
  import { Plus, Pencil, Trash2, Search, X, Package } from 'lucide-svelte';

  let products = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let loading = $state(true);
  let search = $state('');
  let showModal = $state(false);
  let editing = $state<any>(null);
  let saving = $state(false);
  let error = $state('');

  let form = $state({
    name: '', description: '', price: '', original_price: '', stock: '',
    category_id: '', image_url: '', brand: '', is_featured: false, is_active: true, tags: ''
  });

  onMount(async () => {
    await loadData();
    await tick();
    (animate as any)('.product-row', { opacity: [0, 1], x: [-10, 0] }, { duration: 0.3, delay: (_: any, i: number) => i * 0.04 });
  });

  async function loadData() {
    loading = true;
    try {
      const [prods, cats] = await Promise.all([
        api.get<any>('/products?limit=100'),
        api.get<any[]>('/categories')
      ]);
      products = prods.products || [];
      categories = cats || [];
    } catch { } finally { loading = false; }
  }

  const filtered = $derived(
    search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : products
  );

  function openAdd() {
    editing = null;
    form = { name: '', description: '', price: '', original_price: '', stock: '', category_id: '', image_url: '', brand: '', is_featured: false, is_active: true, tags: '' };
    showModal = true;
    setTimeout(() => animate('.modal-card', { opacity: [0, 1], scale: [0.95, 1], y: [-20, 0] }, { duration: 0.3 }), 10);
  }

  function openEdit(product: any) {
    editing = product;
    form = {
      name: product.name, description: product.description || '', price: product.price,
      original_price: product.original_price || '', stock: product.stock,
      category_id: product.category_id || '', image_url: product.image_url || '',
      brand: product.brand || '', is_featured: product.is_featured, is_active: product.is_active,
      tags: (product.tags || []).join(', ')
    };
    showModal = true;
    setTimeout(() => animate('.modal-card', { opacity: [0, 1], scale: [0.95, 1], y: [-20, 0] }, { duration: 0.3 }), 10);
  }

  async function save() {
    saving = true; error = '';
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock),
        category_id: form.category_id ? parseInt(form.category_id) : null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      };
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post('/products', payload);
      showModal = false;
      await loadData();
    } catch (err: any) { error = err.message; } finally { saving = false; }
  }

  async function deactivate(id: number) {
    if (!confirm('Deactivate this product?')) return;
    await api.delete(`/products/${id}`);
    await loadData();
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Products</h1>
      <p class="text-gray-400 text-sm mt-1">{products.length} total products</p>
    </div>
    <button onclick={openAdd} class="btn-primary flex items-center gap-2 text-sm">
      <Plus class="w-4 h-4" /> Add Product
    </button>
  </div>

  <!-- Search -->
  <div class="relative max-w-sm">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input bind:value={search} type="text" placeholder="Search products..."
      class="w-full pl-10 pr-4 py-2.5 glass border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
  </div>

  <!-- Table -->
  <div class="glass rounded-2xl border border-white/5 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
            <th class="text-left px-4 py-3">Product</th>
            <th class="text-left px-4 py-3 hidden md:table-cell">Category</th>
            <th class="text-left px-4 py-3">Price</th>
            <th class="text-left px-4 py-3 hidden lg:table-cell">Stock</th>
            <th class="text-left px-4 py-3 hidden lg:table-cell">Status</th>
            <th class="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if loading}
            {#each {length: 8} as _}
              <tr class="border-b border-white/5">
                <td colspan="6" class="px-4 py-3"><div class="h-8 bg-white/5 rounded animate-pulse"></div></td>
              </tr>
            {/each}
          {:else}
            {#each filtered as product}
              <tr class="product-row opacity-0 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img src={product.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=40'} alt=""
                      class="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-800" />
                    <div class="min-w-0">
                      <p class="font-medium truncate max-w-[200px]">{product.name}</p>
                      {#if product.brand}<p class="text-xs text-gray-500">{product.brand}</p>{/if}
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 hidden md:table-cell text-gray-400">{product.category_name || '—'}</td>
                <td class="px-4 py-3">
                  <span class="font-semibold">${parseFloat(product.price).toFixed(2)}</span>
                  {#if product.original_price}
                    <span class="text-gray-500 line-through text-xs ml-1">${parseFloat(product.original_price).toFixed(2)}</span>
                  {/if}
                </td>
                <td class="px-4 py-3 hidden lg:table-cell">
                  <span class="{product.stock < 5 ? 'text-red-400' : product.stock < 20 ? 'text-yellow-400' : 'text-green-400'}">{product.stock}</span>
                </td>
                <td class="px-4 py-3 hidden lg:table-cell">
                  <span class="text-xs px-2 py-0.5 rounded-full {product.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}">
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {#if product.is_featured}
                    <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 ml-1">Featured</span>
                  {/if}
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button onclick={() => openEdit(product)} class="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button onclick={() => deactivate(product.id)} class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Modal -->
{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4" onclick={(e) => e.target === e.currentTarget && (showModal = false)}>
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
    <div class="modal-card opacity-0 relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold">{editing ? 'Edit Product' : 'Add Product'}</h2>
        <button onclick={() => showModal = false} class="p-2 hover:bg-white/10 rounded-xl transition-colors"><X class="w-5 h-5" /></button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each [
          ['Name *','text','name','Product name'],
          ['Brand','text','brand','e.g. Sony, Nike'],
          ['Price *','number','price','0.00'],
          ['Original Price','number','original_price','0.00'],
          ['Stock *','number','stock','0'],
          ['Image URL','url','image_url','https://...']
        ] as [label, type, field, placeholder]}
          <div class="{field === 'name' || field === 'image_url' ? 'md:col-span-2' : ''}">
            <label class="block text-xs text-gray-400 mb-1.5">{label}</label>
            <input {type} bind:value={form[field as keyof typeof form]} {placeholder}
              class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
        {/each}

        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Category</label>
          <select bind:value={form.category_id} class="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500">
            <option value="">No category</option>
            {#each categories as cat}
              <option value={cat.id}>{cat.name}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-400 mb-1.5">Tags (comma-separated)</label>
          <input type="text" bind:value={form.tags} placeholder="gaming, sale, new"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs text-gray-400 mb-1.5">Description</label>
          <textarea bind:value={form.description} rows={3} placeholder="Product description..."
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"></textarea>
        </div>

        <div class="md:col-span-2 flex items-center gap-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" bind:checked={form.is_featured} class="w-4 h-4 accent-indigo-600" />
            <span class="text-sm">Featured</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" bind:checked={form.is_active} class="w-4 h-4 accent-indigo-600" />
            <span class="text-sm">Active</span>
          </label>
        </div>
      </div>

      {#if error}
        <p class="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-xl mt-4">{error}</p>
      {/if}

      <div class="flex gap-3 mt-6">
        <button onclick={() => showModal = false} class="btn-secondary flex-1">Cancel</button>
        <button onclick={save} disabled={saving} class="btn-primary flex-1 disabled:opacity-60">
          {saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </div>
  </div>
{/if}
