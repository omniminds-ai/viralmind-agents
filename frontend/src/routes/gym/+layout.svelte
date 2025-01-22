<script lang="ts">
  import ActiveRacePopup from '$lib/components/gym/ActiveRacePopup.svelte';
  import { walletStore } from '$lib/walletStore';
  import { activeRace, startPolling } from '$lib/stores/activeRace';

  // Watch for wallet connection changes
  $: if ($walletStore.connected && $walletStore.publicKey) {
    checkActiveRace($walletStore.publicKey);
  }

  async function checkActiveRace(publicKey: any) {
    try {
      console.log('Checking active race for', publicKey.toBase58());
      const res = await fetch('/api/races/history', {
        headers: {
          'x-wallet-address': publicKey.toBase58()
        }
      });
      if (!res.ok) return;

      const races = await res.json();
      
      // Find active race
      const activeRaceSession = races.find((race: any) => race.status === 'active');
      if (activeRaceSession) {
        startPolling(activeRaceSession._id);
      }
    } catch (error) {
      console.error('Error checking for active race:', error);
    }
  }
</script>

<slot />
<ActiveRacePopup />
