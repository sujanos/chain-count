"use client";

import {
  useMiniKit,
  useAddFrame,
} from "@coinbase/onchainkit/minikit";
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

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);

  const [counter, setCounter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const addFrame = useAddFrame();

  useEffect(() => {
    setInitialLoading(true);
    fetch('/api/counter')
      .then(res => res.json())
      .then(data => setCounter(data.count ?? 0))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleIncrement = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/counter', { method: 'POST' });
      const data = await res.json();
      setCounter(data.count ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

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
                {context.user.displayName}
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
              </>
            )}
          </div>
          <Button
            size="lg"
            className="text-4xl px-8 py-4 rounded-full shadow-lg bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white"
            onClick={handleIncrement}
            disabled={loading || initialLoading}
            icon={<Icon name="plus" size="lg" />}
          >
            <span className="sr-only">Increment</span>
          </Button>
        </main>
      </div>
    </div>
  );
}
