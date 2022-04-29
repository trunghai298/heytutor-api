import jwt from "jsonwebtoken";

export const JWT_SECRET: string = process.env.JWT_SECRET || "heytutor";

export const sign = (payload: any, opts: any = {}) => {
  const options = {
    ...opts,
  };

  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, options, (err, res) =>
      err ? reject(err) : resolve(res)
    );
  });
};
