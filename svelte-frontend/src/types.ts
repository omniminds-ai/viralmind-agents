interface TournamentMessage {
  content: string;
  date: string;
  role: string;
  address?: string;
  screenshot?: { url: string };
}
