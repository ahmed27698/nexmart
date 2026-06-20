<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { Plus, Pencil, Trash2, X } from 'lucide-svelte';

  let categories = $state<any[]>([]);
  let loading = $state(true);
  let showModal = $state(false);
  let editing = $state<any>(null);
  let saving = $state(false);
  let form = $state({ name: '', slug: '', image_url: '' });

  onMount(async () => { await load(); });

  async function load() {
    loading = true;
    try { categories = await api.get<any[]>('/categories'); }
    catch { categories = []; } finally { loading = false; }
  }

  function openAdd() {
    editing = null;
    form = { name: '', slug: '', image_url: '' };
    showModal = true;
  }

  function openEdit(cat: any) {
    editing = cat;
    form = { name: cat.name, slug: cat.slug, image_url: cat.image_url || '' };
    showModal = true;
  }

  function autoSlug() {
    if (!editing) form.slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  async function save() {
    saving = true;
    try {
      if (editing) await api.put(`/categories/${editing.id}`, form);
      else await api.post('/categories', form);
      showModal = false;
      await load();
    } catch { } finally { saving = false; }
  }

  async function remove(id: number) {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    await load();
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Categories</h1>
      <p class="text-gray-400 text-sm">{categories.length} categories</p>
    </div>
    <button onclick={openAdd} class="btn-primary flex items-center gap-2 text-sm">
      <Plus class="w-4 h-4" /> Add Category
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#if loading}
      {#each {length: 6} as _}
        <div class="h-24 glass rounded-2xl animate-pulse"></div>
      {/each}
    {:else}
      {#each categories as cat}
        <div class="glass rounded-2xl p-4 border border-white/5 hover:border-indigo-500/20 transition-colors flex items-center gap-4">
          <img src={cat.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=60'} alt={cat.name}
            class="w-14 h-14 rounded-xl object-cover shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold">{cat.name}</p>
            <p class="text-xs text-gray-500">/{cat.slug}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button onclick={() => openEdit(cat)} class="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
              <Pencil class="w-4 h-4" />
            </button>
            <button onclick={() => remove(cat.id)} class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4" onclick={(e) => e.target === e.currentTarget && (showModal = false)}>
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
    <div class="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-bold text-lg">{editing ? 'Edit Category' : 'Add Category'}</h2>
        <button onclick={() => showModal = false} class="p-1 hover:bg-white/10 rounded-lg"><X class="w-5 h-5" /></button>
      </div>
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Name</label>
          <input type="text" bind:value={form.name} placeholder="Electronics" oninput={autoSlug}
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Slug</label>
          <input type="text" bind:value={form.slug} placeholder="electronics"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Image URL</label>
          <input type="url" bind:value={form.image_url} placeholder="https://..."
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button onclick={() => showModal = false} class="btn-secondary flex-1">Cancel</button>
        <button onclick={save} disabled={saving} class="btn-primary flex-1 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  </div>
{/if}
