import type { tokenType } from "./model_type.ts";

declare global {
  namespace Express {
    interface Request {
      user?: tokenType;
    }
  }
}
