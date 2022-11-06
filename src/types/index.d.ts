import { User } from "../users/schemas/user.schema";


declare global {
  declare namespace Express {
    export interface Request {
      user: User | null
    }
  }
}