import mongoose from "mongoose";

export const challengeSchema = new mongoose.Schema(
  {
    _id: String,
    title: String,
    name: String,
    description: String,
    image: String,
    pfp: String,
    task: String,
    label: String,
    level: String,
    status: { type: String, default: "active" },
    model: String,
    system_message: String,
    deployed: Boolean,
    tournamentPDA: String,
    idl: Object,
    entryFee: Number,
    characterLimit: Number,
    charactersPerWord: Number,
    contextLimit: Number,
    chatLimit: Number,
    max_actions: Number,
    expiry: Date,
    initial_pool_size: Number,
    developer_fee: Number,
    tools: Array,
    fee_multiplier: Number,
    winning_message: String,
    phrase: String,
    winning_prize: Number,
    tools_description: String,
    custom_rules: String,
    disable: Array,
    success_function: String,
    fail_function: String,
    tool_choice: String,
    start_date: Date,
    expiry_logic: { type: String, enum: ["score", "time"], default: "time" },
    scores: [
      {
        account: String,
        address: String,
        score: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    game: String,
    game_ip: String,
    stream_src: String,
    whitelist: [
      {
        username: String,
        address: String,
        viral_balance: Number,
        signature: String,
      },
    ],
  },
  { collection: "challenges" }
);

export const Challenge = mongoose.model("Challenge", challengeSchema);

export const chatSchema = new mongoose.Schema(
  {
    challenge: {
      type: String,
      ref: "Challenge",
      required: true,
    },
    model: String,
    role: { type: String, required: true },
    content: { type: String, required: true },
    tool_calls: Object,
    address: { type: String, required: true },
    display_name: { type: String, required: false },
    txn: String,
    verified: Boolean,
    date: { type: Date, default: Date.now, required: false },
    screenshot: {
      type: {
        url: { type: String, required: true },
      },
    },
  },
  { collection: "chats" }
);

export const Chat = mongoose.model("Chat", chatSchema);

const userSchema = new mongoose.Schema(
  {
    api_key: String,
    address: String,
    date_created: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

export const User = mongoose.model("User", userSchema);

const pageSchema = new mongoose.Schema(
  {
    name: String,
    content: Object,
  },
  { collection: "pages" }
);

export const Pages = mongoose.model("Pages", pageSchema);
