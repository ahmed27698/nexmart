<script lang="ts">
  import { onMount } from 'svelte';
  import { animate, inView } from 'motion';
  import { api } from '$lib/api';
  import { TrendingUp, ShoppingBag, Users, Package, Clock, DollarSign, AlertCircle } from 'lucide-svelte';

  let stats = $state<any>(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      const data = await api.get<any>('/analytics/dashboard');
      stats = data;
    } catch { } finally { loading = false; }

    animate('.stat-card', { opacity: [0, 1], y: [20, 0], scale: [0.97, 1] }, { duration: 0.4, delay: (_, i) => i * 0.07 });

    inView('.chart-section', (info) => {
      animate((info as any).target, { opacity: [0, 1], y: [30, 0] }, { duration: 0.5 });
    });
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-indigo-500/20 text-indigo-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400'
  };
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <p class="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {#each [
      { label: 'Total Revenue', value: stats ? `$${stats.stats.revenue.toLocaleString('en', {minimumFractionDigits:2})}` : '—', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
      { label: 'Total Orders', value: stats?.stats.orders ?? '—', icon: ShoppingBag, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
      { label: 'Customers', value: stats?.stats.users ?? '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { label: 'Active Products', value: stats?.stats.products ?? '—', icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' }
    ] as s}
      <div class="stat-card opacity-0 glass rounded-2xl p-5 border border-white/5 hover:border-indigo-500/20 transition-colors">
        <div class="flex items-start justify-between mb-4">
          <div class="w-10 h-10 {s.bg} rounded-xl flex items-center justify-center">
            <s.icon class="w-5 h-5 {s.color}" />
          </div>
        </div>
        <div class="text-2xl font-black {loading ? 'animate-pulse text-gray-600' : ''}">{s.value}</div>
        <div class="text-gray-400 text-sm mt-1">{s.label}</div>
      </div>
    {/each}
  </div>

  <!-- Pending Alert -->
  {#if stats?.stats.pendingOrders > 0}
    <div class="flex items-center gap-3 glass border border-yellow-500/20 rounded-2xl px-5 py-4">
      <AlertCircle class="w-5 h-5 text-yellow-400 shrink-0" />
      <span class="text-sm">You have <strong class="text-yellow-400">{stats.stats.pendingOrders} pending orders</strong> awaiting fulfillment.</span>
      <a href="/admin/orders" class="ml-auto text-xs text-yellow-400 hover:text-yellow-300 transition-colors whitespace-nowrap">View Orders →</a>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Recent Orders -->
    <div class="chart-section opacity-0 glass rounded-2xl p-5 border border-white/5">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-semibold">Recent Orders</h2>
        <a href="/admin/orders" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</a>
      </div>
      {#if loading}
        <div class="space-y-3">
          {#each {length: 5} as _}
            <div class="h-12 bg-white/5 rounded-xl animate-pulse"></div>
          {/each}
        </div>
      {:else}
        <div class="space-y-2">
          {#each stats?.recentOrders || [] as order}
            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div class="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center shrink-0">
                <ShoppingBag class="w-4 h-4 text-indigo-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{order.user_name || 'Guest'}</p>
                <p class="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-bold">${parseFloat(order.total).toFixed(2)}</p>
                <span class="text-xs px-2 py-0.5 rounded-full {statusColors[order.status] || 'bg-gray-700 text-gray-400'}">{order.status}</span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Top Products -->
    <div class="chart-section opacity-0 glass rounded-2xl p-5 border border-white/5">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-semibold">Top Products</h2>
        <a href="/admin/products" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Manage →</a>
      </div>
      {#if loading}
        <div class="space-y-3">
          {#each {length: 5} as _}
            <div class="h-14 bg-white/5 rounded-xl animate-pulse"></div>
          {/each}
        </div>
      {:else}
        <div class="space-y-2">
          {#each stats?.topProducts || [] as product, i}
            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <span class="text-xs font-bold text-gray-500 w-4">{i + 1}</span>
              <img src={product.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=40'} alt="" class="w-10 h-10 rounded-lg object-cover shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{product.name}</p>
                <p class="text-xs text-gray-500">{product.sold} sold</p>
              </div>
              <span class="text-sm font-bold">${parseFloat(product.price).toFixed(2)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Order Status Breakdown -->
  {#if stats?.ordersByStatus}
    <div class="chart-section opacity-0 glass rounded-2xl p-5 border border-white/5">
      <h2 class="font-semibold mb-5">Order Status Breakdown</h2>
      <div class="flex flex-wrap gap-3">
        {#each stats.ordersByStatus as s}
          <div class="flex items-center gap-2 glass px-4 py-2 rounded-xl">
            <span class="capitalize text-sm font-medium {statusColors[s.status]?.split(' ')[1] || 'text-gray-400'}">{s.status}</span>
            <span class="text-lg font-black">{s.count}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
