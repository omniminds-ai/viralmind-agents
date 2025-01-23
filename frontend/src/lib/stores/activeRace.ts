import { writable } from 'svelte/store';

export interface ActiveRace {
  sessionId: string;
  preview?: string;
  status: string;
  lastUpdated: Date;
  lastQuest?: string;
  createdAt: Date;
}

export const activeRace = writable<ActiveRace | null>(null);

// Poll for active race status
let pollInterval: NodeJS.Timeout | null = null;

export function startPolling(sessionId: string) {
  if (pollInterval) {
    clearInterval(pollInterval);
  }

  // Poll every 5 seconds
  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/races/session/${sessionId}`);
      if (!res.ok) {
        if (res.status === 410) { // Session expired
          activeRace.set(null);
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }
        return;
      }

      const [sessionRes, eventsRes] = await Promise.all([
        res,
        fetch(`/api/races/export?sessionId=${sessionId}`)
      ]);

      const data = await sessionRes.json();
      const eventsData = await eventsRes.json();

      // Find the latest quest event
      const lastQuest = eventsData.events
        ?.filter((e: any) => e.type === 'quest')
        .pop()?.message;

      activeRace.set({
        sessionId,
        preview: data.preview,
        status: data.status,
        lastUpdated: new Date(data.updated_at),
        lastQuest,
        createdAt: new Date(data.created_at)
      });
    } catch (error) {
      console.error('Error polling race status:', error);
    }
  }, 5000);
}

export function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  activeRace.set(null);
}
