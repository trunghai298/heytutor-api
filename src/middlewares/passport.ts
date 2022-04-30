import { Strategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { Response, NextFunction } from "express";
import MySQLClient from "../clients/mysql";
import { uuid } from "uuidv4";
import User from "../models/user.model";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
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
        callbackURL: `http://localhost:3001/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, cb) => {
        const profileJson = profile._json;

        if (profileJson.hd !== "fpt.edu.vn") {
          console.log("Access denied");
        }

        try {
          const user = await MySQLClient.transaction(async (transaction) => {
            const user = await User.findOne({
              where: { googleId: profile.id },
              transaction,
            });
            if (!user) {
              return User.create(
                {
                  email: profileJson.email,
                  password: 1,
                  avatar: profileJson.picture,
                  name: profileJson.name,
                  googleId: profileJson.sub,
                  stdId: profileJson.email.split("@")[0],
                  firstTimeLogin: 1,
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
