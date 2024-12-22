<script lang="ts">
  import logo from '$lib/assets/stoneLogo.png';
  const currentTournament = 'viral_lua';
</script>

<div class="border-b border-zinc-800 bg-zinc-900 py-4 text-white">
  <div class="flex content-center justify-center text-center font-semibold">
    <a
      class="w-20 border-b-2 border-transparent px-2 py-5 transition-all duration-200 hover:border-purple-600 hover:text-purple-600"
      href="/">Home</a
    >
    <a
      class="w-20 border-b-2 border-transparent px-2 py-5 transition-all duration-200 hover:border-purple-600 hover:text-purple-600"
      href="/viral-token">Tokens</a
    >
    <a href="/" class="" aria-label="Image">
      <img class="h-16 w-16 rounded-b-3xl" src={logo} alt="Logo" />
    </a>
    <a
      class="w-20 border-b-2 border-transparent px-2 py-5 transition-all duration-200 hover:border-purple-600 hover:text-purple-600"
      href="/faq">FAQ</a
    >
    <a
      class="w-20 border-b-2 border-transparent px-2 py-5 transition-all duration-200 hover:border-purple-600 hover:text-purple-600"
      href={`/tournament/${currentTournament}`}>Play</a
    >
  </div>
</div>
