<script lang="ts">
  import { Newspaper, Download, Mail, ArrowRight, ExternalLink } from 'lucide-svelte';

  const coverage = [
    { outlet: 'TechCrunch',     headline: 'NEXMART raises $50M Series B to expand global marketplace',    date: 'March 2026',    logo: 'TC' },
    { outlet: 'Forbes',         headline: 'The 10 fastest-growing e-commerce platforms of 2026',           date: 'February 2026', logo: 'F'  },
    { outlet: 'The Verge',      headline: 'NEXMART\'s new gaming category is a dream for PS5 owners',      date: 'January 2026',  logo: 'V'  },
    { outlet: 'Bloomberg',      headline: 'How NEXMART is taking on Amazon with a design-first approach',  date: 'December 2025', logo: 'B'  },
  ];
</script>

<svelte:head><title>Press — NEXMART</title></svelte:head>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-16">
  <!-- Header -->
  <div class="text-center mb-16">
    <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-400 mb-6">
      <Newspaper class="w-4 h-4" /> Press Room
    </div>
    <h1 class="text-5xl font-black mb-4">NEXMART in the <span class="gradient-text">News</span></h1>
    <p class="text-gray-400 text-lg max-w-lg mx-auto">
      Resources for journalists and media. For press inquiries, contact our team directly.
    </p>
  </div>

  <!-- Quick facts -->
  <div class="glass rounded-2xl p-8 border border-white/5 mb-10">
    <h2 class="text-xl font-bold mb-6">NEXMART at a Glance</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
      {#each [['Founded', '2023'], ['HQ', 'New York, NY'], ['Employees', '400+'], ['Countries', '150+']] as [label, val]}
        <div>
          <div class="text-2xl font-black gradient-text">{val}</div>
          <div class="text-gray-500 text-sm mt-1">{label}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Press kit -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
    <div class="glass rounded-2xl p-6 border border-white/5 flex items-center gap-4 hover:border-indigo-500/20 transition-colors cursor-pointer group">
      <div class="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
        <Download class="w-6 h-6 text-indigo-400" />
      </div>
      <div>
        <h3 class="font-bold group-hover:text-indigo-300 transition-colors">Press Kit</h3>
        <p class="text-gray-400 text-sm">Logos, brand guidelines, product screenshots</p>
      </div>
      <ArrowRight class="w-4 h-4 text-gray-500 ml-auto group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
    </div>
    <a href="/contact" class="glass rounded-2xl p-6 border border-white/5 flex items-center gap-4 hover:border-indigo-500/20 transition-colors group">
      <div class="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
        <Mail class="w-6 h-6 text-purple-400" />
      </div>
      <div>
        <h3 class="font-bold group-hover:text-indigo-300 transition-colors">Media Inquiries</h3>
        <p class="text-gray-400 text-sm">press@nexmart.com · Response within 24 hrs</p>
      </div>
      <ArrowRight class="w-4 h-4 text-gray-500 ml-auto group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
    </a>
  </div>

  <!-- Coverage -->
  <h2 class="text-3xl font-black mb-6">Recent Coverage</h2>
  <div class="space-y-3">
    {#each coverage as item}
      <div class="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors flex items-center gap-5 group cursor-pointer">
        <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm text-gray-300">
          {item.logo}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs text-gray-500 mb-1">{item.outlet} · {item.date}</div>
          <p class="font-semibold text-sm leading-snug group-hover:text-indigo-300 transition-colors">{item.headline}</p>
        </div>
        <ExternalLink class="w-4 h-4 text-gray-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
      </div>
    {/each}
  </div>
</div>
