<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { auth, isAdmin } from '$lib/stores/auth';
  import { cart, cartCount } from '$lib/stores/cart';
  import { goto } from '$app/navigation';
  import {
    ShoppingCart, Search, Menu, X, LogOut, LayoutDashboard,
    Phone, HelpCircle, RotateCcw, Truck,
    Info, Briefcase, Newspaper, Shield,
    Cpu, Gamepad2, Gamepad, Shirt, BookOpen, Home, Trophy, Puzzle,
    Flame, Sparkles, Settings, ClipboardList
  } from 'lucide-svelte';
  import { animate } from 'motion';

  let { children } = $props();
  let menuOpen = $state(false);
  let searchQuery = $state('');
  let scrolled = $state(false);

  const isAdminRoute = $derived($page.url.pathname.startsWith('/admin'));

  onMount(() => {
    auth.init();
    if ($auth.user) cart.load();
    const handleScroll = () => { scrolled = window.scrollY > 20; };
    window.addEventListener('scroll', handleScroll);
    animate('.navbar', { opacity: [0, 1], y: [-20, 0] }, { duration: 0.5 });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  function handleSearch(e: Event) {
    e.preventDefault();
    if (searchQuery.trim()) goto(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  }
  function handleLogout() { auth.logout(); cart.clear(); goto('/'); }

  const categories: { slug: string; label: string; icon: any }[] = [
    { slug: 'electronics',  label: 'Electronics',    icon: Cpu      },
    { slug: 'gaming',       label: 'Gaming',          icon: Gamepad2 },
    { slug: 'ps5-games',    label: 'PS5 Games',       icon: Gamepad  },
    { slug: 'clothing',     label: 'Clothing',        icon: Shirt    },
    { slug: 'books',        label: 'Books',           icon: BookOpen },
    { slug: 'home-kitchen', label: 'Home & Kitchen',  icon: Home     },
    { slug: 'sports',       label: 'Sports',          icon: Trophy   },
    { slug: 'toys',         label: 'Toys',            icon: Puzzle   },
  ];

  const supportLinks: { href: string; icon: any; label: string; desc: string }[] = [
    { href: '/contact',  icon: Phone,       label: 'Contact Us', desc: 'Get in touch with our team'  },
    { href: '/faq',      icon: HelpCircle,  label: 'FAQ',        desc: 'Answers to common questions' },
    { href: '/returns',  icon: RotateCcw,   label: 'Returns',    desc: '30-day hassle-free returns'  },
    { href: '/shipping', icon: Truck,       label: 'Shipping',   desc: 'Delivery times and rates'    },
  ];

  const companyLinks: { href: string; icon: any; label: string; desc: string }[] = [
    { href: '/about',    icon: Info,       label: 'About',    desc: 'Our story and mission'     },
    { href: '/careers',  icon: Briefcase,  label: 'Careers',  desc: 'Join our growing team'     },
    { href: '/press',    icon: Newspaper,  label: 'Press',    desc: 'Media resources'           },
    { href: '/privacy',  icon: Shield,     label: 'Privacy',  desc: 'How we protect your data' },
  ];
</script>

{#if isAdminRoute}
  {@render children()}
{:else}
  <div class="min-h-screen bg-gray-950">

    <!-- ====== NAVBAR ====== -->
    <nav class="navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled ? 'glass shadow-xl shadow-black/30' : 'bg-gray-950/90 backdrop-blur-sm'}">

      <!-- Top row -->
      <div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <a href="/" class="text-xl font-black gradient-text shrink-0 mr-1">NEXMART</a>

        <!-- Search -->
        <form onsubmit={handleSearch} class="flex-1 max-w-lg hidden md:block">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input bind:value={searchQuery} type="text" placeholder="Search products, brands..."
              class="w-full pl-9 pr-4 py-2 rounded-xl bg-white/8 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
        </form>

        <!-- Desktop right links -->
        <div class="hidden md:flex items-center gap-1 ml-auto">
          <a href="/deals" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-orange-400 hover:bg-orange-500/10 transition-colors font-medium">
            <Flame class="w-3.5 h-3.5" /> Deals
          </a>
          <a href="/new-arrivals" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-indigo-400 hover:bg-indigo-500/10 transition-colors font-medium">
            <Sparkles class="w-3.5 h-3.5" /> New
          </a>

          <!-- Cart -->
          <a href="/cart" class="relative p-2 rounded-xl hover:bg-white/8 transition-colors ml-1">
            <ShoppingCart class="w-5 h-5" />
            {#if $cartCount > 0}
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center font-bold">{$cartCount}</span>
            {/if}
          </a>

          <!-- Auth / account -->
          {#if $auth.user}
            <a href="/orders" class="p-2 rounded-xl hover:bg-white/8 transition-colors" title="My Orders">
              <ClipboardList class="w-5 h-5 text-gray-300" />
            </a>
            <a href="/account" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/8 transition-colors text-sm" title="Account">
              <div class="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {$auth.user.name?.[0]?.toUpperCase()}
              </div>
            </a>
            {#if $isAdmin}
              <a href="/admin" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-purple-400 hover:bg-purple-500/10 transition-colors font-medium">
                <LayoutDashboard class="w-3.5 h-3.5" /> Admin
              </a>
            {/if}
            <button onclick={handleLogout} class="p-2 rounded-xl hover:bg-white/8 transition-colors" title="Sign Out">
              <LogOut class="w-4 h-4 text-gray-400" />
            </button>
          {:else}
            <a href="/auth/login" class="btn-primary !py-1.5 !px-4 text-sm">Sign In</a>
          {/if}
          <button onclick={() => menuOpen = !menuOpen} class="md:hidden p-2">
            {#if menuOpen}<X class="w-5 h-5" />{:else}<Menu class="w-5 h-5" />{/if}
          </button>
        </div>

        <!-- Mobile: cart + hamburger -->
        <div class="flex items-center gap-2 ml-auto md:hidden">
          <a href="/cart" class="relative p-2 rounded-xl hover:bg-white/8 transition-colors">
            <ShoppingCart class="w-5 h-5" />
            {#if $cartCount > 0}
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center font-bold">{$cartCount}</span>
            {/if}
          </a>
          <button onclick={() => menuOpen = !menuOpen} class="p-2">
            {#if menuOpen}<X class="w-5 h-5" />{:else}<Menu class="w-5 h-5" />{/if}
          </button>
        </div>
      </div>

      <!-- Secondary nav rows — desktop only -->
      {#if !$page.url.pathname.startsWith('/auth')}
        <!-- Row 1: Categories -->
        <div class="hidden md:block border-t border-white/5 bg-black/20">
          <div class="max-w-7xl mx-auto px-4 h-9 flex items-center gap-0.5 overflow-x-auto text-sm">
            <a href="/products"
              class="px-3 h-9 flex items-center font-medium whitespace-nowrap transition-colors shrink-0
                {!$page.url.searchParams.get('category') && $page.url.pathname === '/products' ? 'text-indigo-400' : 'text-gray-300 hover:text-white'}">
              All
            </a>
            <span class="w-px h-4 bg-white/10 mx-0.5 shrink-0"></span>
            {#each categories as cat}
              <a href="/products?category={cat.slug}"
                class="px-3 h-9 flex items-center whitespace-nowrap transition-colors shrink-0
                  {$page.url.searchParams.get('category') === cat.slug ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}">
                {cat.label}
              </a>
            {/each}
          </div>
        </div>

        <!-- Row 2: Page links -->
        <div class="hidden md:block border-t border-white/5 bg-black/30">
          <div class="max-w-7xl mx-auto px-4 h-8 flex items-center text-xs overflow-x-auto">
            <!-- Support links -->
            <span class="text-gray-600 font-semibold uppercase tracking-widest mr-2 shrink-0">Support</span>
            {#each supportLinks as link}
              <a href={link.href}
                class="px-2.5 h-8 flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0
                  {$page.url.pathname === link.href ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-200'}">
                <svelte:component this={link.icon} class="w-3 h-3" />
                {link.label}
              </a>
            {/each}

            <span class="w-px h-3.5 bg-white/10 mx-2 shrink-0"></span>

            <!-- Company links -->
            <span class="text-gray-600 font-semibold uppercase tracking-widest mr-2 shrink-0">Company</span>
            {#each companyLinks as link}
              <a href={link.href}
                class="px-2.5 h-8 flex items-center gap-1.5 whitespace-nowrap transition-colors shrink-0
                  {$page.url.pathname === link.href ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-200'}">
                <svelte:component this={link.icon} class="w-3 h-3" />
                {link.label}
              </a>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Mobile menu -->
      {#if menuOpen}
        <div class="md:hidden glass border-t border-white/10 px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
          <!-- Search -->
          <form onsubmit={handleSearch} class="mb-3">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input bind:value={searchQuery} type="text" placeholder="Search..."
                class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/8 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
          </form>

          <!-- Quick links -->
          <a href="/deals" onclick={() => menuOpen = false} class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-orange-400 hover:bg-orange-500/10 transition-colors text-sm font-medium">
            <Flame class="w-4 h-4" /> Deals
          </a>
          <a href="/new-arrivals" onclick={() => menuOpen = false} class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-indigo-400 hover:bg-indigo-500/10 transition-colors text-sm font-medium">
            <Sparkles class="w-4 h-4" /> New Arrivals
          </a>

          <div class="h-px bg-white/5 my-2"></div>

          <!-- Shop categories -->
          <p class="px-3 pt-1 text-xs font-semibold text-gray-600 uppercase tracking-widest">Shop</p>
          <a href="/products" onclick={() => menuOpen = false} class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            All Products
          </a>
          {#each categories as cat}
            <a href="/products?category={cat.slug}" onclick={() => menuOpen = false}
              class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <svelte:component this={cat.icon} class="w-4 h-4 text-indigo-400 shrink-0" />
              {cat.label}
            </a>
          {/each}

          <div class="h-px bg-white/5 my-1"></div>

          <!-- Support -->
          <p class="px-3 pt-1 text-xs font-semibold text-gray-600 uppercase tracking-widest">Support</p>
          {#each supportLinks as link}
            <a href={link.href} onclick={() => menuOpen = false}
              class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <svelte:component this={link.icon} class="w-4 h-4 text-indigo-400 shrink-0" />
              {link.label}
            </a>
          {/each}

          <div class="h-px bg-white/5 my-1"></div>

          <!-- Company -->
          <p class="px-3 pt-1 text-xs font-semibold text-gray-600 uppercase tracking-widest">Company</p>
          {#each companyLinks as link}
            <a href={link.href} onclick={() => menuOpen = false}
              class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <svelte:component this={link.icon} class="w-4 h-4 text-purple-400 shrink-0" />
              {link.label}
            </a>
          {/each}

          <div class="h-px bg-white/5 my-2"></div>

          <!-- Auth -->
          {#if $auth.user}
            <a href="/orders" onclick={() => menuOpen = false} class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors">
              <ClipboardList class="w-4 h-4 text-indigo-400" /> My Orders
            </a>
            <a href="/account" onclick={() => menuOpen = false} class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors">
              <Settings class="w-4 h-4 text-indigo-400" /> Account Settings
            </a>
            {#if $isAdmin}
              <a href="/admin" onclick={() => menuOpen = false} class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-purple-400 hover:bg-purple-500/10 transition-colors">
                <LayoutDashboard class="w-4 h-4" /> Admin Dashboard
              </a>
            {/if}
            <button onclick={() => { menuOpen = false; handleLogout(); }}
              class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut class="w-4 h-4" /> Sign Out
            </button>
          {:else}
            <a href="/auth/login" onclick={() => menuOpen = false} class="btn-primary text-center block">Sign In</a>
            <a href="/auth/register" onclick={() => menuOpen = false} class="btn-secondary text-center block mt-2">Create Account</a>
          {/if}
        </div>
      {/if}
    </nav>

    <main class="pt-[56px] {!$page.url.pathname.startsWith('/auth') ? 'md:pt-[124px]' : ''}">
      {@render children()}
    </main>

    <!-- Footer -->
    <footer class="mt-20 border-t border-white/10 py-14 px-4">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div class="text-2xl font-black gradient-text mb-3">NEXMART</div>
          <p class="text-gray-400 text-sm leading-relaxed">Your one-stop marketplace for everything from PS5 games to everyday essentials.</p>
        </div>
        {#each ([
          ['Shop', [
            { label: 'Electronics',  href: '/products?category=electronics' },
            { label: 'Gaming',       href: '/products?category=gaming'       },
            { label: 'Clothing',     href: '/products?category=clothing'     },
            { label: 'Books',        href: '/products?category=books'        },
            { label: 'Deals',        href: '/deals'                          },
            { label: 'New Arrivals', href: '/new-arrivals'                   },
          ]],
          ['Support', [
            { label: 'Contact Us',   href: '/contact'  },
            { label: 'Returns',      href: '/returns'  },
            { label: 'FAQ',          href: '/faq'      },
            { label: 'Shipping',     href: '/shipping' },
          ]],
          ['Company', [
            { label: 'About',        href: '/about'    },
            { label: 'Careers',      href: '/careers'  },
            { label: 'Press',        href: '/press'    },
            { label: 'Privacy',      href: '/privacy'  },
          ]],
        ] as Array<[string, {label: string; href: string}[]]>) as [title, links]}
          <div>
            <h4 class="font-semibold mb-4 text-white">{title}</h4>
            <ul class="space-y-2.5">
              {#each links as link}
                <li><a href={link.href} class="text-gray-400 hover:text-white text-sm transition-colors">{link.label}</a></li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
      <div class="max-w-7xl mx-auto mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
        <span>© 2026 NEXMART. All rights reserved.</span>
        <div class="flex gap-4">
          <a href="/privacy" class="hover:text-gray-300 transition-colors">Privacy</a>
          <a href="/about" class="hover:text-gray-300 transition-colors">About</a>
          <a href="/contact" class="hover:text-gray-300 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  </div>
{/if}
