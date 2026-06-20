<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { animate, scroll, spring, stagger } from 'motion';
  import { api } from '$lib/api';
  import { cart } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import {
    ArrowRight, Zap, Shield, Truck, RotateCcw, Star, Flame, Package,
    Cpu, Gamepad2, Gamepad, Shirt, BookOpen, Home, Trophy, Puzzle,
    Music, Monitor, Smartphone, Palette, Car, Sparkles,
    ShieldCheck, PackageCheck, Headphones
  } from 'lucide-svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';

  let featuredProducts = $state<any[]>([]);
  let categories = $state<any[]>([]);
  let loading = $state(true);
  let countdown = $state({ h: 7, m: 42, s: 0 });
  let scrollProgress = $state(0);

  // Count-up stats
  const statTargets = [
    { value: 1,   suffix: 'M+', label: 'Products',  decimals: 0 },
    { value: 2,   suffix: 'M+', label: 'Customers', decimals: 0 },
    { value: 4.9, suffix: '★',  label: 'Rating',    decimals: 1 },
    { value: 150, suffix: '+',  label: 'Countries', decimals: 0 },
  ];
  let statValues = $state([0, 0, 0, 0]);
  let statsAnimated = false;

  function startCountUp() {
    if (statsAnimated) return;
    statsAnimated = true;
    const duration = 2000;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      for (let i = 0; i < statTargets.length; i++) {
        statValues[i] = statTargets[i].value * eased;
      }
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function fmtStat(i: number): string {
    const t = statTargets[i];
    const v = statValues[i];
    return (t.decimals === 0 ? Math.floor(v) : v.toFixed(t.decimals)) + t.suffix;
  }

  const marqueeItems: { icon: any; label: string }[] = [
    { icon: Cpu,        label: 'Electronics'   },
    { icon: Gamepad2,   label: 'Gaming'        },
    { icon: Gamepad,    label: 'PS5 Games'     },
    { icon: Shirt,      label: 'Clothing'      },
    { icon: BookOpen,   label: 'Books'         },
    { icon: Home,       label: 'Home & Kitchen'},
    { icon: Trophy,     label: 'Sports'        },
    { icon: Puzzle,     label: 'Toys'          },
    { icon: Music,      label: 'Music'         },
    { icon: Monitor,    label: 'Computers'     },
    { icon: Smartphone, label: 'Phones'        },
    { icon: Palette,    label: 'Art & Craft'   },
    { icon: Car,        label: 'Automotive'    },
    { icon: Sparkles,   label: 'Beauty'        },
  ];

  const features = [
    { icon: Truck,     title: 'Free Shipping',  desc: 'On orders over $50',      color: 'text-blue-400',   bg: 'from-blue-500/20 to-blue-600/5',     border: 'border-blue-500/20'   },
    { icon: Shield,    title: 'Secure Payment', desc: '256-bit SSL encryption',  color: 'text-green-400',  bg: 'from-green-500/20 to-green-600/5',   border: 'border-green-500/20'  },
    { icon: Zap,       title: 'Fast Delivery',  desc: '2–5 business days',       color: 'text-yellow-400', bg: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/20' },
    { icon: RotateCcw, title: 'Easy Returns',   desc: '30-day return policy',    color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20' },
  ];

  const heroImages = [
    'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=300&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=300&q=80',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&q=80',
  ];

  function pad(n: number) { return String(n).padStart(2, '0'); }

  onMount(() => {
    // Scroll progress bar (sync setup — safe to return cleanup)
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = max > 0 ? (window.scrollY / max) * 100 : 0;
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Spring presets — motion v12 uses (visualDuration, bounce) ────────────
    // visualDuration: perceived speed (seconds), bounce: 0=overdamped, 1=max bounce
    const snap   = spring(0.30, 0.10); // snappy, near-zero overshoot
    const bouncy = spring(0.55, 0.42); // visible elastic bounce
    const heavy  = spring(0.80, 0.06); // weighty, slow settle
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const a = animate as any; // bypass strict overloads for HTMLElement keyframes

    // ── Hero entrance (spring-driven) ────────────────────────────────────────
    a('.hero-badge',  { opacity: [0, 1], y: [-14, 0] }, { easing: snap,   delay: 0.05 });
    a('.hero-title',  { opacity: [0, 1], y: [80,  0] }, { easing: heavy,  delay: 0.15 });
    a('.hero-desc',   { opacity: [0, 1], y: [32,  0] }, { easing: snap,   delay: 0.35 });
    a('.hero-cta',    { opacity: [0, 1], y: [22,  0] }, { easing: bouncy, delay: 0.50 });
    a('.hero-stats',  { opacity: [0, 1], y: [22,  0] }, { easing: bouncy, delay: 0.65 });
    a('.hero-visual', { opacity: [0, 1], x: [60,  0] }, { easing: heavy,  delay: 0.20 });

    // ── Parallax blobs ────────────────────────────────────────────────────────
    scroll(animate('.blob-1', { y: [-80,  80] }), { target: document.documentElement });
    scroll(animate('.blob-2', { y: [ 80, -80] }), { target: document.documentElement });
    scroll(animate('.blob-3', { y: [-40,  60], x: [-20, 20] }), { target: document.documentElement });

    // Countdown timer
    const timer = setInterval(() => {
      countdown.s--;
      if (countdown.s < 0) { countdown.s = 59; countdown.m--; }
      if (countdown.m < 0) { countdown.m = 59; countdown.h--; }
      if (countdown.h < 0) { countdown.h = 23; }
    }, 1000);

    // ── Async data + spring scroll observers ─────────────────────────────────
    (async () => {
      try {
        const [prods, cats] = await Promise.all([
          api.get<any>('/products?featured=true'),
          api.get<any[]>('/categories')
        ]);
        featuredProducts = prods.products || [];
        categories = cats || [];
      } catch { } finally { loading = false; }

      await tick();
      setTimeout(startCountUp, 1400);

      // Dispatch spring animation based on which CSS class the element has
      function springReveal(el: HTMLElement) {
        const delay = parseFloat(el.dataset.delay ?? '0');
        if (el.classList.contains('scroll-left')) {
          a(el, { opacity: [0, 1], x: [-72, 0] }, { easing: snap,   delay });
        } else if (el.classList.contains('scroll-right')) {
          a(el, { opacity: [0, 1], x: [ 72, 0] }, { easing: snap,   delay });
        } else if (el.classList.contains('scroll-scale')) {
          a(el, { opacity: [0, 1], scale: [0.75, 1], y: [32, 0] }, { easing: heavy, delay });
        } else if (el.classList.contains('scroll-flip')) {
          a(el, { opacity: [0, 1], y: [44, 0] },                   { easing: snap,  delay });
        } else {
          a(el, { opacity: [0, 1], y: [48, 0] },                   { easing: snap,  delay });
        }
      }

      // Grid observer — stagger card children with bouncy spring when grid enters view
      const gridObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const grid = entry.target as HTMLElement;
          const cards = grid.querySelectorAll('.scroll-pop');
          if (cards.length) {
            a(cards, { opacity: [0, 1], scale: [0.82, 1], y: [28, 0] },
              { easing: bouncy, delay: stagger(0.07, { startDelay: 0.05 }) });
          }
          gridObserver.unobserve(grid);
        });
      }, { threshold: 0.04, rootMargin: '0px 0px -4% 0px' });

      document.querySelectorAll<HTMLElement>('[data-stagger]')
        .forEach(g => gridObserver.observe(g));

      // Individual observer for non-grid elements
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          springReveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });

      document.querySelectorAll(
        '.scroll-reveal, .scroll-left, .scroll-right, .scroll-scale, .scroll-flip'
      ).forEach(el => observer.observe(el));
    })();

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', onScroll);
    };
  });

  async function addToCart(product: any) {
    if (!$auth.user) { goto('/auth/login'); return; }
    await cart.add(product.id, 1);
  }
