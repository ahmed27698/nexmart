<script lang="ts">
  import { Zap, Shield, Globe, Heart, ArrowRight, Star, Users, Package, TrendingUp } from 'lucide-svelte';
</script>

<svelte:head><title>About Us — NEXMART</title></svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
  <!-- Hero -->
  <div class="text-center mb-20">
    <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-400 mb-6">
      <Heart class="w-4 h-4" /> Our Story
    </div>
    <h1 class="text-5xl sm:text-6xl font-black mb-6 leading-tight">
      Building the Future of<br /><span class="gradient-text">Online Shopping</span>
    </h1>
    <p class="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
      NEXMART started with a simple idea: shopping should be fast, safe, and enjoyable for everyone — no matter where in the world you are.
    </p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
    {#each [
      { icon: Package, value: '1M+',  label: 'Products',    color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
      { icon: Users,   value: '2M+',  label: 'Customers',   color: 'text-green-400',  bg: 'bg-green-500/10'  },
      { icon: Globe,   value: '150+', label: 'Countries',   color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
      { icon: Star,    value: '4.9',  label: 'Avg Rating',  color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ] as s}
      <div class="glass rounded-2xl p-6 text-center border border-white/5">
        <div class="w-10 h-10 rounded-xl {s.bg} flex items-center justify-center mx-auto mb-3">
          <s.icon class="w-5 h-5 {s.color}" />
        </div>
        <div class="text-3xl font-black {s.color}">{s.value}</div>
        <div class="text-gray-500 text-sm mt-1">{s.label}</div>
      </div>
    {/each}
  </div>

  <!-- Mission -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-20">
    <div>
      <p class="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">Our Mission</p>
      <h2 class="text-4xl font-black mb-6">Connecting people with<br />products they love</h2>
      <p class="text-gray-400 leading-relaxed mb-4">
        We believe everyone deserves access to great products at fair prices. Since day one, we've worked to eliminate barriers between buyers and the things they need — whether it's the latest PS5 game, everyday essentials, or hard-to-find specialty items.
      </p>
      <p class="text-gray-400 leading-relaxed">
        Today, NEXMART serves millions of customers across 150 countries with a catalog of over a million products from thousands of trusted brands.
      </p>
    </div>
    <div class="relative h-80 rounded-3xl overflow-hidden">
      <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80" alt="Team at work" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent"></div>
    </div>
  </div>

  <!-- Values -->
  <div class="mb-20">
    <div class="text-center mb-10">
      <p class="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">What We Stand For</p>
      <h2 class="text-4xl font-black">Our Values</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each [
        { icon: Shield,    color: 'text-green-400',  bg: 'bg-green-500/10',  title: 'Trust',       desc: 'Every transaction is protected. Your security is our top priority.'            },
        { icon: Zap,       color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: 'Speed',       desc: 'Lightning-fast checkout, same-day shipping, and instant support.'              },
        { icon: Globe,     color: 'text-blue-400',   bg: 'bg-blue-500/10',   title: 'Inclusion',   desc: 'Great shopping for everyone, regardless of location or budget.'                },
        { icon: TrendingUp,color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'Innovation',  desc: 'Constantly improving our platform to give you the best experience possible.'   },
      ] as v}
        <div class="glass rounded-2xl p-6 border border-white/5 hover:border-indigo-500/20 transition-colors">
          <div class="w-10 h-10 rounded-xl {v.bg} flex items-center justify-center mb-4">
            <v.icon class="w-5 h-5 {v.color}" />
          </div>
          <h3 class="font-bold mb-2">{v.title}</h3>
          <p class="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- CTA -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 border border-indigo-500/20 p-14 text-center">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.4)_0%,transparent_70%)] pointer-events-none"></div>
    <div class="relative">
      <h2 class="text-4xl font-black mb-3">Ready to join millions of shoppers?</h2>
      <p class="text-gray-300 mb-8 text-lg">Create your free account and start shopping today.</p>
      <div class="flex flex-wrap gap-4 justify-center">
        <a href="/auth/register" class="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base">
          Get Started <ArrowRight class="w-5 h-5" />
        </a>
        <a href="/contact" class="btn-secondary inline-flex items-center gap-2 px-8 py-3 text-base">
          Contact Us
        </a>
      </div>
    </div>
  </div>
</div>
