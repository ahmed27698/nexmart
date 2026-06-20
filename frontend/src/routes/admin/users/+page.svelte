<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { animate } from 'motion';
  import { api } from '$lib/api';
  import { Users, Shield, ShoppingBag } from 'lucide-svelte';

  let users = $state<any[]>([]);
  let loading = $state(true);
  let search = $state('');

  onMount(async () => {
    await load();
    await tick();
    (animate as any)('.user-row', { opacity: [0, 1], x: [-10, 0] }, { duration: 0.3, delay: (_: any, i: number) => i * 0.05 });
  });

  async function load() {
    loading = true;
    try { users = await api.get<any[]>('/users'); }
    catch { users = []; } finally { loading = false; }
  }

  async function toggleRole(user: any) {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    await api.put(`/users/${user.id}/role`, { role: newRole });
    users = users.map(u => u.id === user.id ? { ...u, role: newRole } : u);
  }

  const filtered = $derived(search ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) : users);
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Users</h1>
      <p class="text-gray-400 text-sm mt-1">{users.length} registered users</p>
    </div>
  </div>

  <div class="relative max-w-sm">
    <input bind:value={search} type="text" placeholder="Search users..."
      class="w-full pl-4 pr-4 py-2.5 glass border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
  </div>

  <div class="glass rounded-2xl border border-white/5 overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
          <th class="text-left px-4 py-3">User</th>
          <th class="text-left px-4 py-3 hidden md:table-cell">Joined</th>
          <th class="text-left px-4 py-3">Role</th>
          <th class="text-right px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if loading}
          {#each {length: 6} as _}
            <tr class="border-b border-white/5">
              <td colspan="4" class="px-4 py-3"><div class="h-8 bg-white/5 rounded animate-pulse"></div></td>
            </tr>
          {/each}
        {:else}
          {#each filtered as user}
            <tr class="user-row opacity-0 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-indigo-600/30 flex items-center justify-center text-sm font-bold text-indigo-400 shrink-0">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p class="font-medium">{user.name}</p>
                    <p class="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-1 rounded-full {user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700/50 text-gray-400'}">
                  {user.role}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button onclick={() => toggleRole(user)}
                  class="text-xs px-3 py-1.5 glass rounded-xl hover:border-indigo-500/30 transition-colors text-gray-400 hover:text-white">
                  {user.role === 'admin' ? 'Make Customer' : 'Make Admin'}
                </button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>
