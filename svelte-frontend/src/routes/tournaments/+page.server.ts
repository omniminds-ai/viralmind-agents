import type { PageServerLoad } from './$types';

export const load = (async () => {
  const response = await fetch('https://viralmind.ai/api/settings');
  const data = await response.json();
  
  return {
    concludedChallenges: data.concludedChallenges
  };
}) satisfies PageServerLoad;