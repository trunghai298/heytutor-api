import * as ActivityServices from "../services/activity.service";
import { Response, NextFunction } from "express";

const list = async (req: any, res: Response, next: NextFunction) => {
  try {
    const response = await ActivityServices.list(req.ctx);
    res.json({ response });
  } catch (e) {
    next(e);
  }
};

export default {
  list,
};
