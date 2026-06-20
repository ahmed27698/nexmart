<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { animate } from 'motion';
  import {
    LayoutDashboard, Package, ShoppingBag, Users, Tag,
    LogOut, Menu, X, TrendingUp, ChevronRight
  } from 'lucide-svelte';

  let { children } = $props();
  let sidebarOpen = $state(true);
  let mobileSidebarOpen = $state(false);

  onMount(() => {
    auth.init();
    setTimeout(() => {
      if (!$auth.user) goto('/auth/login');
      else if ($auth.user.role !== 'admin') goto('/');
    }, 100);
    animate('.sidebar', { opacity: [0, 1], x: [-20, 0] }, { duration: 0.4 });
    animate('.admin-main', { opacity: [0, 1] }, { duration: 0.4, delay: 0.1 });
  });

  function handleLogout() {
    auth.logout();
    goto('/');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/categories', label: 'Categories', icon: Tag },
  ];

  const isActive = (href: string) => $page.url.pathname === href;
</script>

<div class="min-h-screen bg-gray-950 flex">
    <!-- Sidebar -->
    <aside class="sidebar opacity-0 {sidebarOpen ? 'w-60' : 'w-16'} hidden md:flex flex-col bg-gray-900 border-r border-white/5 transition-all duration-300 shrink-0">
      <!-- Logo -->
      <div class="h-16 flex items-center px-4 border-b border-white/5">
        {#if sidebarOpen}
          <span class="font-black gradient-text text-lg">NEXMART</span>
          <span class="text-gray-500 text-xs ml-1 mt-0.5">Admin</span>
        {:else}
          <span class="font-black gradient-text text-lg">N</span>
        {/if}
        <button onclick={() => sidebarOpen = !sidebarOpen} class="ml-auto text-gray-400 hover:text-white transition-colors">
          <ChevronRight class="w-4 h-4 transition-transform {sidebarOpen ? 'rotate-180' : ''}" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 px-2 space-y-1">
        {#each navItems as item}
          <a href={item.href}
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 {isActive(item.href) ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
            <item.icon class="w-5 h-5 shrink-0" />
            {#if sidebarOpen}<span class="text-sm font-medium">{item.label}</span>{/if}
          </a>
        {/each}
      </nav>

      <!-- Footer -->
      <div class="p-3 border-t border-white/5">
        {#if sidebarOpen && $auth.user}
          <div class="px-3 py-2 mb-2">
            <p class="text-xs font-semibold text-white">{$auth.user.name}</p>
            <p class="text-xs text-gray-500">{$auth.user.email}</p>
          </div>
        {/if}
        <button onclick={handleLogout}
          class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut class="w-5 h-5 shrink-0" />
          {#if sidebarOpen}<span class="text-sm">Logout</span>{/if}
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="admin-main opacity-0 flex-1 flex flex-col min-h-screen overflow-hidden">
      <!-- Top bar -->
      <header class="h-16 border-b border-white/5 bg-gray-900/50 flex items-center px-6 gap-4 shrink-0">
        <button onclick={() => mobileSidebarOpen = !mobileSidebarOpen} class="md:hidden">
          <Menu class="w-5 h-5" />
        </button>
        <div class="text-sm text-gray-400 hidden md:block">
          {navItems.find(n => isActive(n.href))?.label || 'Dashboard'}
        </div>
        <div class="ml-auto flex items-center gap-3">
          <a href="/" target="_blank" class="text-xs text-gray-500 hover:text-gray-300 transition-colors">View Store →</a>
          {#if $auth.user}
            <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
              {$auth.user.name?.[0]?.toUpperCase()}
            </div>
          {/if}
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto p-6">
        {@render children()}
      </main>
    </div>

    <!-- Mobile Sidebar -->
    {#if mobileSidebarOpen}
      <div class="fixed inset-0 z-50 md:hidden">
        <button class="absolute inset-0 bg-black/60" onclick={() => mobileSidebarOpen = false}></button>
        <aside class="absolute left-0 top-0 bottom-0 w-60 bg-gray-900 border-r border-white/5 flex flex-col z-10">
          <div class="h-16 flex items-center px-4 border-b border-white/5 justify-between">
            <span class="font-black gradient-text">NEXMART Admin</span>
            <button onclick={() => mobileSidebarOpen = false}><X class="w-5 h-5" /></button>
          </div>
          <nav class="flex-1 py-4 px-2 space-y-1">
            {#each navItems as item}
              <a href={item.href} onclick={() => mobileSidebarOpen = false}
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all {isActive(item.href) ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
                <item.icon class="w-5 h-5" />
                <span class="text-sm font-medium">{item.label}</span>
              </a>
            {/each}
          </nav>
        </aside>
      </div>
    {/if}
  </div>
