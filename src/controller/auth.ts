import * as AuthServices from "../services/auth";
import { Response, NextFunction } from "express";

const anonymous = async (req: any, res: Response, next: NextFunction) => {
  try {
    const jwt = await AuthServices.anonymous(req.ctx);
    res.json({ jwt });
  } catch (e) {
    next(e);
  }
};

const fetch = async (req: any, res: any, next: any) => {
  try {
    res.json(req.ctx.jwt);
  } catch (e) {
    next(e);
  }
};

export default {
  anonymous,
  fetch,
};
