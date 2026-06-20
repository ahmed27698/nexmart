<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/api';
  import { ClipboardList, Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-svelte';

  let orders = $state<any[]>([]);
  let loading = $state(true);
  let expanded = $state<number | null>(null);

  const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    pending:    { icon: Clock,         color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending'    },
    processing: { icon: Package,       color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Processing' },
    shipped:    { icon: Truck,         color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Shipped'    },
    delivered:  { icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Delivered'  },
    cancelled:  { icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Cancelled'  },
  };

  onMount(async () => {
    if (!$auth.user) { goto('/auth/login'); return; }
    try {
      orders = await api.get<any[]>('/orders/my');
    } catch { } finally { loading = false; }
  });

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
</script>

<svelte:head><title>My Orders — NEXMART</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
  <div class="flex items-center gap-3 mb-10">
    <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
      <ClipboardList class="w-5 h-5 text-indigo-400" />
    </div>
    <div>
      <h1 class="text-2xl font-black">My Orders</h1>
      <p class="text-gray-400 text-sm">Track and manage your purchases</p>
    </div>
  </div>

  {#if loading}
    <div class="space-y-3">
      {#each {length: 4} as _}
        <div class="h-20 rounded-2xl bg-white/5 animate-pulse"></div>
      {/each}
    </div>
  {:else if orders.length === 0}
    <div class="text-center py-24 text-gray-400">
      <Package class="w-16 h-16 mx-auto mb-4 opacity-20" />
      <p class="text-xl font-semibold">No orders yet</p>
      <p class="mt-2 text-sm">When you place an order, it will appear here.</p>
      <a href="/products" class="mt-6 inline-block btn-primary px-6 py-2.5 text-sm">Start Shopping</a>
    </div>
  {:else}
    <div class="space-y-3">
      {#each orders as order}
        {@const status = statusConfig[order.status] ?? statusConfig['pending']}
        <div class="glass rounded-2xl border border-white/5 overflow-hidden">
          <!-- Order header -->
          <button onclick={() => expanded = expanded === order.id ? null : order.id}
            class="w-full flex items-center gap-4 p-5 hover:bg-white/3 transition-colors text-left">
            <div class="w-9 h-9 {status.bg} rounded-xl flex items-center justify-center shrink-0">
              <svelte:component this={status.icon} class="w-4 h-4 {status.color}" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-sm">Order #{order.id}</span>
                <span class="text-xs px-2 py-0.5 rounded-full {status.bg} {status.color} font-medium">{status.label}</span>
              </div>
              <div class="text-xs text-gray-500 mt-0.5">{formatDate(order.created_at)} · {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="font-bold">${parseFloat(order.total).toFixed(2)}</div>
              <ChevronRight class="w-4 h-4 text-gray-500 mt-0.5 ml-auto transition-transform {expanded === order.id ? 'rotate-90' : ''}" />
            </div>
          </button>

          <!-- Order items (expanded) -->
          {#if expanded === order.id}
            <div class="border-t border-white/5 p-5 space-y-3">
              {#each (order.items ?? []).filter((i: any) => i?.product_id) as item}
                <div class="flex items-center gap-3">
                  {#if item.image_url}
                    <img src={item.image_url} alt={item.name} class="w-12 h-12 rounded-xl object-cover bg-white/5 shrink-0" />
                  {:else}
                    <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Package class="w-5 h-5 text-gray-600" />
                    </div>
                  {/if}
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{item.name}</p>
                    <p class="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div class="text-sm font-semibold shrink-0">${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                </div>
              {/each}
              <div class="border-t border-white/5 pt-3 flex justify-between text-sm">
                <span class="text-gray-400">Order total</span>
                <span class="font-bold">${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
