import { Router } from "express";
import { Server, Socket } from "socket.io";
// @ts-ignore
import VncClient from "vnc-rfb-client";
import { GymVPSService } from "../services/gym-vps/index.ts";
import { ChildProcess, spawn } from "child_process";
import sharp from "sharp";
import { executeComputerAction } from "../services/vnc/actions.ts";
import OpenAI from "openai";
import { Http2Server } from "http2";
import { Server as HttpServer } from "http";
import DatabaseService, { RaceSessionDocument } from "../services/db/index.ts";
import path from "path";
import { Keypair } from "@solana/web3.js";
import { readFileSync } from "fs";
import BlockchainService from "../services/blockchain/index.ts";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const solanaRpc = process.env.RPC_URL!;
const viralToken = process.env.VIRAL_TOKEN!;
const treasuryWalletPath = process.env.GYM_TREASURY_WALLET!;

// Initialize blockchain service
const blockchainService = new BlockchainService(solanaRpc, "");

// Load treasury wallet
const treasuryKeypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(readFileSync(treasuryWalletPath, "utf-8")))
);

async function generateQuest(
  imageBase64: string,
  prompt: string,
  session: RaceSessionDocument
) {
  try {
    // Get treasury balance
    const treasuryBalance = await blockchainService.getTokenBalance(
      viralToken,
      treasuryKeypair.publicKey.toString()
    );

    // Calculate max reward
    const rng = Math.random();
    const maxReward = Math.ceil(
      Math.min(
        1 / rng,
        treasuryBalance / 128 // for now, we'll just divide total treasury by 128 to ensure sustainable rewards, and only fill up the treasury *AS NEEDED*
        // session.reward / Math.max(1, (session.desiredTasks || 500) - (session.completedTasks || 0))
      )
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an AI assistant that needs to propose a new Ubuntu desktop quest based on the theme: "${prompt}". 
              
First, analyze the current screen state to understand what task the user has already completed. Then, propose a DIFFERENT task that fits the same theme but isn't repetitive.

For example, if the theme is "Draw cartoon characters in jspaint" and they drew a jellyfish, propose drawing a completely different character - not another jellyfish or a variation of it.

Return as JSON with these keys:
- reasoning: Analyze what's on screen and explain why you're choosing a different task within the same theme
- quest: The new specific task to complete (should match the theme but be distinct from what's visible)
- hint: Helpful tip for completing the new task`,
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 250,
    });

    const jsonMatch = response.choices[0].message.content?.match(/{[\s\S]*}/);
    if (jsonMatch && jsonMatch[0]) {
      const questData = JSON.parse(jsonMatch[0]);
      return {
        ...questData,
        maxReward,
      };
    }

    throw new Error("No valid JSON found in response");
  } catch (error) {
    console.error("Error generating quest:", error);

    return {
      reasoning:
        "Failed to analyze screen, providing a generic task within theme",
      quest: "Open the Activities overview and launch a relevant application",
      hint: "Press the Super (Windows) key or click Activities in the top-left corner",
      maxReward: 0,
    };
  }
}

async function generateHint(
  imageBase64: string,
  currentQuest: string,
  socket: Socket,
  prompt: string,
  session: RaceSessionDocument,
  maxReward: number,
  hintHistory: string[] = []
) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Current quest: ${currentQuest}
Previous hints: ${hintHistory.slice(-3).join(", ")}

First, analyze if the core task has been completed. Focus only on the main objectives - ignore artistic style, specific colors, or minor visual details. For drawing tasks, consider them complete if the basic shape/object is recognizable.

Then provide a single actionable hint (if needed) that includes one of these patterns if applicable:
- Type 'x[TAB]' to autocomplete
- Scroll in [area] to find [target]
- Click the [specific element]
- Move cursor to [exact location]

Output as JSON with three fields:
1. "reasoning": Your analysis of what's been accomplished vs core requirements (ignore artistic details)
2. "isCompleted": Boolean based on basic task completion
3. "hint": A single sentence hint if not completed

Example format:
{
  "reasoning": "Basic planet circle is drawn and has some kind of ring shape around it. While colors aren't perfect, the core task of drawing a ringed planet is done.",
  "isCompleted": true,
  "hint": ""
}

Or if incomplete:
{
  "reasoning": "Window is open but no drawing started yet. Core task requires a basic planet shape and rings.",
  "isCompleted": false,
  "hint": "Click and drag to draw a circle for the planet body"
}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 250,
      stream: true,
    });

    let fullResponse = "";
    let partialHint = "";
    const hintRegex = /"hint":\s*"([^"]*)/;

    for await (const chunk of response) {
      if (chunk.choices[0]?.delta?.content) {
        fullResponse += chunk.choices[0]?.delta?.content;

        // Try to extract hint from partial JSON
        const hintMatch = fullResponse.match(hintRegex);
        if (hintMatch && hintMatch[1]) {
          const newHint = hintMatch[1];
          if (newHint !== partialHint) {
            partialHint = newHint;
            socket.emit("hint_update", { hint: partialHint });
          }
        }
      }
    }

    // Parse the JSON response
    const jsonMatch = fullResponse.match(/{[\s\S]*}/);
    let parsedResponse = { hint: "", reasoning: "", isCompleted: false };
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Error parsing JSON from response:", e);
      }
    }

    console.log(parsedResponse);

    // Emit final hint and reasoning as training events
    const hintEvent = {
      type: "hint",
      message: parsedResponse.hint || "(empty)",
      session: socket.handshake.query.sessionId,
      frame: 0,
      timestamp: Date.now(),
    };

    socket.emit("training_event", hintEvent);
    await DatabaseService.createTrainingEvent(hintEvent);

    const reasoningEvent = {
      type: "reasoning",
      message: parsedResponse.reasoning || "(empty)",
      session: socket.handshake.query.sessionId,
      frame: 0,
      timestamp: Date.now(),
    };
    socket.emit("training_event", reasoningEvent);
    await DatabaseService.createTrainingEvent(reasoningEvent);

    // If quest is completed, calculate reward and generate new quest
    if (parsedResponse.isCompleted) {
      // Calculate actual reward
      // TODO: this value needs to come from a judge model, which will be developed using the first batch of incoming data
      const score = Math.random();
      const actualReward = Math.ceil(maxReward * score);

      console.log(session);

      // Transfer reward from treasury
      const signature = await blockchainService.transferToken(
        viralToken,
        actualReward,
        treasuryKeypair,
        session.address
      );

      // Emit reward event
      const rewardEvent = {
        type: "reward",
        message: `The judge rewarded you ${actualReward.toFixed(
          2
        )} $VIRAL for this (${(score * 100).toFixed(0)}% of ${maxReward.toFixed(
          2
        )})${signature ? `\nTransaction: ${signature}` : ""}`,
        session: socket.handshake.query.sessionId,
        frame: 0,
        timestamp: Date.now(),
        metadata: {
          scoreValue: score,
          rewardValue: actualReward,
          transaction: signature,
        },
      };
      socket.emit("training_event", rewardEvent);
      await DatabaseService.createTrainingEvent(rewardEvent);

      // Generate new quest
      const questData = await generateQuest(imageBase64, prompt, session);
      const questEvent = {
        type: "quest",
        message: questData.quest,
        session: socket.handshake.query.sessionId,
        frame: 0,
        timestamp: Date.now(),
        metadata: {
          maxReward: questData.maxReward,
        },
      };

      socket.emit("training_event", questEvent);
      await DatabaseService.createTrainingEvent(questEvent);

      socket.emit("quest_update", {
        quest: questData.quest,
        hint: questData.hint,
        maxReward: questData.maxReward,
      });

      return {
        hint: parsedResponse.hint,
        reasoning: parsedResponse.reasoning,
        isCompleted: true,
        newQuest: questData.quest,
        maxReward: questData.maxReward,
      };
    }

    return {
      hint: parsedResponse.hint,
      reasoning: parsedResponse.reasoning,
      isCompleted: false,
    };
  } catch (error) {
    console.error("Error generating hint:", error);
    const fallbackHint =
      "Scroll in the environments list to explore available tasks";
    socket.emit("hint_update", { hint: fallbackHint });
    return {
      hint: fallbackHint,
      reasoning: "Error occurred during analysis",
      isCompleted: false,
    };
  }
}

class Episode {
  prompt: string;
  socket: Socket;
  fps: number;
  frameInterval: number;
  client: VncClient | null;
  ffmpeg: ChildProcess | null;
  recordingTimer: NodeJS.Timeout | null;
  frameTimer: NodeJS.Timeout | null;
  isReplayingTrajectory: boolean;
  currentQuest: string | null;
  isGeneratingHint: boolean;
  startTime: number | undefined;
  frameCount: number;
  hintHistory: string[];
  currentMaxReward: number;
  session: RaceSessionDocument;
  expiryTimer: NodeJS.Timeout | null;

  constructor(
    prompt: string,
    socket: Socket,
    session: RaceSessionDocument,
    options: { fps?: number; frameInterval?: number } = {}
  ) {
    this.prompt = prompt;
    this.socket = socket;
    this.session = session;
    this.fps = options.fps || 10;
    this.frameInterval = options.frameInterval || 1000; // 1 second for sending frames to client
    this.client = null;
    this.ffmpeg = null;
    this.recordingTimer = null;
    this.frameTimer = null;
    this.isReplayingTrajectory = false;
    this.currentQuest = null;
    this.isGeneratingHint = false;
    this.frameCount = 0;
    this.hintHistory = [];
    this.currentMaxReward = 0;
    this.expiryTimer = null;
  }

  resetExpiryTimer() {
    // Clear existing timer if any
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
    }

    // Set new 5 minute expiry timer
    this.expiryTimer = setTimeout(async () => {
      console.log("Episode expired due to time limit");

      // Emit expiry event
      const expiryEvent = {
        type: "system",
        message: "Session expired due to 5 minute limit",
        session: this.socket.handshake.query.sessionId,
        frame: this.frameCount,
        timestamp: Date.now(),
      };
      this.socket.emit("training_event", expiryEvent);
      await DatabaseService.createTrainingEvent(expiryEvent);

      // Close episode
      this.close();

      // Update session status
      const sessionId = this.socket.handshake.query.sessionId as string;
      if (sessionId) {
        try {
          await DatabaseService.updateRaceSession(sessionId, {
            status: "expired",
            updated_at: new Date(),
          });
          console.log(`Race session ${sessionId} marked as expired`);
          activeEpisodes.delete(sessionId);
        } catch (error) {
          console.error("Error ending expired race session:", error);
        }
      }

      // Disconnect socket
      this.socket.disconnect();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
  }

  async connect(host = "127.0.0.1", port = 5900, password = "abc123") {
    const initialEvents = [
      {
        type: "task",
        message:
          "Neural Link established. You are now part of VM-1's collective intelligence network.",
      },
      {
        type: "task",
        message:
          "As part of the swarm, your interactions teach fundamental patterns of computer control.",
      },
      {
        type: "task",
        message:
          "At scale, simple demonstrations combine into sophisticated patterns, emerging minds that navigate digital worlds with purpose and precision.",
      },
    ];

    // Emit and store initial events
    for (const event of initialEvents) {
      const eventData = {
        ...event,
        session: this.socket.handshake.query.sessionId,
        frame: 0,
        timestamp: Date.now(),
      };
      this.socket.emit("training_event", eventData);
      await DatabaseService.createTrainingEvent(eventData);
    }

    this.client = new VncClient({
      fps: this.fps,
      debug: false,
      debugLevel: 1,
      encodings: [
        VncClient.consts.encodings.copyRect,
        VncClient.consts.encodings.zrle,
        VncClient.consts.encodings.hextile,
        VncClient.consts.encodings.raw,
        VncClient.consts.encodings.pseudoDesktopSize,
      ],
    });

    this.client.connect({ host, port, password });

    this.client.on("firstFrameUpdate", async () => {
      console.log("VNC Session started, beginning recording...");
      const sessionId = this.socket.handshake.query.sessionId as string;
      this.socket.emit("recording_started", { sessionId });

      const eventData = {
        type: "system",
        message: "VNC connection established. Starting session recording.",
        session: sessionId,
        frame: 0,
        timestamp: Date.now(),
      };
      this.socket.emit("training_event", eventData);
      await DatabaseService.createTrainingEvent(eventData);

      // Get first frame and generate quest
      const fb = this.client.getFb();
      const { clientWidth, clientHeight } = this.client;
      const jpeg = await sharp(fb, {
        raw: {
          width: clientWidth,
          height: clientHeight,
          channels: 4,
        },
      })
        .jpeg()
        .toBuffer();

      // no quest yet, lets create one
      const questData = await generateQuest(
        jpeg.toString("base64"),
        this.prompt,
        this.session
      );
      this.currentQuest = questData.quest;
      this.currentMaxReward = questData.maxReward;

      // Reset expiry timer when new quest is set
      this.resetExpiryTimer();

      // Emit and store quest event
      const questEvent = {
        type: "quest",
        message: questData.quest,
        session: sessionId,
        frame: 0,
        timestamp: Date.now(),
        metadata: {
          maxReward: questData.maxReward,
        },
      };
      this.socket.emit("training_event", questEvent);
      await DatabaseService.createTrainingEvent(questEvent);

      // Emit and store hint event
      const hintEvent = {
        type: "hint",
        message: questData.hint,
        session: sessionId,
        frame: 0,
        timestamp: Date.now(),
      };
      this.socket.emit("training_event", hintEvent);
      await DatabaseService.createTrainingEvent(hintEvent);

      // Also emit quest_update for overlay
      this.socket.emit("quest_update", {
        quest: questData.quest,
        hint: questData.hint,
        maxReward: questData.maxReward,
      });

      this.startRecording();
      this.startFrameSending();
    });

    this.client.on("disconnect", () => {
      console.log("VNC session disconnected.");
      this.close();
    });
  }

  startRecording() {
    const { clientWidth, clientHeight } = this.client;
    const sessionId = this.socket.handshake.query.sessionId as string;
    const videoPath = path.resolve(
      process.cwd(),
      `public/recordings/${sessionId}.mp4`
    );

    // Update session with video path
    DatabaseService.updateRaceSession(sessionId, {
      video_path: videoPath,
    });

    const ffmpegArgs = [
      "-loglevel",
      "error",
      "-hide_banner",
      "-y",
      "-f",
      "rawvideo",
      "-vcodec",
      "rawvideo",
      "-an",
      "-pix_fmt",
      "rgba",
      "-s",
      `${clientWidth}x${clientHeight}`,
      "-r",
      `${this.fps}`,
      "-i",
      "-",
      "-an",
      "-r",
      `${this.fps}`,
      "-vcodec",
      "libx264rgb",
      videoPath,
    ];

    // Debug log the full command
    console.log(
      "Starting ffmpeg with command:",
      "ffmpeg",
      ffmpegArgs.join(" ")
    );

    this.ffmpeg = spawn("ffmpeg", ffmpegArgs);

    this.ffmpeg.on("error", (err) => {
      console.error("FFmpeg process error:", err);
    });

    this.ffmpeg?.stdin?.on("error", (err) => {
      console.error("FFmpeg stdin error:", err);
    });

    this.ffmpeg?.stdout?.on("error", (err) => {
      console.error("FFmpeg stdout error:", err);
    });

    // Log any ffmpeg errors
    this.ffmpeg.stderr?.on("data", (data) => {
      console.error("FFmpeg error:", data.toString());
    });

    this.recordFrame();
  }

  recordFrame() {
    this.recordingTimer = setTimeout(() => {
      if (this.ffmpeg?.stdin?.writable) {
        const writeResult = this.ffmpeg.stdin.write(this.client.getFb());
        if (!writeResult) {
          // Handle backpressure
          this.ffmpeg.stdin.once("drain", () => this.recordFrame());
          return;
        }
      }
      this.frameCount++;
      this.recordFrame();
    }, 1000 / this.fps);
  }

  async startFrameSending() {
    this.frameTimer = setInterval(async () => {
      try {
        const fb = this.client.getFb();
        const { clientWidth, clientHeight } = this.client;

        const jpeg = await sharp(fb, {
          raw: {
            width: clientWidth,
            height: clientHeight,
            channels: 4,
          },
        })
          .jpeg()
          .toBuffer();

        this.socket.emit("frame", {
          buffer: jpeg.toString("base64"),
          width: clientWidth,
          height: clientHeight,
          frame: this.frameCount,
        });
      } catch (err) {
        console.error("Error sending frame:", err);
      }
    }, this.frameInterval);
  }

  async close() {
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
    }
    if (this.frameTimer) {
      clearInterval(this.frameTimer);
    }
    if (this.ffmpeg?.stdin) {
      this.ffmpeg.stdin.end(); // End the stream properly
      await new Promise((resolve) =>
        this.ffmpeg?.stdin?.once("finish", resolve)
      );
    }
    if (this.ffmpeg) {
      this.ffmpeg.kill("SIGINT");
    }
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
    if (this.client) {
      this.client.disconnect();
    }

    // NOTE: in the future, we should be grabbing the ip and private keys from the database based upon the user's region
    const vpsService = new GymVPSService({
      ip: process.env.GYM_VPS_IP!,
      username: "ubuntu", // default sudo user
      privateKey: process.env.GYM_VPS_PRIVATE_KEY!,
    });

    // remove the trainer from the vps
    await vpsService.removeTrainer(this.session.vm_credentials?.username!);

    // Log disconnection event
    const sessionId = this.socket.handshake.query.sessionId;
    if (sessionId) {
      const eventData = {
        type: "system",
        message: "Disconnected from VNC server",
        session: sessionId,
        frame: 0,
        timestamp: Date.now(),
      };
      await DatabaseService.createTrainingEvent(eventData);
    }
  }
}

// Track active episodes
const activeEpisodes = new Map<string, Episode>();

export function getEpisode(sessionId: string): Episode | undefined {
  return activeEpisodes.get(sessionId);
}

export function initializeSocketIO(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("Socket.io connected");

    const { sessionId } = socket.handshake.query;
    if (!sessionId) {
      console.error("No session ID provided");
      socket.disconnect();
      return;
    }

    // Get session details from database
    const session = await DatabaseService.getRaceSession(sessionId as string);
    if (!session) {
      console.error("Session not found");
      socket.disconnect();
      return;
    }

    const episode = new Episode(session.prompt, socket, session);
    activeEpisodes.set(sessionId as string, episode);
    episode.connect(session.vm_ip, session.vm_port, session.vm_password);

    socket.on("disconnect", async () => {
      console.log("Socket.io disconnected");
      episode.close();

      // End the race session
      const sessionId = socket.handshake.query.sessionId as string;
      if (sessionId) {
        try {
          await DatabaseService.updateRaceSession(sessionId, {
            status: "expired",
            updated_at: new Date(),
          });
          console.log(`Race session ${sessionId} marked as expired`);
          activeEpisodes.delete(sessionId);
        } catch (error) {
          console.error("Error ending race session:", error);
        }
      }
    });

    socket.on("request_hint", async () => {
      if (episode.isGeneratingHint) {
        console.log("Hint generation already in progress");
        return;
      }

      try {
        episode.isGeneratingHint = true;
        const fb = episode.client.getFb();
        const { clientWidth, clientHeight } = episode.client;

        const jpeg = await sharp(fb, {
          raw: {
            width: clientWidth,
            height: clientHeight,
            channels: 4,
          },
        })
          .jpeg()
          .toBuffer();

        const result = await generateHint(
          jpeg.toString("base64"),
          episode.currentQuest || "",
          socket,
          episode.prompt,
          episode.session,
          episode.currentMaxReward,
          episode.hintHistory
        );

        // Add new hint to history
        episode.hintHistory.push(result.hint);

        // If quest is completed, update current quest and reset hint history
        if (result.isCompleted && result.newQuest) {
          episode.currentQuest = result.newQuest;
          episode.currentMaxReward = result.maxReward;
          episode.hintHistory = [];
          // Reset expiry timer when new quest is set after completion
          episode.resetExpiryTimer();
        }
      } catch (error) {
        console.error("Error generating hint:", error);
        socket.emit("hint_update", {
          hint: "Try exploring the visible interface elements",
        });
      } finally {
        episode.isGeneratingHint = false;
      }
    });

    socket.on("vnc_keypress", async (data) => {
      console.log(data);

      try {
        const result = await executeComputerAction(
          "key",
          { text: data.key },
          episode.client
        );

        const eventData = {
          type: "keyboard",
          message: `Key pressed: ${data.key}`,
          result,
          session: sessionId,
          frame: data.frame,
          timestamp: Date.now(),
        };

        socket.emit("training_event", eventData);
        await DatabaseService.createTrainingEvent(eventData);
      } catch (error) {
        console.error("Error handling keypress:", error);
        const errorEvent = {
          type: "error",
          message: `Failed to process key: ${data.key}`,
          session: sessionId,
          frame: data.frame,
          timestamp: Date.now(),
        };
        socket.emit("training_event", errorEvent);
        await DatabaseService.createTrainingEvent(errorEvent);
      }
    });

    socket.on("vnc_mouse", async (data) => {
      try {
        let result;
        let eventMessage;
        let eventData: {
          type: string;
          coordinates: { x: number; y: number } | undefined;
          trajectory: any;
          session: string;
          frame: number;
          timestamp: number;
          message?: string;
        } = {
          type: "mouse",
          coordinates: undefined,
          trajectory: undefined,
          session: sessionId as string,
          frame: data.frame,
          timestamp: Date.now(),
        };

        if (episode.isReplayingTrajectory) return;

        if (data.action?.endsWith("_drag")) {
          // console.log('started trajectory');
          episode.isReplayingTrajectory = true;
          result = await executeComputerAction(
            data.action,
            {
              trajectory: data.trajectory,
            },
            episode.client
          );
          episode.isReplayingTrajectory = false;
          // console.log('stoppped trajectory');

          eventMessage = `Mouse ${data.action.replace("_", " ")}`;
          eventData.trajectory = data.trajectory;
        } else if (
          data.action === "scroll_up" ||
          data.action === "scroll_down"
        ) {
          result = await executeComputerAction(data.action, {}, episode.client);
          eventMessage = `Mouse ${data.action.replace("_", " ")}`;
        } else {
          if (data.button === 1) {
            result = await executeComputerAction(
              "left_click",
              {},
              episode.client
            );
            eventMessage = "Left click";
          } else if (data.button === 2) {
            result = await executeComputerAction(
              "right_click",
              {},
              episode.client
            );
            eventMessage = "Right click";
          } else if (data.button === 3) {
            result = await executeComputerAction(
              "middle_click",
              {},
              episode.client
            );
            eventMessage = "Middle click";
          } else {
            result = await executeComputerAction(
              "mouse_move",
              {
                coordinate: [data.x, data.y],
              },
              episode.client
            );
            return; // Don't emit events for mouse moves
          }

          if (data.x !== undefined && data.y !== undefined) {
            eventData.coordinates = { x: data.x, y: data.y };
          }
        }

        eventData.message = eventMessage;
        socket.emit("training_event", eventData);
        await DatabaseService.createTrainingEvent(eventData);
      } catch (error) {
        console.error("Error handling mouse event:", error);
        const errorEvent = {
          type: "error",
          message: `Failed to process mouse event: ${(error as Error).message}`,
          session: sessionId,
          frame: data.frame,
          timestamp: Date.now(),
        };
        socket.emit("training_event", errorEvent);
        await DatabaseService.createTrainingEvent(errorEvent);
      }
    });
  });

  return io;
}
