import express from "express";
import dotenv from "dotenv";
import DatabaseService from "../services/db/index.js";
dotenv.config();

const router = express.Router();
export const clients = new Set();

// Modify the event handler to properly format SSE messages
DatabaseService.on("new-chat", async (chatData) => {
  clients.forEach((client) => {
    client.write(
      `data: ${JSON.stringify({ type: "message", message: chatData })}\n\n`
    );
  });
});

router.get("/challenge-chat", async (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE with client

  const name = req.query.name;
  const projection = {
    _id: 1,
    title: 1,
    label: 1,
    task: 1,
    tools_description: 1,
    custom_rules: 1,
    disable: 1,
    start_date: 1,
    charactersPerWord: 1,
    level: 1,
    model: 1,
    image: 1,
    pfp: 1,
    status: 1,
    name: 1,
    deployed: 1,
    idl: 1,
    tournamentPDA: 1,
    entryFee: 1,
    characterLimit: 1,
    contextLimit: 1,
    chatLimit: 1,
    initial_pool_size: 1,
    expiry: 1,
    developer_fee: 1,
    win_condition: 1,
    expiry_logic: 1,
    scores: 1,
    stream_src: 1,
  };

  const challengeInitialized = await DatabaseService.findOneChat({
    challenge: { $regex: name, $options: "i" },
  });

  if (!challengeInitialized) {
    projection.system_message = 1;
  }

  let challenge = await DatabaseService.getChallengeByName(name, projection);
  if (!challenge) {
    return res.status(404).send("Challenge not found");
  }

  const challengeName = challenge.name;

  const allowedStatuses = ["active", "concluded", "upcoming"];
  if (!allowedStatuses.includes(challenge.status)) {
    return res.status(404).send("Challenge is not active");
  }

  console.log("Stream Initialized");

  // Send initial connection message with proper SSE format
  res.write(
    `data: ${JSON.stringify({
      type: "connection",
      message: `Connected to chat stream for ${challengeName}`,
    })}\n\n`
  );

  console.log("Stream set");
  // Add client to the set
  clients.add(res);

  // Remove client on connection close
  req.on("close", () => {
    clients.delete(res);
    console.log("Client disconnected");
  });

  // Handle connection timeout
  req.on("error", (error) => {
    console.error("SSE error:", error);
    clients.delete(res);
  });
});

export { router as streamsRoute };
