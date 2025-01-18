import type { SettingsRes } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const response = await fetch('https://viralmind.ai/api/settings');
  const data: SettingsRes = await response.json();

  return {
    concludedChallenges: data.concludedChallenges,
    activeChallenge: data.activeChallenge
  };
}) satisfies PageServerLoad;
