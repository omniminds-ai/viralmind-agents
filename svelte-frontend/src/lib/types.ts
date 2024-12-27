export interface TournamentMessage {
  _id: string;
  challenges: string;
  role: string;
  content: string;
  tools_calls?: any;
  address?: string;
  txn?: string;
  date: string;
  screenshot?: { url: string };
}

export interface Tournament {
  challenge: any;
  break_attempts: number;
  message_price: number;
  prize: number;
  usdMessagePrice: number;
  usdPrize: number;
  expiry: Date;
  solPrice: number;
  chatHistory: TournamentMessage;
  latestScreenshot: string;
}
