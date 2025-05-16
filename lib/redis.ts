import { createClient } from "@redis/client";

if (!process.env.REDIS_URL) {
  console.warn("REDIS_URL environment variable is not defined.");
}

const client = process.env.REDIS_URL ? createClient({ url: process.env.REDIS_URL }) : null;

if (client) {
  client.connect();
}

export const redis = client;