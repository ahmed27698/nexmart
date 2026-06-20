<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { animate } from 'motion';
  import { api } from '$lib/api';
  import { ChevronDown } from 'lucide-svelte';

  let orders = $state<any[]>([]);
  let loading = $state(true);
  let filterStatus = $state('all');
  let updatingId = $state<number | null>(null);

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    processing: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    shipped: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20',
    delivered: 'bg-green-500/20 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/20'
  };

  onMount(async () => {
    await load();
    await tick();
    (animate as any)('.order-row', { opacity: [0, 1], x: [-10, 0] }, { duration: 0.3, delay: (_: any, i: number) => i * 0.05 });
  });

  async function load() {
    loading = true;
    try { orders = await api.get<any[]>('/orders'); }
    catch { orders = []; } finally { loading = false; }
  }

  async function updateStatus(id: number, status: string) {
    updatingId = id;
    try {
      await api.put(`/orders/${id}/status`, { status });
      orders = orders.map(o => o.id === id ? { ...o, status } : o);
    } catch { } finally { updatingId = null; }
  }

  const filtered = $derived(filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus));
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between flex-wrap gap-4">
    <div>
      <h1 class="text-2xl font-bold">Orders</h1>
      <p class="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
    </div>
    <!-- Status Filter -->
    <div class="flex items-center gap-2 flex-wrap">
      <button onclick={() => filterStatus = 'all'} class="text-xs px-3 py-1.5 rounded-full transition-colors {filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'glass text-gray-400 hover:text-white'}">All</button>
      {#each statuses as s}
        <button onclick={() => filterStatus = s} class="text-xs px-3 py-1.5 rounded-full capitalize transition-colors {filterStatus === s ? 'bg-indigo-600 text-white' : 'glass text-gray-400 hover:text-white'}">{s}</button>
      {/each}
    </div>
  </div>

  <div class="glass rounded-2xl border border-white/5 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
            <th class="text-left px-4 py-3">Order</th>
            <th class="text-left px-4 py-3 hidden md:table-cell">Customer</th>
            <th class="text-left px-4 py-3 hidden lg:table-cell">Items</th>
            <th class="text-left px-4 py-3">Total</th>
            <th class="text-left px-4 py-3">Status</th>
            <th class="text-left px-4 py-3 hidden md:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {#if loading}
            {#each {length: 6} as _}
              <tr class="border-b border-white/5">
                <td colspan="6" class="px-4 py-3"><div class="h-8 bg-white/5 rounded animate-pulse"></div></td>
              </tr>
            {/each}
          {:else if filtered.length === 0}
            <tr><td colspan="6" class="text-center py-12 text-gray-400">No orders found</td></tr>
          {:else}
            {#each filtered as order}
              <tr class="order-row opacity-0 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td class="px-4 py-3 font-mono text-indigo-400">#{order.id}</td>
                <td class="px-4 py-3 hidden md:table-cell">
                  <p class="font-medium">{order.user_name || 'Guest'}</p>
                  <p class="text-xs text-gray-500">{order.user_email || ''}</p>
                </td>
                <td class="px-4 py-3 hidden lg:table-cell">
                  <div class="space-y-0.5">
                    {#each (order.items || []).slice(0, 2) as item}
                      {#if item?.name}
                        <p class="text-xs text-gray-400 truncate max-w-[200px]">{item.quantity}× {item.name}</p>
                      {/if}
                    {/each}
                    {#if (order.items || []).length > 2}
                      <p class="text-xs text-gray-500">+{order.items.length - 2} more</p>
                    {/if}
                  </div>
                </td>
                <td class="px-4 py-3 font-bold">${parseFloat(order.total).toFixed(2)}</td>
                <td class="px-4 py-3">
                  <div class="relative">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onchange={(e) => updateStatus(order.id, (e.target as HTMLSelectElement).value)}
                      class="text-xs px-2 py-1 rounded-full border cursor-pointer focus:outline-none disabled:opacity-50 bg-transparent capitalize {statusColors[order.status] || 'bg-gray-700 text-gray-400 border-gray-600'}"
                    >
                      {#each statuses as s}
                        <option value={s} class="bg-gray-900 capitalize">{s}</option>
                      {/each}
                    </select>
                  </div>
                </td>
                <td class="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
