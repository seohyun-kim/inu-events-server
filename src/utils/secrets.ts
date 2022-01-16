import dotenv from "dotenv";

export const PORT = (process.env.PORT || 3000) as number;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

export const COOKIE_KEY = process.env.COOKIE_KEY as string;