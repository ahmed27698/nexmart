<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { animate } from 'motion';
  import { auth } from '$lib/stores/auth';
  import { cart } from '$lib/stores/cart';
  import { Eye, EyeOff } from 'lucide-svelte';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);
  let showPass = $state(false);

  onMount(() => {
    if ($auth.user) goto('/');
    animate('.auth-card', { opacity: [0, 1], y: [30, 0], scale: [0.97, 1] }, { duration: 0.5 });
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const user = await auth.login(email, password);
      await cart.load();
      goto(user.role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      error = err.message;
      animate('.error-msg', { x: [-6, 6, -4, 4, 0] }, { duration: 0.4 });
    } finally { loading = false; }
  }
</script>

<svelte:head><title>Sign In — NEXMART</title></svelte:head>

<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
  <div class="auth-card opacity-0 w-full max-w-md">
    <div class="glass rounded-3xl p-8 border border-white/10">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black gradient-text mb-2">Welcome Back</h1>
        <p class="text-gray-400">Sign in to your NEXMART account</p>
      </div>

      <form onsubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1.5">Email</label>
          <input bind:value={email} type="email" required placeholder="you@example.com"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1.5">Password</label>
          <div class="relative">
            <input bind:value={password} type={showPass ? 'text' : 'password'} required placeholder="••••••••"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors pr-12" />
            <button type="button" onclick={() => showPass = !showPass} class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {#if showPass}<EyeOff class="w-5 h-5" />{:else}<Eye class="w-5 h-5" />{/if}
            </button>
          </div>
        </div>

        {#if error}
          <p class="error-msg text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">{error}</p>
        {/if}

        <button type="submit" disabled={loading}
          class="w-full btn-primary py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p class="text-center text-gray-400 text-sm mt-6">
        Don't have an account?
        <a href="/auth/register" class="text-indigo-400 hover:text-indigo-300 font-semibold ml-1">Register</a>
      </p>
      
    </div>
  </div>
</div>
