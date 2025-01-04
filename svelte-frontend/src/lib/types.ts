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

interface WhitelistEntry {
  username: string;
  address: string;
  viral_balance: number;
  signature: string;
  _id: string;
}

type IDLAccountField = {
  name: string;
  writable?: boolean;
  signer?: boolean;
  address?: string;
  pda?: {
    seeds: Array<{
      kind: string;
      value: number[];
    }>;
  };
};

type IDLArgument = {
  name: string;
  type:
    | {
        array?: [string, number];
      }
    | string;
};

type IDLMetadata = {
  name: string;
  version: string;
  spec: string;
  description: string;
};

type IDL = {
  address: string;
  metadata: IDLMetadata;
  instructions: Array<{
    name: string;
    discriminator: number[];
    accounts: IDLAccountField[];
    args: IDLArgument[];
  }>;
  accounts: Array<{
    name: string;
    discriminator: number[];
  }>;
  events: Array<{
    name: string;
    discriminator: number[];
  }>;
  errors: Array<{
    code: number;
    name: string;
    msg: string;
  }>;
  types: Array<{
    name: string;
    type: {
      kind: string;
      fields?: Array<{
        name: string;
        type: string | { array: [string, number] } | { defined: { name: string } };
      }>;
      variants?: Array<{
        name: string;
      }>;
    };
  }>;
};

interface Score {
  _id: string;
  account: string;
  score: number;
  timestamp: Date;
}

export interface Challenge {
  _id?: string;
  id?: string;
  title: string;
  name: string;
  description?: string;
  image: string;
  pfp: string;
  task?: string;
  label: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'upcoming' | 'active' | 'concluded' | 'expired';
  system_message?: string;
  deployed?: boolean;
  idl?: IDL;
  entryFee: number;
  characterLimit?: number;
  contextLimit?: number;
  chatLimit?: number;
  expiry: string;
  start_date: string;
  win_condition?: string;
  prize?: number;
  usdPrize?: number;
  initial_pool_size?: number;
  developer_fee: number;
  tools?: any[];
  winning_message?: string;
  winning_prize?: number;
  disable?: unknown[];
  tool_choice?: 'auto' | 'none' | 'function';
  expiry_logic?: 'time' | 'solved';
  scores?: Score[];
  __v?: number;
  tournamentPDA?: string;
  game?: string;
  stream_src?: string;
  game_ip?: string;
  game_secret?: string;
  max_actions?: number;
  whitelist?: WhitelistEntry[];
  stream_url?: string;
  winning_address?: string;
  winning_txn?: string;
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
