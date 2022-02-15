import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { Response, NextFunction } from "express";
import MySQLClient from "../clients/mysql";
import { uuid } from "uuidv4";
import User from "../models/user";

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "395446492480-n5g1o0qb93ibrulml67jhfa16r2bh9nc.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "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";

var GoogleStrategy = require("passport-google-oauth20").Strategy;

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
      req.ctx = jwtPayload;
      done(null, jwtPayload);
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        console.log("profile", profile);
        try {
          const user = await MySQLClient.transaction(async (transaction) => {
            const user = await User.findOne({
              where: { googleId: profile.id },
              transaction,
            });
            if (!user) {
              return User.create(
                {
                  id: uuid(),
                  isAdmin: 0,
                  userName: profile.displayName,
                  googleId: profile.id,
                  maxTasks: 50,
                },
                { transaction }
              );
            }

            return user;
          });

          return cb(null, user);
        } catch (e) {
          console.log(e);
          return cb(e);
        }
      }
    )
  );

  passport.serializeUser(function (user: any, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  return passport.initialize();
};

export const authenticateJWT =
  () => (req: any, res: Response, next: NextFunction) =>
    passport.authenticate("jwt", { session: false })(req, res, next);

export const authenticateGoogle = () => {
  return (req: any, res: Response, next: NextFunction) =>
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
};
