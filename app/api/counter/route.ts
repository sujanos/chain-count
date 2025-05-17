import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import { RedisClientType } from '@redis/client';

async function getLeaderboard(redis: RedisClientType) {
  const entries = await redis.zRangeWithScores('counter:leaderboard', 0, 9, { REV: true });
  const leaderboard = [];
  for (const entry of entries) {
    const fid = entry.value;
    const count = Number(entry.score);
    const displayName = await redis.get(`user:${fid}:displayName`);
    const username = await redis.get(`user:${fid}:username`);
    const pfpUrl = await redis.get(`user:${fid}:pfpUrl`);
    leaderboard.push({ fid, count, displayName, username, pfpUrl });
  }
  return leaderboard;
}

export const GET = async (req: NextRequest) => {
  if (!redis) {
    return new NextResponse(JSON.stringify({ error: 'Redis not configured' }), { status: 500 });
  }
  if (!redis.isOpen) await redis.connect();
  const count = await redis.get('counter');
  const lastFid = await redis.get('counter:last_incrementer');
  const lastDisplayName = await redis.get('counter:last_incrementer_displayName');
  const lastUsername = await redis.get('counter:last_incrementer_username');
  const lastTimestamp = await redis.get('counter:last_incrementer_ts');
  const leaderboard = await getLeaderboard(redis);

  const { searchParams } = new URL(req.url);
  const fid = searchParams.get('fid');
  let cooldown = 0;
  if (fid) {
    const lastUserTs = await redis.get(`counter:user:${fid}:last_increment_time`);
    if (lastUserTs) {
      cooldown = Math.max(0, 10 - Math.floor((Date.now() / 1000) - Number(lastUserTs)));
    }
  }

  return new NextResponse(
    JSON.stringify({
      count,
      lastIncrementer: { fid: lastFid, displayName: lastDisplayName, username: lastUsername, timestamp: lastTimestamp },
      leaderboard,
      cooldown,
    }),
    { status: 200 }
  );
};

export const POST = async (req: NextRequest) => {
  if (!redis) {
    return new NextResponse(JSON.stringify({ error: 'Redis not configured' }), { status: 500 });
  }
  if (!redis.isOpen) await redis.connect();
  let error = null;

  let body: { fid?: string; displayName?: string; username?: string; pfpUrl?: string };
  try {
    body = await req.json();
    if (typeof body !== 'object' || body === null) throw new Error();
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }
  const { fid, displayName, username, pfpUrl } = body;

  // Get last incrementer info
  const lastFid = await redis.get('counter:last_incrementer');
  const lastTimestamp = await redis.get('counter:last_incrementer_ts');
  const now = Math.floor(Date.now() / 1000);

  // Check if this user is the last incrementer
  // if (fid && lastFid && String(fid) === String(lastFid)) {
  //   error = 'You cannot increment twice in a row.';
  // }
  // Check cooldown (10 seconds)
  const lastUserTs = fid ? await redis.get(`counter:user:${fid}:last_increment_time`) : null;
  if (!error && lastUserTs && now - Number(lastUserTs) < 10) {
    error = `Please wait ${10 - (now - Number(lastUserTs))} seconds before incrementing again.`;
  }

  let count: number = Number(await redis.get('counter'));
  if (isNaN(count)) {
    count = 0;
  }

  if (!error && fid) {
    // increment
    count = await redis.incr('counter');
    await redis.set('counter:last_incrementer', fid);
    await redis.set('counter:last_incrementer_displayName', displayName || '');
    await redis.set('counter:last_incrementer_username', username || '');
    await redis.set('counter:last_incrementer_ts', now);
    await redis.set(`counter:user:${fid}:last_increment_time`, now);
    await redis.zIncrBy('counter:leaderboard', 1, fid);
    // Save displayName, username, and pfpUrl for leaderboard rendering
    await redis.set(`user:${fid}:displayName`, displayName || '');
    await redis.set(`user:${fid}:username`, username || '');
    await redis.set(`user:${fid}:pfpUrl`, pfpUrl || '');

  }
  // Get updated info
  const lastDisplayName = await redis.get('counter:last_incrementer_displayName');
  const lastUsername = await redis.get('counter:last_incrementer_username');
  const leaderboard = await getLeaderboard(redis);
  const cooldown = fid ? Math.max(0, 10 - (now - Number(await redis.get(`counter:user:${fid}:last_increment_time`) || 0))) : 0;

  return new NextResponse(
    JSON.stringify({
      count,
      lastIncrementer: { fid: lastFid, displayName: lastDisplayName, username: lastUsername, timestamp: lastTimestamp },
      leaderboard,
      cooldown,
      error,
    }),
    { status: error ? 400 : 200 }
  );
};
