declare namespace NodeJS {
  interface ProcessEnv {
    RPC_URL?: string;
    ANCHOR_PROVIDER_URL?: string;
    VIRAL_TOKEN?: string;
    GYM_TREASURY_WALLET?: string;
    OPENAI_API_KEY?: string;
    ANTROPIC_API_KEY?: string;
    DB_URI?: string;
    VNC_PORT?: string;
    IPC_SECRET?: string;
    FEEDBACK_WEBHOOK?: string;
    GYM_TREASURY_WEBHOOK?: string;
    AWS_ACCESS_KEY?: string;
    AWS_SECRET_KEY?: string;
  }
}
