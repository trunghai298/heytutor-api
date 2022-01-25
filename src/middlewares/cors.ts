import cors from "cors";

export const initCORS = () => {
  const opts = {
    origin: true,
    // See https://www.npmjs.com/package/cors
  };

  return cors(opts);
};
