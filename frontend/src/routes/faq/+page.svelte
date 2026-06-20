<script lang="ts">
  import { ChevronDown, HelpCircle } from 'lucide-svelte';

  const sections = [
    {
      category: 'Orders & Payment',
      items: [
        { q: 'How do I track my order?', a: 'Once your order ships you\'ll receive a confirmation email with a tracking link. You can also view live status in your account under "Orders".' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, and Google Pay.' },
        { q: 'Can I cancel or modify my order?', a: 'Orders can be cancelled or modified within 1 hour of placement. After that, the order enters processing and cannot be changed.' },
        { q: 'Is it safe to use my credit card on NEXMART?', a: 'Yes. All transactions are secured with 256-bit SSL encryption and we never store your full card details.' },
      ]
    },
    {
      category: 'Shipping & Delivery',
      items: [
        { q: 'How long does delivery take?', a: 'Standard shipping takes 3–5 business days. Expedited (1–2 days) and overnight options are available at checkout.' },
        { q: 'Do you ship internationally?', a: 'Yes, we ship to over 150 countries. International delivery typically takes 7–14 business days depending on destination.' },
        { q: 'Is free shipping available?', a: 'All orders over $50 qualify for free standard shipping within the United States.' },
      ]
    },
    {
      category: 'Returns & Refunds',
      items: [
        { q: 'What is the return policy?', a: 'We offer a 30-day hassle-free return policy on most items. Products must be unused and in their original packaging.' },
        { q: 'How long do refunds take?', a: 'Once we receive your return, refunds are processed within 3–5 business days back to your original payment method.' },
        { q: 'Who pays for return shipping?', a: 'We provide a free prepaid return label for defective or incorrect items. For change-of-mind returns, a small label fee applies.' },
      ]
    },
    {
      category: 'Account',
      items: [
        { q: 'How do I create an account?', a: 'Click "Sign In" in the top navigation and choose "Create account". You only need an email and password to get started.' },
        { q: 'I forgot my password. What do I do?', a: 'Use the "Forgot password?" link on the login page. We\'ll send a reset link to your email within a few minutes.' },
      ]
    },
  ];

  let open = $state<string | null>(null);
  function toggle(key: string) { open = open === key ? null : key; }
</script>

<svelte:head><title>FAQ — NEXMART</title></svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-16">
  <div class="text-center mb-14">
    <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-400 mb-6">
      <HelpCircle class="w-4 h-4" /> Frequently Asked Questions
    </div>
    <h1 class="text-5xl font-black mb-4">How can we <span class="gradient-text">help?</span></h1>
    <p class="text-gray-400 text-lg">Everything you need to know about NEXMART.</p>
  </div>

  <div class="space-y-10">
    {#each sections as section}
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-4">{section.category}</h2>
        <div class="space-y-2">
          {#each section.items as item}
            {@const key = section.category + item.q}
            <div class="glass rounded-2xl border border-white/5 overflow-hidden transition-all">
              <button onclick={() => toggle(key)}
                class="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors">
                <span class="font-medium text-sm pr-4">{item.q}</span>
                <ChevronDown class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 {open === key ? 'rotate-180' : ''}" />
              </button>
              {#if open === key}
                <div class="px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">{item.a}</div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-14 glass rounded-2xl p-8 text-center border border-indigo-500/20">
    <h3 class="text-xl font-bold mb-2">Still have questions?</h3>
    <p class="text-gray-400 text-sm mb-6">Our support team is available 24/7 to help you out.</p>
    <a href="/contact" class="btn-primary inline-flex items-center gap-2 px-6 py-3">Contact Support</a>
  </div>
</div>
