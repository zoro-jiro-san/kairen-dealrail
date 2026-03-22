'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/terminal', label: 'Terminal' },
  { href: '/dashboard', label: 'Board' },
  { href: '/docs', label: 'Docs' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    return window.localStorage.getItem('dealrail.theme') === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('dealrail.theme', nextTheme);
  }

  return (
    <div className="min-h-screen bg-[var(--terminal-bg)] text-[var(--terminal-fg)]">
      <header className="sticky top-0 z-20 border-b border-[var(--terminal-border)] bg-[var(--terminal-panel)]/88 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-fit">
            <div className="terminal-kicker">DealRail</div>
            <div className="mt-1 text-sm font-semibold">Machine Procurement Desk</div>
          </div>
          <nav className="ml-auto flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
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
          <button type="button" onClick={toggleTheme} className="terminal-btn terminal-mono text-xs uppercase" suppressHydrationWarning>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
