// src/types/express.d.ts
import { UserDocument } from '../user/schemas/user.schema';

declare module 'express' {
  interface Request {
    user?: {
      sub: string;  // the user ID from JWT
    };
  }
}
