import dotenv from 'dotenv';
dotenv.config();

export const APP_PORT = Number(process.env.APP_PORT) ?? 3000;
export const APP_HOST = process.env.APP_HOST ?? 'localhost';
export const APP_DATABASE_PATH = process.env.APP_DATABASE_PATH ?? './sws.sqlite3';
export const APP_REDIS_CLIENT_URL =  process.env.APP_REDIS_CLIENT_URL ?? 'redis://localhost:6379';
