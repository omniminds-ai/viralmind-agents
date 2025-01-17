import { NextFunction, Request, RequestHandler, Response } from "express";
import { User } from "../models/Models.ts";

const verify: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["api-key"];
  if (!token) {
    res.status(401).send("Bad Auth");
    return;
  }

  if (typeof token != "string") {
    res.status(401).send("Bad Auth");
    return;
  }

  const isUser = await User.findOne({ api_key: token });
  if (!isUser) {
    res.status(401).send("Invalid API Key");
    return;
  }

  res.locals.user = isUser;
  next();
};

export default verify;
