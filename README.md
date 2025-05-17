# Chain Count

A collaborative counter and activity leaderboard Mini App on Farcaster built with [MiniKit](https://docs.base.org/builderkits/minikit/overview).


---

## What is Chain Count?

Chain Count is a collaborative counter and leaderboard Mini App on Farcaster. It enables users to increment a global counter, see their contributions in real time, and compete for the top spot on a live leaderboard all while showcasing their onchain identity with avatars and display names.

## Key Features

- **Live Leaderboard:** Top contributors are displayed with their avatars and names.
- **Personalized Experience:** Users are greeted by name and see their own progress.
- **Wallet Authentication:** Secure, onchain identity via OnchainKit.
- **Spam Protection:** Cooldowns prevent rapid, repeated increments.
- **Modern UI:** Responsive, visually appealing, and easy to use.

## Project Goals

- Encourage onchain community engagement.
- Provide a fun, competitive, and transparent way to celebrate collective milestones.
- Showcase the power of integrated real-time Farcaster Frames.

## How It Works

1. **Connect Wallet:** Users authenticate using their Farcaster account or onchain wallet.
2. **Increment Counter:** Each user can increment the global count (with a cooldown).
3. **See Your Impact:** The leaderboard updates instantly, showing avatars and names.
4. **Share & Compete:** Users can share their progress and compete for the top spot.

## Running the app

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

2. Verify environment variables, these will be set up by the `npx create-onchain --mini` command:

You can regenerate the FARCASTER Account Association environment variables by running `npx create-onchain --manifest` in your project directory.

The environment variables enable the following features:

- Frame metadata - Sets up the Frame Embed that will be shown when you cast your frame
- Account association - Allows users to add your frame to their account, enables notifications
- Redis API keys - Enable Webhooks and background notifications for your application by storing users notification details

```bash
# Shared/OnchainKit variables
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=
NEXT_PUBLIC_URL=
NEXT_PUBLIC_ICON_URL=
NEXT_PUBLIC_ONCHAINKIT_API_KEY=

# Frame metadata
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=
NEXT_PUBLIC_APP_ICON=
NEXT_PUBLIC_APP_SUBTITLE=
NEXT_PUBLIC_APP_DESCRIPTION=
NEXT_PUBLIC_APP_SPLASH_IMAGE=
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=
NEXT_PUBLIC_APP_HERO_IMAGE=
NEXT_PUBLIC_APP_TAGLINE=
NEXT_PUBLIC_APP_OG_TITLE=
NEXT_PUBLIC_APP_OG_DESCRIPTION=
NEXT_PUBLIC_APP_OG_IMAGE=

# Redis config
REDIS_URL=
REDIS_TOKEN=
```

3. Start the development server:
```bash
npm run dev
```
