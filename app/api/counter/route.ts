import { NextResponse } from 'next/server';
import { createClient } from 'redis';

// Helper to create and connect a Redis client
async function getRedisClient() {
  const client = createClient({
    url: process.env.REDIS_URL
  });
  await client.connect();
  return client;
}

export const GET = async () => {
  const redis = await getRedisClient();
  const count = await redis.get('counter');
  await redis.disconnect();
  return new NextResponse(
    JSON.stringify({ count: count ? parseInt(count, 10) : 0 }),
    { status: 200 }
  );
};

export const POST = async () => {
  const redis = await getRedisClient();
  const count = await redis.incr('counter');
  await redis.disconnect();
  return new NextResponse(
    JSON.stringify({ count }),
    { status: 200 }
  );
};
