import * as BanServices from "../services/ban.service";
import { Response, NextFunction } from "express";

const list = async (req: any, res: Response, next: NextFunction) => {
  try {
    const response = await BanServices.list(req.ctx);
    res.json({ response });
  } catch (e) {
    next(e);
  }
};

export default {
  list,
};
