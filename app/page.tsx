"use client";

import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
import Image from 'next/image';
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";

type LeaderboardEntry = {
  fid: string;
  count: number;
  displayName?: string;
  username?: string;
  pfpUrl?: string;
};

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);

  const [counter, setCounter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev > 0) {
            return prev - 1;
          }
          return 0;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);
  const [error, setError] = useState<string | null>(null);
  const [lastIncrementer, setLastIncrementer] = useState<{ fid?: string, displayName?: string, username?: string, pfpUrl?: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const addFrame = useAddFrame();

  type UserInfo = {
  fid: string;
  displayName: string;
  username: string;
  pfpUrl?: string;
}

  // Helper to get user info from context
  const getUserInfo = useCallback((): UserInfo | null => {
  return context?.user?.fid ? {
    fid: String(context.user.fid),
    displayName: context.user.displayName || context.user.username || '',
    username: context.user.username || '',
    pfpUrl: context.user.pfpUrl || '',
  } : null;
}, [context?.user]);

  // Fetch counter and related info on mount and when user changes
  useEffect(() => {
    setInitialLoading(true);
    setError(null);
    const user = getUserInfo();
    let url = '/api/counter';
    if (user) {
      url += `?fid=${user.fid}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setCounter(data.count ?? 0);
        setLastIncrementer(data.lastIncrementer ?? null);
        setLeaderboard(data.leaderboard ?? []);
        setCooldown(data.cooldown ?? 0);
        setError(data.error ?? null);
      })
      .finally(() => setInitialLoading(false));
  }, [context?.user?.fid, getUserInfo]);

  const handleIncrement = useCallback(async () => {
    setLoading(true);
    setError(null);
    const user = getUserInfo();
    try {
      const res = await fetch('/api/counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error incrementing counter');
      }
      setCounter(data.count ?? 0);
      setLastIncrementer(data.lastIncrementer ?? null);
      setLeaderboard(data.leaderboard ?? []);
      setCooldown(data.cooldown ?? 0);
    } catch {
      setError('Error incrementing counter');
    } finally {
      setLoading(false);
    }
  }, [getUserInfo]);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center animate-fade-in">
          <div className="mb-8 text-center">
            {context?.user?.displayName && (
              <div className="text-lg font-semibold mb-4 text-[var(--app-foreground-muted)]">
                Hey {context.user.displayName}, time to increment!
              </div>
            )}
            {initialLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[80px]">
                <div className="w-10 h-10 border-4 border-[var(--app-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-[var(--app-foreground-muted)] text-sm">Loading counter...</div>
              </div>
            ) : (
              <>
                <div className="text-5xl font-bold mb-2" data-testid="counter-value">{counter}</div>
                <div className="text-[var(--app-foreground-muted)] text-sm">Total increments</div>
                {lastIncrementer?.displayName && (
                  <div className="mt-2 text-[var(--app-foreground-muted)] text-xs flex items-center gap-2">
                    {lastIncrementer.pfpUrl ? (
                      <Image
                        src={lastIncrementer.pfpUrl}
                        alt={lastIncrementer.displayName || lastIncrementer.username || lastIncrementer.fid || ''}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">?</span>
                    )}
                    Last incrementer: <span className="font-semibold">{lastIncrementer.displayName}</span>{lastIncrementer.username ? ` (@${lastIncrementer.username})` : ''}
                  </div>
                )}
                {error && (
                  <div className="mt-2 text-red-500 text-xs">{error}</div>
                )}
              </>
            )}
          </div>
          <Button
            size="lg"
            className="text-4xl px-8 py-4 rounded-full shadow-lg bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
            onClick={handleIncrement}
            disabled={
              !context?.user?.fid ||
              loading || initialLoading ||
              cooldown > 0 ||
              !!(context?.user?.fid && lastIncrementer?.fid && String(context.user.fid) === String(lastIncrementer.fid))
            }
            icon={<Icon name="plus" size="lg" />}
          >
            {cooldown > 0 ? (
              <span className="text-base">Wait {cooldown}s</span>
            ) : (
              <span className="sr-only">Increment</span>
            )}
          </Button>

          {/* Share Button */}
          <Button
            variant="outline"
            size="md"
            className="mt-4"
            onClick={() => {
              const text = encodeURIComponent(
                `Help me increment the Counter! ${process.env.NEXT_PUBLIC_URL}`
              );
              window.open(`https://warpcast.com/~/compose?text=${text}`, '_blank');
            }}
            icon={<Icon name="arrow-right" size="md" />}
          >
            Share on Farcaster
          </Button>

          {/* Leaderboard */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-8 w-full max-w-xs mx-auto bg-[var(--app-card-bg)] rounded-lg shadow p-4">
              <div className="font-semibold mb-2 text-center text-[var(--app-accent)]">Leaderboard</div>
              <ol className="space-y-1 text-sm">
                {leaderboard.map((entry, idx) => {
                  return (
                    <li key={entry.fid} className="flex justify-between items-center">
                      <span className="font-medium">#{idx + 1}</span>
                      <span className="flex items-center gap-2 truncate">
                        {entry.pfpUrl ? (
                          <Image
                            src={entry.pfpUrl}
                            alt={entry.displayName || entry.username || entry.fid}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">?</span>
                        )}
                        {entry.displayName || entry.username || entry.fid}
                      </span>
                      <span className="ml-2 text-[var(--app-foreground-muted)]">{entry.count}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
