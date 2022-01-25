import morgan from "morgan";
import { LogClient } from "../clients/logger";

export const initLogger = () =>
  // @ts-ignore
  morgan("combined" as any, { stream: LogClient.stream });
