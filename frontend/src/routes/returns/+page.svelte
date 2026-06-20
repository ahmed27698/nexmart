<script lang="ts">
  import { RotateCcw, CheckCircle, Clock, PackageCheck, ArrowRight } from 'lucide-svelte';
</script>

<svelte:head><title>Returns & Refunds — NEXMART</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-16">
  <div class="text-center mb-14">
    <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-400 mb-6">
      <RotateCcw class="w-4 h-4" /> Hassle-Free Returns
    </div>
    <h1 class="text-5xl font-black mb-4">30-Day <span class="gradient-text">Returns</span></h1>
    <p class="text-gray-400 text-lg">Not happy? Send it back. No questions asked.</p>
  </div>

  <!-- How it works -->
  <div class="glass rounded-2xl p-8 border border-white/5 mb-8">
    <h2 class="text-xl font-bold mb-6">How to Start a Return</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {#each [
        { step: '01', icon: PackageCheck, title: 'Request Return',   desc: 'Go to your Orders page, select the item, and click "Return Item".'     },
        { step: '02', icon: RotateCcw,   title: 'Print Label',      desc: 'We\'ll email you a prepaid return label for eligible items instantly.'  },
        { step: '03', icon: CheckCircle, title: 'Get Refunded',     desc: 'Drop off the package. Refund processed within 3–5 business days.'       },
      ] as s}
        <div class="text-center">
          <div class="text-xs font-bold text-indigo-400 mb-3 tracking-widest">STEP {s.step}</div>
          <div class="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <s.icon class="w-6 h-6 text-indigo-400" />
          </div>
          <h3 class="font-bold mb-2">{s.title}</h3>
          <p class="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Policy details -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    <div class="glass rounded-2xl p-6 border border-white/5">
      <CheckCircle class="w-6 h-6 text-green-400 mb-3" />
      <h3 class="font-bold mb-3">Eligible for Return</h3>
      <ul class="space-y-2 text-gray-400 text-sm">
        <li>• Unused items in original packaging</li>
        <li>• Defective or damaged products</li>
        <li>• Wrong item received</li>
        <li>• Items within 30 days of delivery</li>
        <li>• Electronics with all accessories included</li>
      </ul>
    </div>
    <div class="glass rounded-2xl p-6 border border-white/5">
      <Clock class="w-6 h-6 text-red-400 mb-3" />
      <h3 class="font-bold mb-3">Not Eligible for Return</h3>
      <ul class="space-y-2 text-gray-400 text-sm">
        <li>• Items returned after 30 days</li>
        <li>• Opened software, games, or digital codes</li>
        <li>• Perishable goods</li>
        <li>• Personal hygiene products (opened)</li>
        <li>• Custom or personalized items</li>
      </ul>
    </div>
  </div>

  <!-- Refund timeline -->
  <div class="glass rounded-2xl p-7 border border-white/5 mb-8">
    <h2 class="text-xl font-bold mb-4">Refund Timeline</h2>
    <div class="space-y-3">
      {#each [
        ['Return received',              'Day 0',      'text-gray-400'],
        ['Inspection complete',          'Day 1–2',    'text-gray-400'],
        ['Refund initiated',             'Day 2–3',    'text-indigo-400'],
        ['Refund in your account',       'Day 3–5',    'text-green-400'],
      ] as [label, time, color]}
        <div class="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
          <span class="text-sm text-gray-300">{label}</span>
          <span class="text-sm font-semibold {color}">{time}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="text-center">
    <p class="text-gray-500 text-sm mb-4">Need help with a return?</p>
    <a href="/contact" class="btn-primary inline-flex items-center gap-2 px-6 py-3">
      Contact Support <ArrowRight class="w-4 h-4" />
    </a>
  </div>
</div>
