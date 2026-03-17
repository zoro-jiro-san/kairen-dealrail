'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/terminal', label: 'Terminal' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/docs', label: 'Docs' },
  { href: '/integrations', label: 'Integrations' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = window.localStorage.getItem('dealrail.theme');
    const nextTheme = saved === 'light' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('dealrail.theme', nextTheme);
  }

  return (
    <div className="min-h-screen bg-[var(--terminal-bg)] text-[var(--terminal-fg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--terminal-border)] bg-[var(--terminal-panel)]/92 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-fit">
            <div className="terminal-kicker">DealRail</div>
            <div className="mt-1 text-base font-semibold">Agent Deal Desk</div>
            <div className="text-xs text-[var(--terminal-muted)]">Negotiate {'->'} escrow {'->'} settle {'->'} record</div>
          </div>
          <nav className="ml-auto flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider transition ${
                    active
                      ? 'border-[var(--terminal-accent)] bg-[var(--terminal-accent)]/14 text-[var(--terminal-accent)]'
                      : 'border-[var(--terminal-border)] bg-black/10 text-[var(--terminal-muted)] hover:border-[var(--terminal-accent)]/60 hover:text-[var(--terminal-fg)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-2">
            <ConnectButton />
          </div>
          <button type="button" onClick={toggleTheme} className="terminal-btn terminal-mono text-xs uppercase">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <div className="rounded-full border border-[var(--terminal-border)] bg-black/10 px-4 py-2 text-[11px] text-[var(--terminal-muted)]">
            <span className="terminal-mono">OPERATING MODE</span> Start in `Terminal`, monitor the market in `Dashboard`,
            and use `Integrations` once a deal path is chosen.
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
