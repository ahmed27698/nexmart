<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { animate } from 'motion';
  import { cart, cartTotal } from '$lib/stores/cart';
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/api';
  import {
    MapPin, CreditCard, Lock, CheckCircle, ChevronRight,
    ShoppingBag, Truck, Shield, ArrowLeft, Wifi
  } from 'lucide-svelte';

  // Form state
  let firstName = $state('');
  let lastName  = $state('');
  let email     = $state('');
  let address   = $state('');
  let city      = $state('');
  let region    = $state('');
  let zip       = $state('');
  let country   = $state('US');

  let cardName   = $state('');
  let cardNumber = $state('');
  let cardExpiry = $state('');
  let cardCvc    = $state('');

  let step      = $state<'shipping' | 'payment' | 'success'>('shipping');
  let placing   = $state(false);
  let error     = $state('');
  let orderId   = $state<number | null>(null);

  // Computed totals (same formula as cart page)
  const shipping: number = $derived($cartTotal >= 50 ? 0 : 5.99);
  const tax: number      = $derived($cartTotal * 0.08);
  const total: number    = $derived($cartTotal + shipping + tax);

  // Track if cart ever had items this session — only redirect once cart was loaded then emptied
  let cartHadItems = $state(false);

  onMount(() => {
    if (!$auth.user) { goto('/auth/login'); return; }
    email = $auth.user.email ?? '';
    animate('.checkout-card', { opacity: [0, 1], y: [24, 0] }, { duration: 0.5 });
    animate('.order-summary', { opacity: [0, 1], x: [30, 0] }, { duration: 0.5, delay: 0.1 });
  });

  $effect(() => {
    if ($cart.length > 0) { cartHadItems = true; return; }
    // Redirect only if cart was non-empty and is now empty (not on success screen, not while placing)
    if (cartHadItems && step !== 'success' && !placing) goto('/cart');
  });

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }
  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  }

  function validateShipping(): boolean {
    if (!firstName.trim() || !lastName.trim()) { error = 'Full name is required'; return false; }
    if (!address.trim())  { error = 'Street address is required'; return false; }
    if (!city.trim())     { error = 'City is required'; return false; }
    if (!region.trim())   { error = 'State / province is required'; return false; }
    if (!zip.trim())      { error = 'Postal code is required'; return false; }
    error = '';
    return true;
  }

  function validatePayment(): boolean {
    const digits = cardNumber.replace(/\s/g, '');
    if (!cardName.trim()) { error = 'Name on card is required'; return false; }
    if (digits.length < 16) { error = 'Enter a valid 16-digit card number'; return false; }
    if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) { error = 'Enter expiry as MM/YY'; return false; }
    if (cardCvc.length < 3) { error = 'Enter a valid CVV'; return false; }
    error = '';
    return true;
  }

  async function placeOrder() {
    if (!validatePayment()) return;
    placing = true; error = '';
    try {
      const items = $cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }));
      const shipping_address = {
        name:    `${firstName.trim()} ${lastName.trim()}`,
        address: address.trim(),
        city:    city.trim(),
        state:   region.trim(),
        zip:     zip.trim(),
        country,
      };
      const order = await api.post<{ id: number }>('/orders', {
        items,
        shipping_address,
        payment_method: 'card',
      });
      orderId = order.id;
      await cart.load(); // clear cart in store
      step = 'success';
      await tick(); // wait for success block to render before animating
      animate('.success-icon', { scale: [0, 1.1, 1], opacity: [0, 1] }, { duration: 0.6 });
    } catch (err: any) {
      error = err?.message ?? 'Failed to place order. Please try again.';
    } finally {
      placing = false;
    }
  }
</script>

