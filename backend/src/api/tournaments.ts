import express, { Request, Response } from "express";
import verify from "./verify.ts";
import DatabaseService from "../services/db/index.ts";
const router = express.Router();

// Get all tournaments from the database
router.get("/", verify, async (_req: Request, res: Response) => {
  try {
    const challenges = await DatabaseService.getAllTournaments();
    res.send(challenges);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// Get a tournament by id
router.get("/:id", verify, async (req: Request, res: Response) => {
  try {
    const challenges = await DatabaseService.getTournamentById(req.params.id);
    res.send(challenges);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

// Create a new tournamnent
/*
router.post("/new-tournament", verify, async (req, res) => {
  try {
    const {
      title,
      name,
      description,
      image,
      pfp,
      task,
      label,
      level,
      model,
      system_message,
      characterLimit,
      contextLimit,
      chatLimit,
      tools,
    } = req.body;

    if (!title || !name || !description)
      return res
        .status(400)
        .send("Must include at least title, name, and description");

    const savedChallenge = await DatabaseService.createTournament({
      title,
      name,
      description,
      image,
      pfp,
      task,
      label,
      level,
      model,
      system_message,
      characterLimit,
      contextLimit,
      chatLimit,
      tools,
    });

    res.send(savedChallenge);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});
*/

export { router as tournamentsAPI };
