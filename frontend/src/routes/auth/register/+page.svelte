<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { animate } from 'motion';
  import { auth } from '$lib/stores/auth';
  import { cart } from '$lib/stores/cart';
  import { Eye, EyeOff, Check, X } from 'lucide-svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirm = $state('');
  let error = $state('');
  let loading = $state(false);
  let showPass = $state(false);
  let showConfirm = $state(false);

  const checks = $derived({
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
  });
  const passwordOk = $derived(checks.length && checks.letter && checks.number);
  const showStrength = $derived(password.length > 0);

  onMount(() => {
    if ($auth.user) goto('/');
    animate('.auth-card', { opacity: [0, 1], y: [30, 0], scale: [0.97, 1] }, { duration: 0.5 });
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    if (!passwordOk) { error = 'Password does not meet requirements'; return; }
    if (password !== confirm) { error = 'Passwords do not match'; return; }
    loading = true;
    try {
      await auth.register(email, password, name);
      await cart.load();
      goto('/');
    } catch (err: any) {
      error = err.message;
    } finally { loading = false; }
  }
</script>

<svelte:head><title>Create Account — NEXMART</title></svelte:head>

<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
  <div class="auth-card opacity-0 w-full max-w-md">
    <div class="glass rounded-3xl p-8 border border-white/10">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black gradient-text mb-2">Join NEXMART</h1>
        <p class="text-gray-400">Create your free account today</p>
      </div>

      <form onsubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="reg-name" class="block text-sm text-gray-400 mb-1.5">Full Name</label>
          <input id="reg-name" type="text" bind:value={name} required placeholder="Your full name"
            maxlength="100"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <div>
          <label for="reg-email" class="block text-sm text-gray-400 mb-1.5">Email</label>
          <input id="reg-email" type="email" bind:value={email} required placeholder="you@example.com"
            maxlength="254"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <div>
          <label for="reg-pass" class="block text-sm text-gray-400 mb-1.5">Password</label>
          <div class="relative">
            <input id="reg-pass" type={showPass ? 'text' : 'password'} bind:value={password} required
              placeholder="Min. 8 characters" maxlength="128"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors pr-12" />
            <button type="button" onclick={() => showPass = !showPass} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {#if showPass}<EyeOff class="w-5 h-5" />{:else}<Eye class="w-5 h-5" />{/if}
            </button>
          </div>

          {#if showStrength}
            <div class="mt-2 space-y-1">
              <div class="flex items-center gap-2 text-xs {checks.length ? 'text-green-400' : 'text-gray-500'}">
                {#if checks.length}<Check class="w-3 h-3" />{:else}<X class="w-3 h-3" />{/if}
                At least 8 characters
              </div>
              <div class="flex items-center gap-2 text-xs {checks.letter ? 'text-green-400' : 'text-gray-500'}">
                {#if checks.letter}<Check class="w-3 h-3" />{:else}<X class="w-3 h-3" />{/if}
                Contains a letter
              </div>
              <div class="flex items-center gap-2 text-xs {checks.number ? 'text-green-400' : 'text-gray-500'}">
                {#if checks.number}<Check class="w-3 h-3" />{:else}<X class="w-3 h-3" />{/if}
                Contains a number
              </div>
            </div>
          {/if}
        </div>
        <div>
          <label for="reg-confirm" class="block text-sm text-gray-400 mb-1.5">Confirm Password</label>
          <div class="relative">
            <input id="reg-confirm" type={showConfirm ? 'text' : 'password'} bind:value={confirm} required
              placeholder="Repeat your password" maxlength="128"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors pr-12" />
            <button type="button" onclick={() => showConfirm = !showConfirm} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {#if showConfirm}<EyeOff class="w-5 h-5" />{:else}<Eye class="w-5 h-5" />{/if}
            </button>
          </div>
        </div>

        {#if error}
          <p class="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">{error}</p>
        {/if}

        <button type="submit" disabled={loading || !passwordOk} class="w-full btn-primary py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p class="text-center text-gray-400 text-sm mt-6">
        Already have an account?
        <a href="/auth/login" class="text-indigo-400 hover:text-indigo-300 font-semibold ml-1">Sign In</a>
      </p>
    </div>
  </div>
</div>