<svelte:head><title>Checkout — NEXMART</title></svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">

  {#if step === 'success'}
    <!-- ══ SUCCESS ══ -->
    <div class="max-w-lg mx-auto text-center py-20">
      <div class="success-icon opacity-0 w-24 h-24 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle class="w-12 h-12 text-green-400" />
      </div>
      <h1 class="text-3xl font-black mb-3">Order Placed!</h1>
      <p class="text-gray-400 mb-2">Thank you for your purchase.</p>
      <p class="text-gray-500 text-sm mb-8">Order <span class="text-indigo-400 font-semibold">#{orderId}</span> has been confirmed. You'll receive updates shortly.</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/orders" class="btn-primary flex items-center gap-2 justify-center">
          <ShoppingBag class="w-4 h-4" /> View My Orders
        </a>
        <a href="/products" class="btn-secondary flex items-center gap-2 justify-center">
          Continue Shopping
        </a>
      </div>
    </div>

  {:else}
    <!-- ══ BREADCRUMB ══ -->
    <div class="flex items-center gap-2 text-sm text-gray-500 mb-8">
      <a href="/cart" class="hover:text-indigo-400 flex items-center gap-1 transition-colors">
        <ArrowLeft class="w-3.5 h-3.5" /> Cart
      </a>
      <ChevronRight class="w-3.5 h-3.5" />
      <span class="{step === 'shipping' ? 'text-white font-semibold' : 'text-gray-500'}">Shipping</span>
      <ChevronRight class="w-3.5 h-3.5" />
      <span class="{step === 'payment' ? 'text-white font-semibold' : 'text-gray-500'}">Payment</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">

      <!-- ══ FORM PANEL ══ -->
      <div class="lg:col-span-3">
        <div class="checkout-card opacity-0">

          {#if step === 'shipping'}
            <!-- SHIPPING FORM -->
            <div class="glass rounded-2xl p-7 border border-white/8">
              <div class="flex items-center gap-3 mb-7">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <MapPin class="w-4 h-4 text-indigo-400" />
                </div>
                <h2 class="text-xl font-bold">Shipping Address</h2>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5 font-medium">First Name</label>
                    <input bind:value={firstName} type="text" placeholder="John" required
                      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5 font-medium">Last Name</label>
                    <input bind:value={lastName} type="text" placeholder="Doe" required
                      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
                  <input bind:value={email} type="email" placeholder="you@example.com"
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                </div>

                <div>
                  <label class="block text-xs text-gray-400 mb-1.5 font-medium">Street Address</label>
                  <input bind:value={address} type="text" placeholder="123 Main St"
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5 font-medium">City</label>
                    <input bind:value={city} type="text" placeholder="New York"
                      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5 font-medium">State / Province</label>
                    <input bind:value={region} type="text" placeholder="NY"
                      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5 font-medium">Postal Code</label>
                    <input bind:value={zip} type="text" placeholder="10001"
                      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5 font-medium">Country</label>
                    <select bind:value={country}
                      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm">
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="EG">Egypt</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="AE">UAE</option>
                      <option value="SA">Saudi Arabia</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                {#if error}
                  <p class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">{error}</p>
                {/if}

                <button onclick={() => { if (validateShipping()) step = 'payment'; }}
                  class="w-full btn-primary mt-2 flex items-center justify-center gap-2">
                  Continue to Payment <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>

          {:else if step === 'payment'}
            <!-- PAYMENT FORM -->
            <div class="glass rounded-2xl p-7 border border-white/8">
              <div class="flex items-center gap-3 mb-7">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <CreditCard class="w-4 h-4 text-indigo-400" />
                </div>
                <h2 class="text-xl font-bold">Payment Details</h2>
                <div class="ml-auto flex items-center gap-1 text-green-400 text-xs font-medium glass px-2.5 py-1 rounded-full border border-green-500/20">
                  <Lock class="w-3 h-3" /> Secure
                </div>
              </div>

              <!-- Shipping recap -->
              <button onclick={() => step = 'shipping'}
                class="w-full glass rounded-xl px-4 py-3 mb-5 flex items-center justify-between hover:border-indigo-500/30 transition-colors border border-white/8 text-left group">
                <div class="flex items-center gap-3">
                  <MapPin class="w-4 h-4 text-indigo-400 shrink-0" />
                  <div class="text-sm">
                    <p class="font-medium">{firstName} {lastName}</p>
                    <p class="text-gray-400 text-xs">{address}, {city}, {region} {zip}</p>
                  </div>
                </div>
                <span class="text-indigo-400 text-xs group-hover:underline">Edit</span>
              </button>

              <!-- Card mockup -->
              <div class="relative rounded-2xl mb-6 overflow-hidden select-none"
                style="aspect-ratio:1.586; background:linear-gradient(135deg,#1a0f5e 0%,#3730a3 40%,#6d28d9 72%,#4c1d95 100%); box-shadow:0 24px 48px -10px rgba(79,70,229,0.55);">

                <!-- Radial glow top-right -->
                <div class="absolute inset-0 pointer-events-none"
                  style="background:radial-gradient(ellipse at 80% 15%,rgba(167,139,250,0.3) 0%,transparent 55%)"></div>

                <!-- Sweeping shimmer -->
                <div class="absolute inset-y-0 w-2/5 pointer-events-none"
                  style="background:linear-gradient(to right,transparent,rgba(255,255,255,0.09),transparent);animation:card-shimmer 3.5s ease-in-out infinite;"></div>

                <!-- Top row: brand (left) · network circles (right) -->
                <div class="absolute top-[14%] inset-x-[7%] flex items-center justify-between">
                  <span class="text-white font-black text-sm tracking-[0.18em] drop-shadow">NEXMART</span>
                  <div class="flex -space-x-3">
                    <div class="w-7 h-7 rounded-full" style="background:rgba(239,68,68,0.88);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>
                    <div class="w-7 h-7 rounded-full" style="background:rgba(251,191,36,0.88);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>
                  </div>
                </div>

                <!-- EMV chip -->
                <div class="absolute" style="left:7%;top:34%;">
                  <div class="rounded" style="width:2.7rem;height:2.1rem;background:linear-gradient(135deg,#c9a227,#f0d060,#c9a227);">
                    <div style="margin:3px;border-radius:3px;height:calc(100% - 6px);background:#b8960c;padding:3px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:2px;">
                      <div style="background:rgba(0,0,0,0.2);border-radius:1px"></div>
                      <div style="background:rgba(0,0,0,0.2);border-radius:1px"></div>
                      <div style="background:rgba(0,0,0,0.2);border-radius:1px"></div>
                      <div style="background:rgba(0,0,0,0.2);border-radius:1px"></div>
                      <div style="background:linear-gradient(135deg,#e8d56a,#f7ef99);border-radius:1px"></div>
                      <div style="background:rgba(0,0,0,0.2);border-radius:1px"></div>
                      <div style="background:rgba(0,0,0,0.2);border-radius:1px"></div>
                      <div style="background:rgba(0,0,0,0.2);border-radius:1px"></div>
                      <div style="background:rgba(0,0,0,0.2);border-radius:1px"></div>
                    </div>
                  </div>
                </div>

                <!-- NFC wave -->
                <div class="absolute" style="left:calc(7% + 3.2rem);top:35%;">
                  <Wifi class="w-5 h-5 text-white/25 rotate-90" />
                </div>

                <!-- Card number — centred vertically between chip and bottom -->
                <div class="absolute inset-x-[7%]" style="top:58%;">
                  <p class="font-mono text-white/85 tracking-[0.22em] text-[clamp(0.75rem,2.5vw,1rem)] leading-none">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                </div>

                <!-- Bottom row: holder name (left) · expiry (right) -->
                <div class="absolute inset-x-[7%] bottom-[12%] flex items-end justify-between">
                  <div class="min-w-0">
                    <p class="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Card Holder</p>
                    <p class="text-[clamp(0.65rem,2vw,0.85rem)] text-white/90 font-semibold tracking-wider uppercase truncate max-w-[55%]">
                      {cardName || 'YOUR NAME'}
                    </p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Expires</p>
                    <p class="text-[clamp(0.65rem,2vw,0.85rem)] text-white/90 font-mono">{cardExpiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-400 mb-1.5 font-medium">Name on Card</label>
                  <input bind:value={cardName} type="text" placeholder="John Doe"
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                </div>
                <div>
                  <label class="block text-xs text-gray-400 mb-1.5 font-medium">Card Number</label>
                  <input value={cardNumber} oninput={(e) => cardNumber = formatCardNumber((e.target as HTMLInputElement).value)}
                    type="text" inputmode="numeric" placeholder="1234 5678 9012 3456" maxlength="19"
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono tracking-wider" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5 font-medium">Expiry (MM/YY)</label>
                    <input value={cardExpiry} oninput={(e) => cardExpiry = formatExpiry((e.target as HTMLInputElement).value)}
                      type="text" inputmode="numeric" placeholder="08/27" maxlength="5"
                      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono" />
                  </div>
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5 font-medium">CVV</label>
                    <input bind:value={cardCvc} type="text" inputmode="numeric" placeholder="•••" maxlength="4"
                      class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono" />
                  </div>
                </div>

                {#if error}
                  <p class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">{error}</p>
                {/if}

                <button onclick={placeOrder} disabled={placing}
                  class="w-full btn-primary mt-2 flex items-center justify-center gap-2 text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                  {#if placing}
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing…
                  {:else}
                    <Lock class="w-4 h-4" />
                    Place Order · ${total.toFixed(2)}
                  {/if}
                </button>

                <p class="text-center text-gray-500 text-xs flex items-center justify-center gap-1 mt-1">
                  <Shield class="w-3 h-3" /> Your payment info is never stored on our servers
                </p>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- ══ ORDER SUMMARY ══ -->
      <div class="lg:col-span-2">
        <div class="order-summary opacity-0 glass rounded-2xl p-6 border border-white/8 sticky top-28">
          <h2 class="font-bold text-lg mb-5 flex items-center gap-2">
            <ShoppingBag class="w-4 h-4 text-indigo-400" /> Order Summary
          </h2>

          <div class="space-y-3 max-h-64 overflow-y-auto pr-1 mb-5">
            {#each $cart as item}
              <div class="flex items-center gap-3">
                <img src={item.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80'}
                  alt={item.name} class="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium line-clamp-1">{item.name}</p>
                  <p class="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span class="text-sm font-semibold shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            {/each}
          </div>

          <div class="border-t border-white/8 pt-4 space-y-2.5 text-sm">
            <div class="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>${$cartTotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span class="flex items-center gap-1"><Truck class="w-3.5 h-3.5" /> Shipping</span>
              <span class="{shipping === 0 ? 'text-green-400 font-medium' : ''}">{shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-gray-400">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div class="border-t border-white/8 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span class="gradient-text">${total.toFixed(2)}</span>
            </div>
          </div>

          {#if shipping === 0}
            <div class="mt-3 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-xs text-green-400">
              <Truck class="w-3.5 h-3.5 shrink-0" /> You qualify for free shipping!
            </div>
          {:else}
            <div class="mt-3 text-xs text-gray-500 text-center">
              Add ${(50 - $cartTotal).toFixed(2)} more for free shipping
            </div>
          {/if}
        </div>
      </div>

    </div>
  {/if}
</div>
