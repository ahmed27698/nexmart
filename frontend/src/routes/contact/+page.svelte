<script lang="ts">
  import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-svelte';

  let name = $state('');
  let email = $state('');
  let subject = $state('');
  let message = $state('');
  let sent = $state(false);
  let sending = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    sending = true;
    await new Promise(r => setTimeout(r, 1000));
    sending = false;
    sent = true;
  }
</script>

<svelte:head><title>Contact Us — NEXMART</title></svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
  <!-- Header -->
  <div class="text-center mb-16">
    <div class="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-indigo-400 mb-6">
      <MessageSquare class="w-4 h-4" /> Get in touch
    </div>
    <h1 class="text-5xl font-black mb-4">Contact <span class="gradient-text">Us</span></h1>
    <p class="text-gray-400 text-lg max-w-xl mx-auto">Have a question or need help? We're here for you 24/7.</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Info cards -->
    <div class="space-y-4">
      {#each [
        { icon: Mail,    color: 'text-indigo-400', bg: 'bg-indigo-500/10', title: 'Email Us',      info: 'support@nexmart.com',    sub: 'We reply within 2 hours'  },
        { icon: Phone,   color: 'text-green-400',  bg: 'bg-green-500/10',  title: 'Call Us',       info: '+1 (800) 639-2678',      sub: 'Mon–Fri, 9am–6pm EST'    },
        { icon: MapPin,  color: 'text-pink-400',   bg: 'bg-pink-500/10',   title: 'Visit Us',      info: '123 Commerce St, NY',    sub: 'New York, NY 10001'       },
        { icon: Clock,   color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: 'Working Hours', info: 'Mon–Fri: 9am – 6pm',    sub: 'Weekend: 10am – 4pm'     },
      ] as c}
        <div class="glass rounded-2xl p-5 flex items-start gap-4 border border-white/5 hover:border-indigo-500/20 transition-colors">
          <div class="w-10 h-10 rounded-xl {c.bg} flex items-center justify-center shrink-0">
            <c.icon class="w-5 h-5 {c.color}" />
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-widest mb-0.5">{c.title}</p>
            <p class="font-semibold text-sm">{c.info}</p>
            <p class="text-xs text-gray-500 mt-0.5">{c.sub}</p>
          </div>
        </div>
      {/each}
    </div>

    <!-- Form -->
    <div class="lg:col-span-2 glass rounded-2xl p-8 border border-white/5">
      {#if sent}
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send class="w-7 h-7 text-green-400" />
          </div>
          <h2 class="text-2xl font-bold mb-2">Message Sent!</h2>
          <p class="text-gray-400">We'll get back to you within 2 hours.</p>
          <button onclick={() => { sent = false; name = ''; email = ''; subject = ''; message = ''; }}
            class="mt-6 btn-secondary text-sm px-6 py-2">Send another</button>
        </div>
      {:else}
        <h2 class="text-xl font-bold mb-6">Send a Message</h2>
        <form onsubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-400 mb-1.5">Your Name</label>
              <input bind:value={name} required type="text" placeholder="Ahmed Samir"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-1.5">Email Address</label>
              <input bind:value={email} required type="email" placeholder="you@example.com"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1.5">Subject</label>
            <input bind:value={subject} required type="text" placeholder="Order issue, product question..."
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1.5">Message</label>
            <textarea bind:value={message} required rows="5" placeholder="Tell us how we can help..."
              class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"></textarea>
          </div>
          <button type="submit" disabled={sending} class="btn-primary flex items-center gap-2 px-8 py-3">
            {#if sending}
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Sending...
            {:else}
              <Send class="w-4 h-4" /> Send Message
            {/if}
          </button>
        </form>
      {/if}
    </div>
  </div>
</div>
