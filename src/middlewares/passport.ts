import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { Response, NextFunction } from "express";

export const initPassport = () => {
  const opts: any = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.JWT_SECRET || "secret";
  opts.issuer = process.env.JWT_ISSUER;
  opts.audience = process.env.JWT_AUDIENCE;
  opts.passReqToCallback = true;

  passport.use(
    "jwt",
    new Strategy(opts, (req: any, jwtPayload: any, done: any) => {
      // Your logic to fetch the user from the JWT payload
      req.ctx = {
        ...req.ctx,
        ...jwtPayload,
      };
      done(null, jwtPayload);
    })
  );

  return passport.initialize();
};

export const authenticateJWT =
  () => (req: any, res: Response, next: NextFunction) =>
    passport.authenticate("jwt", { session: false })(req, res, next);
