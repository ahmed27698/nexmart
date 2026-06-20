<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/api';
  import { User, Mail, Lock, Save, ShieldCheck, ClipboardList, ArrowRight } from 'lucide-svelte';

  let name = $state('');
  let email = $state('');
  let currentPassword = $state('');
  let newPassword = $state('');
  let saving = $state(false);
  let saved = $state(false);
  let error = $state('');

  onMount(() => {
    if (!$auth.user) { goto('/auth/login'); return; }
    name = $auth.user.name ?? '';
    email = $auth.user.email ?? '';
  });

  async function handleSave(e: Event) {
    e.preventDefault();
    saving = true; error = ''; saved = false;
    try {
      await api.put('/users/me', { name, ...(newPassword ? { currentPassword, newPassword } : {}) });
      auth.updateUser({ name });
      saved = true;
      currentPassword = ''; newPassword = '';
      setTimeout(() => saved = false, 3000);
    } catch (err: any) {
      error = err?.message ?? 'Failed to save changes';
    } finally { saving = false; }
  }
</script>

<svelte:head><title>Account Settings — NEXMART</title></svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">
  <div class="flex items-center gap-3 mb-10">
    <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
      <User class="w-5 h-5 text-indigo-400" />
    </div>
    <div>
      <h1 class="text-2xl font-black">Account Settings</h1>
      <p class="text-gray-400 text-sm">Manage your profile and security</p>
    </div>
  </div>

  <!-- Avatar section -->
  <div class="glass rounded-2xl p-6 border border-white/5 mb-4 flex items-center gap-5">
    <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0">
      {$auth.user?.name?.[0]?.toUpperCase() ?? '?'}
    </div>
    <div>
      <p class="font-bold text-lg">{$auth.user?.name}</p>
      <p class="text-gray-400 text-sm">{$auth.user?.email}</p>
      {#if $auth.user?.role === 'admin'}
        <span class="mt-1 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">
          <ShieldCheck class="w-3 h-3" /> Admin
        </span>
      {/if}
    </div>
  </div>

  <!-- Edit form -->
  <form onsubmit={handleSave} class="glass rounded-2xl p-7 border border-white/5 mb-4 space-y-5">
    <h2 class="font-bold text-lg">Profile Information</h2>

    <div>
      <label class="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
        <User class="w-3.5 h-3.5" /> Display Name
      </label>
      <input bind:value={name} type="text" required
        class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
    </div>

    <div>
      <label class="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
        <Mail class="w-3.5 h-3.5" /> Email Address
      </label>
      <input value={email} type="email" disabled
        class="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-gray-500 cursor-not-allowed" />
      <p class="text-xs text-gray-600 mt-1">Email cannot be changed</p>
    </div>

    <div class="h-px bg-white/5"></div>
    <h2 class="font-bold">Change Password</h2>
    <p class="text-gray-500 text-sm -mt-3">Leave blank to keep your current password</p>

    <div>
      <label class="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
        <Lock class="w-3.5 h-3.5" /> Current Password
      </label>
      <input bind:value={currentPassword} type="password" placeholder="Enter current password"
        class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
    </div>
    <div>
      <label class="flex items-center gap-1.5 text-sm text-gray-400 mb-1.5">
        <Lock class="w-3.5 h-3.5" /> New Password
      </label>
      <input bind:value={newPassword} type="password" placeholder="Min. 8 characters"
        class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
    </div>

    {#if error}
      <p class="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2">{error}</p>
    {/if}
    {#if saved}
      <p class="text-green-400 text-sm bg-green-500/10 rounded-xl px-4 py-2">Changes saved successfully!</p>
    {/if}

    <button type="submit" disabled={saving} class="btn-primary flex items-center gap-2 px-6 py-2.5">
      {#if saving}
        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...
      {:else}
        <Save class="w-4 h-4" /> Save Changes
      {/if}
    </button>
  </form>

  <!-- Quick links -->
  <div class="glass rounded-2xl p-5 border border-white/5">
    <a href="/orders" class="flex items-center justify-between px-2 py-3 hover:bg-white/5 rounded-xl transition-colors group">
      <div class="flex items-center gap-3">
        <ClipboardList class="w-4 h-4 text-indigo-400" />
        <span class="text-sm font-medium">My Orders</span>
      </div>
      <ArrowRight class="w-4 h-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
    </a>
  </div>
</div>
