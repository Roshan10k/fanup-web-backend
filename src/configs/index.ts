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

export const JWT_SECRET: string =
  process.env.JWT_SECRET || (() => {
    throw new Error("JWT_SECRET is not defined");
  })();


export const CLIENT_URL: string =
process.env.CLIENT_URL || 'http://localhost:3000';

export const CORS_ORIGINS: string[] = (process.env.CORS_ORIGINS || CLIENT_URL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
   
export const EMAIL_USER: string =
    process.env.EMAIL_USER || 'meroemail.com'

export const EMAIL_PASS: string =
    process.env.EMAIL_PASS || 'password';

export const FCM_SERVER_KEY: string = process.env.FCM_SERVER_KEY || "";
