<script lang="ts">
  import { Truck, Clock, Globe, PackageCheck, Zap, MapPin } from 'lucide-svelte';

  const methods = [
    { name: 'Standard Shipping',   time: '3–5 business days', price: 'Free over $50 / $4.99',  icon: Truck,        color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
    { name: 'Expedited Shipping',  time: '1–2 business days', price: '$9.99',                   icon: Zap,          color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { name: 'Overnight Shipping',  time: 'Next business day', price: '$19.99',                  icon: Clock,        color: 'text-green-400',  bg: 'bg-green-500/10'  },
    { name: 'International',       time: '7–14 business days',price: 'From $14.99',             icon: Globe,        color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];
</script>

<svelte:head><title>Shipping Info — NEXMART</title></svelte:head>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-16">
  <div class="text-center mb-14">
    <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-400 mb-6">
      <Truck class="w-4 h-4" /> Shipping Information
    </div>
    <h1 class="text-5xl font-black mb-4">Fast & Reliable <span class="gradient-text">Delivery</span></h1>
    <p class="text-gray-400 text-lg">We ship to over 150 countries. Orders placed before 2pm EST ship the same day.</p>
  </div>

  <!-- Methods -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
    {#each methods as m}
      <div class="glass rounded-2xl p-6 border border-white/5 hover:border-indigo-500/20 transition-colors">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl {m.bg} flex items-center justify-center">
            <m.icon class="w-5 h-5 {m.color}" />
          </div>
          <h3 class="font-bold">{m.name}</h3>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-400">{m.time}</span>
          <span class="font-semibold text-white">{m.price}</span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Details -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
    <div class="glass rounded-2xl p-7 border border-white/5">
      <PackageCheck class="w-7 h-7 text-indigo-400 mb-4" />
      <h2 class="text-xl font-bold mb-3">Order Processing</h2>
      <ul class="space-y-2 text-gray-400 text-sm">
        <li>• Orders placed before 2pm EST ship same day</li>
        <li>• Orders after 2pm ship next business day</li>
        <li>• Weekend orders ship Monday morning</li>
        <li>• Tracking email sent once order ships</li>
        <li>• Signature required for orders over $200</li>
      </ul>
    </div>
    <div class="glass rounded-2xl p-7 border border-white/5">
      <Globe class="w-7 h-7 text-indigo-400 mb-4" />
      <h2 class="text-xl font-bold mb-3">International Shipping</h2>
      <ul class="space-y-2 text-gray-400 text-sm">
        <li>• Available in 150+ countries worldwide</li>
        <li>• Duties and taxes may apply at destination</li>
        <li>• Full tracking provided end-to-end</li>
        <li>• Restricted items vary by country</li>
        <li>• Estimated 7–14 business days delivery</li>
      </ul>
    </div>
  </div>

  <!-- Free shipping banner -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border border-indigo-500/20 p-10 text-center">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.3)_0%,transparent_70%)] pointer-events-none"></div>
    <div class="relative">
      <Truck class="w-12 h-12 text-indigo-300 mx-auto mb-4" />
      <h2 class="text-3xl font-black mb-2">Free Shipping on Orders Over <span class="gradient-text">$50</span></h2>
      <p class="text-gray-400 mb-6">Shop more, save more. Free standard shipping applied automatically at checkout.</p>
      <a href="/products" class="btn-primary inline-flex items-center gap-2 px-8 py-3">Shop Now</a>
    </div>
  </div>

  <!-- FAQ link -->
  <p class="text-center mt-10 text-gray-500 text-sm">
    Have more questions? Visit our <a href="/faq" class="text-indigo-400 hover:text-indigo-300 transition-colors">FAQ</a> or <a href="/contact" class="text-indigo-400 hover:text-indigo-300 transition-colors">contact us</a>.
  </p>
</div>
