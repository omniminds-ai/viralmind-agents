import express from "express";
import { Challenge, Chat } from "../models/Models.js";
import BlockchainService from "../services/blockchain/index.js";
import dotenv from "dotenv";
import DatabaseService from "../services/db/index.js";
import getSolPriceInUSDT from "../hooks/solPrice.js";
import VNCService from "../services/vnc/index.js";
import fs from 'fs';
import path from 'path';

dotenv.config();

const router = express.Router();
const solanaRpc = process.env.RPC_URL;
const model = "gpt-4o-mini";

// Time threshold for screenshot updates (5 seconds)
const SCREENSHOT_UPDATE_THRESHOLD = 5000;

router.get("/get-challenge", async (req, res) => {
  try {
    const name = req.query.name;
    const initial = req.query.initial;
    let message_price = Number(req.query.price);
    let prize = message_price * 100;

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
      win_condition: 1
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
    const challengeId = challenge._id;
    const chatLimit = challenge.chatLimit;

    if (!challenge) {
      return res.status(404).send("Challenge not found");
    }

    const allowedStatuses = ["active", "concluded", "upcoming"];

    if (!allowedStatuses.includes(challenge.status)) {
      return res.status(404).send("Challenge is not active");
    }

    const programId = challenge.idl?.address;
    if (!programId) return res.write("Program ID not found");

    const tournamentPDA = challenge.tournamentPDA;
    if (!tournamentPDA) return res.write("Tournament PDA not found");

    const break_attempts = await DatabaseService.getChatCount({
      challenge: challengeName,
      role: "user",
    });

    const chatProjection = {
      challenge: 1,
      role: 1,
      content: 1,
      address: 1,
      txn: 1,
      date: 1,
      screenshot: 1
    };

    if (!challenge.tools_description) {
      chatProjection.tool_calls = 1;
    }

    const chatHistory = await DatabaseService.getFullChatHistory(
      {
        challenge: challengeName,
        role: { $ne: "system" },
      },
      chatProjection,
      { date: -1 },
      chatLimit
    );

    const now = new Date();
    const expiry = challenge.expiry;
    const solPrice = await getSolPriceInUSDT();

    let latestScreenshot = null;

    // Only attempt VNC screenshots for active tournaments
    if (challenge.status === "active") {
      const latestImagePath = path.join(process.cwd(), 'public', 'screenshots', `${tournamentPDA}_latest.jpg`);
      
      // Check if we need a new screenshot
      const needsNewScreenshot = !fs.existsSync(latestImagePath) || 
        (fs.existsSync(latestImagePath) && now - fs.statSync(latestImagePath).mtime > SCREENSHOT_UPDATE_THRESHOLD);

      if (needsNewScreenshot) {
        try {
          // Initialize VNC session and get screenshot
          const session = await VNCService.ensureValidConnection(tournamentPDA);
          if (session) {
            const newScreenshot = await VNCService.getScreenshot(tournamentPDA);
            if (newScreenshot) {
              latestScreenshot = {
                url: `/api/screenshots/${tournamentPDA}_latest.jpg?t=${newScreenshot.timestamp}`,
                date: new Date(newScreenshot.timestamp)
              };
            }
          }
        } catch (error) {
          console.error("Failed to update screenshot:", error);
        }

        // If VNC failed or no new screenshot, try using existing _latest.jpg
        if (!latestScreenshot && fs.existsSync(latestImagePath)) {
          const stats = fs.statSync(latestImagePath);
          latestScreenshot = {
            url: `/api/screenshots/${tournamentPDA}_latest.jpg?t=${stats.mtimeMs}`,
            date: stats.mtime
          };
        }
      } else {
        // Use existing _latest.jpg if it's fresh enough
        const stats = fs.statSync(latestImagePath);
        latestScreenshot = {
          url: `/api/screenshots/${tournamentPDA}_latest.jpg?t=${stats.mtimeMs}`,
          date: stats.mtime
        };
      }
    }

    // Fall back to chat history screenshots if needed
    if (!latestScreenshot && chatHistory.length > 0) {
      const screenshotMessages = chatHistory.filter(msg => msg.screenshot?.url);
      if (screenshotMessages.length > 0) {
        const lastScreenshot = screenshotMessages[0]; // First since sorted by date desc
        latestScreenshot = {
          url: lastScreenshot.screenshot.url,
          date: lastScreenshot.date
        };
      }
    }

    if (chatHistory.length > 0) {
      if (expiry < now && challenge.status === "active") {
        const lastSender = chatHistory[0].address;
        const blockchainService = new BlockchainService(solanaRpc, programId);
        const concluded = await blockchainService.concludeTournament(
          tournamentPDA,
          lastSender
        );
        const successMessage = `🥳 Tournament concluded: ${concluded}`;
        const assistantMessage = {
          challenge: challengeName,
          model: model,
          role: "assistant",
          content: successMessage,
          tool_calls: {},
          address: lastSender,
        };

        await DatabaseService.createChat(assistantMessage);
        await DatabaseService.updateChallenge(challengeId, {
          status: "concluded",
        });
      }

      message_price = challenge.entryFee;
      prize = message_price * 100;

      const usdMessagePrice = message_price * solPrice;
      const usdPrize = prize * solPrice;
      return res.status(200).json({
        challenge,
        break_attempts,
        message_price,
        prize,
        usdMessagePrice,
        usdPrize,
        expiry,
        solPrice,
        chatHistory: chatHistory.reverse(),
        latestScreenshot
      });
    }

    if (!challengeInitialized) {
      const firstPrompt = challenge.system_message;
      await DatabaseService.createChat({
        challenge: challengeName,
        model: model,
        role: "system",
        content: firstPrompt,
        address: challenge.tournamentPDA,
      });
    }

    if (initial) {
      const blockchainService = new BlockchainService(solanaRpc, programId);
      const tournamentData = await blockchainService.getTournamentData(
        tournamentPDA
      );

      message_price = tournamentData.entryFee;
      prize = message_price * 100;
    }

    const usdMessagePrice = message_price * solPrice;
    const usdPrize = prize * solPrice;

    return res.status(200).json({
      challenge,
      break_attempts,
      message_price,
      prize,
      usdMessagePrice,
      usdPrize,
      chatHistory,
      expiry,
      solPrice,
      latestScreenshot
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send(err);
  }
});

export { router as challengesRoute };