</script>

<svelte:head>
  <title>NEXMART — Shop Everything</title>
</svelte:head>

<!-- ═══ SCROLL PROGRESS BAR ═══ -->
<div class="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[9999] pointer-events-none"
     style="width: {scrollProgress}%; transition: width 80ms linear;"></div>

<!-- ═══════════════════════════════════════════════ HERO ═══ -->
<section class="relative min-h-screen flex items-center overflow-hidden">
  <div class="blob-1 absolute top-1/4 -left-32 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[80px] pointer-events-none animate-blob"></div>
  <div class="blob-2 absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-purple-600/12 rounded-full blur-[80px] pointer-events-none animate-blob-delayed"></div>
  <div class="blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-pink-600/8 rounded-full blur-[100px] pointer-events-none"></div>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.12)_0%,_transparent_50%)] pointer-events-none"></div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
    <div>
      <div class="hero-badge opacity-0 inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-7">
        <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span class="text-gray-300">New arrivals every single day</span>
        <Flame class="w-4 h-4 text-orange-400" />
      </div>

      <h1 class="hero-title opacity-0 text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
        Your Universe<br />
        of <span class="gradient-text">Shopping</span><br />
        <span class="text-gray-400 text-4xl sm:text-5xl lg:text-6xl font-bold">Starts Here</span>
      </h1>

      <p class="hero-desc opacity-0 text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
        From the latest PS5 games to cutting-edge electronics, premium clothing, and everything in between — millions of products, one destination.
      </p>

      <div class="hero-cta opacity-0 flex flex-wrap gap-4 mb-10">
        <a href="/products" class="btn-primary flex items-center gap-2 text-base">
          Shop Now <ArrowRight class="w-5 h-5" />
        </a>
        <a href="/products?category=gaming" class="btn-secondary flex items-center gap-2 text-base">
          🎮 Explore Gaming
        </a>
      </div>

      <!-- Count-up stats -->
      <div class="hero-stats opacity-0 flex flex-wrap gap-6">
        {#each statTargets as target, i}
          <div class="text-center">
            <div class="text-2xl font-black gradient-text tabular-nums">{fmtStat(i)}</div>
            <div class="text-xs text-gray-500 mt-0.5">{target.label}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Floating product gallery -->
    <div class="hero-visual opacity-0 hidden lg:block relative h-[520px]">
      <div class="absolute top-0 left-8 w-48 h-48 rounded-2xl overflow-hidden glass-strong animate-float shadow-2xl shadow-indigo-500/20">
        <img src={heroImages[0]} alt="" class="w-full h-full object-cover" />
        <div class="absolute bottom-2 left-2 right-2 glass rounded-xl px-2 py-1">
          <p class="text-xs font-bold truncate">PS5 Pro Controller</p>
          <p class="text-xs text-indigo-400">$89.99</p>
        </div>
      </div>
      <div class="absolute top-10 right-4 w-44 h-44 rounded-2xl overflow-hidden glass-strong animate-float-delayed shadow-xl shadow-purple-500/20">
        <img src={heroImages[1]} alt="" class="w-full h-full object-cover" />
        <div class="absolute bottom-2 left-2 right-2 glass rounded-xl px-2 py-1">
          <p class="text-xs font-bold truncate">Smart Watch</p>
          <p class="text-xs text-indigo-400">$299.00</p>
        </div>
      </div>
      <div class="absolute top-52 left-0 w-40 h-40 rounded-2xl overflow-hidden glass-strong animate-float-slow shadow-xl">
        <img src={heroImages[2]} alt="" class="w-full h-full object-cover" />
      </div>
      <div class="absolute top-44 right-12 w-52 h-52 rounded-2xl overflow-hidden glass-strong animate-float shadow-2xl shadow-pink-500/15">
        <img src={heroImages[3]} alt="" class="w-full h-full object-cover" />
        <div class="absolute bottom-2 left-2 right-2 glass rounded-xl px-2 py-1">
          <p class="text-xs font-bold truncate">Gaming Setup</p>
          <p class="text-xs text-green-400">-30% OFF</p>
        </div>
      </div>
      <div class="absolute bottom-8 left-16 w-44 h-44 rounded-2xl overflow-hidden glass-strong animate-float-delayed shadow-xl">
        <img src={heroImages[4]} alt="" class="w-full h-full object-cover" />
      </div>
      <div class="absolute bottom-4 right-2 w-36 h-36 rounded-2xl overflow-hidden glass-strong animate-float-slow shadow-xl shadow-indigo-500/20">
        <img src={heroImages[5]} alt="" class="w-full h-full object-cover" />
      </div>

      <div class="absolute -left-4 top-1/2 glass px-3 py-2 rounded-xl animate-float-slow text-sm font-semibold flex items-center gap-2 shadow-lg">
        <Flame class="w-5 h-5 text-orange-400" /> Hot Deal
      </div>
      <div class="absolute right-0 bottom-1/3 glass px-3 py-2 rounded-xl animate-float text-sm font-semibold flex items-center gap-2 shadow-lg">
        <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.9 / 5.0
      </div>
    </div>
  </div>

  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-xs animate-float-slow">
    <span>Scroll to explore</span>
    <div class="w-5 h-8 border-2 border-gray-600 rounded-full flex items-start justify-center pt-1">
      <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════ MARQUEE ═══ -->
<div class="border-y border-white/5 bg-gray-900/40 py-4 overflow-hidden">
  <div class="flex animate-marquee whitespace-nowrap gap-0">
    {#each [...marqueeItems, ...marqueeItems] as item}
      <span class="inline-flex items-center gap-2 px-8 text-sm text-gray-400 font-medium">
        <svelte:component this={item.icon} class="w-4 h-4 shrink-0" />
        {item.label}
        <span class="w-1 h-1 bg-indigo-500 rounded-full ml-1"></span>
      </span>
    {/each}
  </div>
</div>

<!-- ═══════════════════════════════════════════════ FEATURES ═══ -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 py-20">
  <div class="text-center mb-14 scroll-reveal">
    <p class="text-shimmer text-sm font-semibold uppercase tracking-widest mb-3">Why NEXMART</p>
    <h2 class="text-4xl font-black">We've got you covered</h2>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-stagger>
    {#each features as f, fi}
      <div class="scroll-flip group relative overflow-hidden glass rounded-2xl p-6 border {f.border} hover:scale-[1.02] transition-transform duration-300 cursor-default"
           data-delay={fi * 0.12}>
        <div class="absolute inset-0 bg-gradient-to-br {f.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        <div class="relative">
          <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <f.icon class="w-6 h-6 {f.color}" />
          </div>
          <h3 class="font-bold text-lg mb-1">{f.title}</h3>
          <p class="text-gray-400 text-sm">{f.desc}</p>
        </div>
      </div>
    {/each}
  </div>
</section>

<!-- ═══════════════════════════════════════════════ CATEGORIES ═══ -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
  <!-- Heading animates left, link animates right -->
  <div class="flex items-end justify-between mb-10">
    <div class="scroll-left">
      <p class="text-shimmer text-sm font-semibold uppercase tracking-widest mb-2">Browse</p>
      <h2 class="text-4xl font-black">Shop by Category</h2>
    </div>
    <a href="/products" class="scroll-right hidden sm:flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors font-medium" data-delay="0.1">
      View all categories <ArrowRight class="w-4 h-4" />
    </a>
  </div>

  {#if categories.length === 0 && !loading}
    <div class="text-center py-12 text-gray-500">No categories found — make sure the database schema is set up.</div>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-stagger>
      {#each categories as cat, ci}
        <!-- 3D tilt card -->
        <a href="/products?category={cat.slug}"
          class="scroll-pop group relative aspect-[3/2] rounded-2xl overflow-hidden border border-white/5"
          data-delay={ci * 0.07}
          style="will-change: transform;"
          onmousemove={(e) => {
            const el = e.currentTarget as HTMLElement;
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale(1.05)`;
            el.style.boxShadow = `${-x * 24}px ${y * 12}px 40px rgba(99,102,241,0.35)`;
            el.style.transition = 'transform 0.08s linear, box-shadow 0.08s linear';
            const shine = el.querySelector<HTMLElement>('.cat-shine');
            if (shine) {
              shine.style.opacity = '1';
              shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.18) 0%, transparent 65%)`;
            }
          }}
          onmouseleave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.transition = 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.55s ease';
            el.style.transform = '';
            el.style.boxShadow = '';
            const shine = el.querySelector<HTMLElement>('.cat-shine');
            if (shine) shine.style.opacity = '0';
          }}
        >
          <img
            src={cat.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500'}
            alt={cat.name}
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <!-- Cursor-tracked shine layer -->
          <div class="cat-shine absolute inset-0 opacity-0 pointer-events-none" style="transition: opacity 0.2s ease;"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div class="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors duration-300"></div>
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <h3 class="font-bold text-white text-lg group-hover:translate-x-1 transition-transform duration-300">{cat.name}</h3>
            <p class="text-indigo-300 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 translate-y-1 group-hover:translate-y-0">
              Shop now <ArrowRight class="w-3 h-3" />
            </p>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</section>

<!-- ═══════════════════════════════════════════════ FEATURED PRODUCTS ═══ -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
  <div class="flex items-end justify-between mb-10">
    <div class="scroll-left">
      <p class="text-shimmer text-sm font-semibold uppercase tracking-widest mb-2">Curated for you</p>
      <h2 class="text-4xl font-black">Featured Deals</h2>
      <p class="text-gray-400 mt-2">Hand-picked products you'll love</p>
    </div>
    <a href="/products" class="scroll-right hidden sm:flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors font-medium" data-delay="0.1">
      See all products <ArrowRight class="w-4 h-4" />
    </a>
  </div>

  {#if loading}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {#each {length: 8} as _}
        <div class="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse"></div>
      {/each}
    </div>
  {:else if featuredProducts.length === 0}
    <div class="text-center py-16 text-gray-500">
      <Package class="w-16 h-16 mx-auto mb-4 opacity-20" />
      <p>No products yet — add some from the admin dashboard!</p>
      <a href="/admin" class="mt-4 inline-block text-indigo-400 hover:text-indigo-300 text-sm">Go to Dashboard →</a>
    </div>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-stagger>
      {#each featuredProducts as product, pi}
        <div class="scroll-pop" data-delay={pi * 0.06}>
          <ProductCard {product} on:addToCart={() => addToCart(product)} />
        </div>
      {/each}
    </div>
  {/if}
</section>

<!-- ═══════════════════════════════════════════════ FLASH SALE ═══ -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
  <div class="scroll-scale relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 border border-indigo-500/20 p-10 sm:p-14">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.25)_0%,_transparent_60%)] pointer-events-none"></div>
    <div class="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
    <!-- Animated scan line -->
    <div class="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent animate-scan pointer-events-none" style="top: 30%;"></div>

    <div class="relative flex flex-col lg:flex-row items-center gap-10 justify-between">
      <div class="text-center lg:text-left scroll-left" data-delay="0.1">
        <div class="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-4 py-1.5 rounded-full mb-6">
          <Flame class="w-4 h-4 text-red-400 animate-pulse" />
          <span class="text-red-400 text-sm font-bold uppercase tracking-wider">Flash Sale — Limited Time</span>
        </div>
        <h2 class="text-4xl sm:text-5xl font-black mb-3">Up to <span class="gradient-text-gold">70% OFF</span></h2>
        <p class="text-gray-400 text-lg mb-8">Exclusive deals on top brands. Don't miss out!</p>
        <a href="/products" class="btn-primary inline-flex items-center gap-2 text-base animate-glow">
          Grab the Deal <ArrowRight class="w-5 h-5" />
        </a>
      </div>

      <div class="shrink-0 text-center scroll-right" data-delay="0.2">
        <p class="text-gray-400 text-sm mb-4 uppercase tracking-widest">Ends in</p>
        <div class="flex items-center gap-3">
          {#each [[countdown.h, 'HRS'], [countdown.m, 'MIN'], [countdown.s, 'SEC']] as [val, label]}
            <div class="glass-strong rounded-2xl p-4 w-20 text-center border border-indigo-500/20 hover:border-indigo-400/40 transition-colors">
              <div class="text-4xl font-black tabular-nums text-white">{pad(val as number)}</div>
              <div class="text-xs text-gray-500 mt-1 uppercase tracking-widest">{label}</div>
            </div>
            {#if label !== 'SEC'}<span class="text-3xl font-black text-indigo-400">:</span>{/if}
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════ TRUST STRIP ═══ -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {#each [
      { icon: ShieldCheck,  color: 'text-green-400',  bg: 'bg-green-500/10',  glow: 'hover:shadow-green-500/10',  title: 'Buyer Protection', desc: 'Full refund if item never arrives or not as described' },
      { icon: PackageCheck, color: 'text-blue-400',   bg: 'bg-blue-500/10',   glow: 'hover:shadow-blue-500/10',   title: 'Tracked Shipping',  desc: 'Real-time package tracking on every order'           },
      { icon: Headphones,   color: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'hover:shadow-purple-500/10', title: '24/7 Support',      desc: 'Our team is always here to help you'                 },
    ] as trust, i}
      <div class="{i === 0 ? 'scroll-left' : i === 1 ? 'scroll-reveal' : 'scroll-right'} glass rounded-2xl p-6 flex items-start gap-4 hover:border-white/10 border border-transparent transition-all duration-300 hover:shadow-xl {trust.glow}"
           data-delay={i * 0.1}>
        <div class="w-11 h-11 rounded-xl {trust.bg} flex items-center justify-center shrink-0">
          <svelte:component this={trust.icon} class="w-5 h-5 {trust.color}" />
        </div>
        <div>
          <h3 class="font-bold mb-1">{trust.title}</h3>
          <p class="text-gray-400 text-sm leading-relaxed">{trust.desc}</p>
        </div>
      </div>
    {/each}
  </div>
</section>

<!-- ═══════════════════════════════════════════════ CTA ═══ -->
<section class="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
  <div class="scroll-scale relative overflow-hidden rounded-3xl text-center py-20 px-8">
    <div class="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900"></div>
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.4)_0%,_transparent_70%)]"></div>

    <!-- Spinning rings -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-[600px] h-[600px] border border-white/5 rounded-full animate-spin-slow"></div>
    </div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-[400px] h-[400px] border border-white/5 rounded-full animate-spin-slow" style="animation-direction: reverse; animation-duration: 15s;"></div>
    </div>
    <!-- Floating orbs -->
    <div class="absolute top-8 left-12 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl animate-float pointer-events-none"></div>
    <div class="absolute bottom-8 right-16 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-float-delayed pointer-events-none"></div>

    <div class="relative">
      <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm mb-6">
        <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span>Trusted by 2 million+ customers worldwide</span>
      </div>
      <h2 class="text-4xl sm:text-6xl font-black mb-4">Ready to start shopping?</h2>
      <p class="text-gray-300 text-xl mb-10 max-w-xl mx-auto">
        Join the NEXMART community today and unlock exclusive deals, fast delivery, and a world of products.
      </p>
      <div class="flex flex-wrap gap-4 justify-center">
        <a href="/auth/register" class="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
          Create Free Account <ArrowRight class="w-5 h-5" />
        </a>
        <a href="/products" class="btn-secondary text-lg px-8 py-4 inline-flex items-center gap-2">
          Browse Products
        </a>
      </div>
    </div>
  </div>
</section>
