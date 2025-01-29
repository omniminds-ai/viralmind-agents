import type { SettingsRes } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const response = await fetch('https://viralmind.ai/api/settings');
  const data: SettingsRes = await response.json();

  return data as SettingsRes;
}) satisfies PageServerLoad;
