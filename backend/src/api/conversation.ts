import express, { Request, Response } from "express";
import verify from "./verify.ts";
import DatabaseService from "../services/db/index.ts";
const router = express.Router();

router.get("/", verify, async (req: Request, res: Response) => {
  const address = req.user?.address;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = parseInt(req.query.skip as string) || 0;

  try {
    const conversations = await DatabaseService.getUserConversations(
      address,
      skip,
      limit
    );
    res.send(conversations);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.get(
  "/tournament/:tournament",
  verify,
  async (req: Request, res: Response) => {
    const address = req.user?.address;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = parseInt(req.query.skip as string) || 0;

    try {
      const conversations = await DatabaseService.getChallengeConversations(
        address,
        req.params.tournament,
        skip,
        limit
      );
      res.send(conversations);
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
);

export { router as conversationsAPI };
