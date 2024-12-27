import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Tournament } from '$lib/types';

export const load = (async ({ params, url }) => {
  const { name } = params;
  const initial = url.searchParams.get('initial') === 'true';
  const price = url.searchParams.get('price') || '0';

  try {
    const response = await fetch(
      `https://viralmind.ai/api/challenges/get-challenge?name=${name}&initial=${initial}&price=${price}`
    );

    if (!response.ok) {
      throw error(404, 'Tournament not found');
    }

    const data = await response.json();
    return {
      challenge: data.challenge,
      break_attempts: data.break_attempts,
      message_price: data.message_price,
      prize: data.prize,
      usdMessagePrice: data.usdMessagePrice,
      usdPrize: data.usdPrize,
      expiry: data.expiry,
      solPrice: data.solPrice,
      chatHistory: data.chatHistory,
      latestScreenshot: data.latestScreenshot
    } as Tournament;
  } catch (e) {
    console.error('Error loading tournament:', e);
    throw error(500, 'Error loading tournament data');
  }
}) satisfies PageServerLoad;

