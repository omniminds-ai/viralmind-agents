import express, { Request, Response } from "express";
import DatabaseService, { RaceSessionDocument } from "../services/db/index.ts";
import { GymVPSService } from "../services/gym-vps/index.ts";
import { getEpisode } from "./socket.ts";

const router = express.Router();

type RaceCategory = "creative" | "mouse" | "slacker" | "gaming" | "wildcard";
type RaceSessionInput = Omit<RaceSessionDocument, "_id"> & {
  category: RaceCategory;
};

const vpsService = new GymVPSService();

// List all available races
router.get("/", async (_req: Request, res: Response) => {
  try {
    const races = await DatabaseService.getRaces();
    if (!races) {
      res.status(404).json({ error: "No races found" });
      return;
    }
    res.json(races);
  } catch (error) {
    console.error("Error fetching races:", error);
    res.status(500).json({ error: "Failed to fetch races" });
  }
});

// Start a new race session
router.post("/:id/start", async (req: Request, res: Response) => {
  try {
    console.log("starting a new race!");

    const { id } = req.params;
    const { address } = req.body;

    // if (!address) {
    //   res.status(400).json({ error: "Address is required" });
    //   return;
    // }

    // Get the race details
    const race = await DatabaseService.getRaceById(id);
    if (!race) {
      res.status(404).json({ error: "Race not found" });
      return;
    }

    // Get an open vps instance
    console.log("Joining a Race");
    const vps = await vpsService.assignOpenInstance(address);

    // Create a new race session
    const now = new Date();
    const sessionData: RaceSessionInput = {
      address,
      challenge: id,
      prompt: race.prompt,
      status: "active",
      vm_ip: process.env.VNC_HOST_GYMTEST || vps.ip,
      vm_port: 5900,
      vm_password: process.env.VNC_PASS_GYMTEST || vps.vnc.password,
      vm_credentials: vps.login,
      created_at: now,
      updated_at: now,
      category: "creative" as RaceCategory,
    };

    const session = await DatabaseService.createRaceSession(sessionData);

    if (!session) {
      res.status(500).json({ error: "Failed to create race session" });
      return;
    }

    res.json({
      sessionId: (session as any)._id,
      vm_ip: session.vm_ip,
      vm_port: session.vm_port,
      vm_password: session.vm_password,
      vm_credentials: session.vm_credentials,
    });
  } catch (error) {
    console.error("Error starting race:", error);
    res.status(500).json({ error: "Failed to start race" });
  }
});

// Get race session status
router.get("/session/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await DatabaseService.getRaceSession(id);

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({
      status: session.status,
      vm_ip: session.vm_ip,
      vm_port: session.vm_port,
      vm_password: session.vm_password,
      vm_credentials: session.vm_credentials,
      created_at: session.created_at,
      updated_at: session.updated_at,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// Stop a race session
router.post("/session/:id/stop", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // End the episode if it exists
    const episode = getEpisode(id);
    if (episode) {
      await episode.close();
      console.log(`Episode for session ${id} closed`);
    }

    const session = await DatabaseService.updateRaceSession(id, {
      status: "expired",
      updated_at: new Date(),
    });

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error stopping session:", error);
    res.status(500).json({ error: "Failed to stop session" });
  }
});

// Update race session status
router.put("/session/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "completed", "expired"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const session = await DatabaseService.updateRaceSession(id, { status });
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Failed to update session" });
  }
});

// Submit feedback/race idea
router.post("/feedback", async (req: Request, res: Response) => {
  try {
    const { raceIdea } = req.body;

    if (!raceIdea || typeof raceIdea !== "string") {
      res.status(400).json({ error: "Race idea is required" });
      return;
    }

    // Forward to webhook if configured
    const webhookUrl = process.env.FEEDBACK_WEBHOOK;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `New Race Idea Submission:\n${raceIdea}`,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    res.json({ success: true, message: "Feedback received" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

export { router as racesRoute };
