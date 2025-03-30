import type { SettingsRes } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  const response = await fetch('https://viralmind.ai/api/v1/settings');
  const result = await response.json();
  const data: SettingsRes = result.success ? result.data : result;

  return data as SettingsRes;
}) satisfies PageServerLoad;
