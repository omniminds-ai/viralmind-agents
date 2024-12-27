export interface TournamentMessage {
  _id: string;
  challenges?: string;
  role: string;
  content: string;
  tools_calls?: any;
  address?: string;
  txn?: string;
  date: string;
  screenshot?: { url: string };
}

type IDLMetadata = {
  name: string;
  version: string;
  spec: string;
  description: string;
};

type IDL = {
  address: string;
  metadata: IDLMetadata;
  instructions: {
    name: string;
    discriminator: unknown[];
    accounts: unknown[];
    args: unknown[];
  }[];
  accounts: {
    name: string;
    discriminator: unknown[];
  }[];
  events: {
    name: string;
    discriminator: unknown[];
  }[];
  errors: {
    code: number;
    name: string;
    msg: string;
  }[];
  types: {
    name: string;
    type: Record<string, unknown>;
  }[];
};

interface Score {
  _id: string;
  account: string;
  score: number;
  timestamp: Date;
}

interface Challenge {
  _id: string;
  title: string;
  name: string;
  image: string;
  pfp: string;
  task: string;
  label: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced'; // Using union type assuming these are the possible values
  status: 'upcoming' | 'active' | 'concluded'; // Add other possible status values if known
  deployed: boolean;
  idl: IDL;
  entryFee: number;
  characterLimit: number;
  contextLimit: number;
  chatLimit: number;
  expiry: string; // Could also use Date if you're parsing the date
  initial_pool_size: number;
  developer_fee: number;
  disable: unknown[]; // Specify the type of elements if known
  expiry_logic: string;
  scores: Score[];
  start_date: string; // Could also use Date if you're parsing the date
  win_condition: string;
  tournamentPDA: string;
}

export interface Tournament {
  challenge: Challenge;
  break_attempts: number;
  message_price: number;
  prize: number;
  usdMessagePrice: number;
  usdPrize: number;
  expiry: Date;
  solPrice: number;
  chatHistory: TournamentMessage[];
  latestScreenshot: { url: string };
}
