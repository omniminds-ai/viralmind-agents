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

<svelte:head>
  <!-- HTML Meta Tags -->
  <title>viralmind.ai</title>
  <meta name="description" content="The Next Meta in Agentic AI." />

  <!-- Facebook Meta Tags -->
  <meta property="og:url" content="https://viralmind.ai" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="viralmind.ai" />
  <meta property="og:description" content="The Next Meta in Agentic AI." />
  <meta property="og:image" content="https://viralmind.ai/favicon.png" />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="viralmind.ai" />
  <meta property="twitter:url" content="https://viralmind.ai" />
  <meta name="twitter:title" content="viralmind.ai" />
  <meta name="twitter:description" content="The Next Meta in Agentic AI." />
  <meta name="twitter:image" content="https://viralmind.ai/favicon.png" />
</svelte:head>

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
