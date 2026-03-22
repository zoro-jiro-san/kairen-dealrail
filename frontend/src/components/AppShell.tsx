'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';

type OperatorMode = 'human' | 'agent';

const OPERATOR_MODE_KEY = 'dealrail.operatorMode';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/terminal', label: 'Terminal' },
  { href: '/base', label: 'Base' },
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
  const [operatorMode, setOperatorMode] = useState<OperatorMode>(() => {
    if (typeof window === 'undefined') {
      return 'human';
    }

    return window.localStorage.getItem(OPERATOR_MODE_KEY) === 'agent' ? 'agent' : 'human';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(OPERATOR_MODE_KEY, operatorMode);
  }, [operatorMode]);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('dealrail.theme', nextTheme);
  }

  const operatorCopy =
    operatorMode === 'human'
      ? 'Guided browser lane for operators who want visible state, wallet review, and live demo control.'
      : 'Agent lane for runtimes that should start at /SKILL.md, use JSON outputs, and load the matching repo-local skill.';

  return (
    <div className="relative min-h-screen bg-[var(--terminal-bg)] text-[var(--terminal-fg)]">
      <header className="shell-header sticky top-0 z-20 border-b border-[var(--terminal-border)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="shell-brand shell-brand-compact">
              <div className="terminal-kicker">Kairen</div>
              <div className="shell-brandmark shell-brandmark-compact">DealRail</div>
            </Link>

            <nav className="ml-auto flex items-center gap-1 overflow-x-auto whitespace-nowrap">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shell-nav-link shell-nav-link-minimal ${active ? 'shell-nav-link-active' : ''}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <a
                href="https://kairen.xyz"
                target="_blank"
                rel="noreferrer"
                className="shell-nav-link shell-nav-link-minimal"
              >
                Kairen.xyz
              </a>
            </nav>

            <div className="shell-divider hidden sm:block" />

            <div className="hidden sm:block">
              <ConnectButton showBalance={false} />
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="shell-theme-toggle terminal-mono"
              suppressHydrationWarning
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          <div className="shell-mode-row">
            <div className="min-w-0">
              <div className="terminal-kicker">Entry Lane</div>
              <div className="shell-mode-copy">{operatorCopy}</div>
            </div>
            <div className="shell-mode-switch" role="group" aria-label="Entry mode">
              <Link
                href="/docs"
                onClick={() => setOperatorMode('human')}
                className={`shell-mode-button ${operatorMode === 'human' ? 'shell-mode-button-active' : ''}`}
              >
                Human
              </Link>
              <a
                href="/SKILL.md"
                onClick={() => setOperatorMode('agent')}
                className={`shell-mode-button ${operatorMode === 'agent' ? 'shell-mode-button-active' : ''}`}
              >
                Agent
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
