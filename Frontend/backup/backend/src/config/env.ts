// Placeholder to ensure directories get committed
// Place constants here that help across your app using process.env
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('5000'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  // Add other env vars here
});

export const env = envSchema.parse(process.env);
