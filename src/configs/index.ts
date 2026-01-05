import dotenv from "dotenv";
dotenv.config();

//Application level constatnt and config
export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : 3001;
//if PORT is not defined in .env, use 5000 as default
export const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/default_db";
//if MONGODB_URI is not defined in .env, use local/backup mongodb as default

export const JWT_SECRET: string = process.env.JWT_SECRET || 'private_key';
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';