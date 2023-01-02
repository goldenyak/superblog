import { User } from "../api/public/users/schemas/user.schema";


declare global {
  declare namespace Express {
    export interface Request {
      user: User | null
    }
  }
}