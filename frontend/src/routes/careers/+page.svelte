<script lang="ts">
  import { Briefcase, Zap, Heart, Globe, TrendingUp, ArrowRight, MapPin, Clock } from 'lucide-svelte';

  const perks = [
    { icon: Heart,      color: 'text-pink-400',   bg: 'bg-pink-500/10',   title: 'Health & Wellness',    desc: 'Full medical, dental, and vision coverage for you and your family.'        },
    { icon: Globe,      color: 'text-blue-400',   bg: 'bg-blue-500/10',   title: 'Remote First',         desc: 'Work from anywhere in the world. We\'re fully distributed.'                },
    { icon: TrendingUp, color: 'text-green-400',  bg: 'bg-green-500/10',  title: 'Growth & Learning',    desc: '$2,000/year learning budget. Conferences, courses, and books on us.'       },
    { icon: Zap,        color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: 'Equity & Pay',         desc: 'Competitive salaries, equity packages, and annual performance reviews.'   },
  ];

  const openings = [
    { title: 'Senior Frontend Engineer',    dept: 'Engineering',  location: 'Remote',    type: 'Full-time' },
    { title: 'Product Designer',            dept: 'Design',       location: 'Remote',    type: 'Full-time' },
    { title: 'Backend Engineer (Node.js)',  dept: 'Engineering',  location: 'Remote',    type: 'Full-time' },
    { title: 'Data Analyst',               dept: 'Analytics',    location: 'NY or Remote', type: 'Full-time' },
    { title: 'Customer Success Manager',   dept: 'Support',      location: 'Remote',    type: 'Full-time' },
  ];
</script>

<svelte:head><title>Careers — NEXMART</title></svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
  <!-- Header -->
  <div class="text-center mb-16">
    <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-400 mb-6">
      <Briefcase class="w-4 h-4" /> Join Our Team
    </div>
    <h1 class="text-5xl font-black mb-4">Build the Future of<br /><span class="gradient-text">Commerce</span></h1>
    <p class="text-gray-400 text-lg max-w-xl mx-auto">
      We're a fast-growing team of builders, designers, and dreamers. Come help us change the way the world shops.
    </p>
  </div>

  <!-- Perks -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
    {#each perks as p}
      <div class="glass rounded-2xl p-6 border border-white/5 hover:border-indigo-500/20 transition-colors">
        <div class="w-10 h-10 rounded-xl {p.bg} flex items-center justify-center mb-4">
          <p.icon class="w-5 h-5 {p.color}" />
        </div>
        <h3 class="font-bold mb-2">{p.title}</h3>
        <p class="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
      </div>
    {/each}
  </div>

  <!-- Open roles -->
  <div class="mb-16">
    <h2 class="text-3xl font-black mb-8">Open Positions</h2>
    <div class="space-y-3">
      {#each openings as job}
        <div class="glass rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer flex items-center justify-between">
          <div>
            <h3 class="font-bold text-lg mb-1 group-hover:text-indigo-300 transition-colors">{job.title}</h3>
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span class="flex items-center gap-1.5"><Briefcase class="w-3.5 h-3.5" /> {job.dept}</span>
              <span class="flex items-center gap-1.5"><MapPin class="w-3.5 h-3.5" /> {job.location}</span>
              <span class="flex items-center gap-1.5"><Clock class="w-3.5 h-3.5" /> {job.type}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 text-indigo-400 text-sm font-medium shrink-0 ml-4">
            Apply <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- No role? -->
  <div class="glass rounded-2xl p-10 text-center border border-indigo-500/20">
    <h3 class="text-2xl font-bold mb-2">Don't see a fit?</h3>
    <p class="text-gray-400 mb-6">We're always looking for exceptional people. Send us your resume and we'll keep you in mind for future roles.</p>
    <a href="/contact" class="btn-primary inline-flex items-center gap-2 px-6 py-3">
      Get in Touch <ArrowRight class="w-4 h-4" />
    </a>
  </div>
</div>
