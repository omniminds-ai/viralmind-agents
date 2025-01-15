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

export interface GenericModelMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
