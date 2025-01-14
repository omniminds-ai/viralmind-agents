export interface ChatMessage {
  challenge: string;
  model: string;
  role: string;
  content: string;
  screenshot: string;
  address: string;
  txn: string;
  verified: boolean;
  date: Date;
}

export interface TournamentData {
  title: string;
  name: string;
  description: string;
  image: string;
  pfp: string;
  task: string;
  label: string;
  level: string;
  model: string;
  system_message: string;
  characterLimit: number;
  contextLimit: number;
  chatLimit: number;
  tools: any[];
}
