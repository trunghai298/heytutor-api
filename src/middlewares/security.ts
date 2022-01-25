import helmet from "helmet";

export const initSecurity = () => {
  const opts = {
    // See https://www.npmjs.com/package/helmet
  };

  return helmet(opts);
};
