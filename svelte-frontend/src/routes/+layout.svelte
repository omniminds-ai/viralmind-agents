<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
  import GymHeader from '$lib/components/GymHeader.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { page } from '$app/state';

  let { children } = $props();

  const isGymRoute = $derived(page.url.pathname.startsWith('/gym'));
  const isTournamentRoute = $derived(page.url.pathname.startsWith('/tournament'));
</script>

<div class="bg-black">
  {#if isGymRoute}
    <GymHeader />
  {:else}
    <Navbar />
  {/if}
  {@render children()}
  {#if !isTournamentRoute}
    <Footer />
  {/if}
</div>

