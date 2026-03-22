'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';

type OperatorMode = 'human' | 'agent';

const OPERATOR_MODE_KEY = 'dealrail.operatorMode';
const PUBLIC_SKILL_URL = 'https://dealrail.kairen.xyz/SKILL.md';
const PUBLIC_SKILL_CURL = `curl -s ${PUBLIC_SKILL_URL}`;

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
  const [copyNotice, setCopyNotice] = useState('');

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

  async function copyAgentEntry() {
    try {
      await navigator.clipboard.writeText(PUBLIC_SKILL_CURL);
      setCopyNotice('Copied');
      window.setTimeout(() => setCopyNotice(''), 1400);
    } catch {
      setCopyNotice('Copy failed');
      window.setTimeout(() => setCopyNotice(''), 1800);
    }
  }

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
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <section className="shell-lane-panel">
          <div className="shell-mode-row">
            <div className="min-w-0">
              <div className="terminal-kicker">Entry Lane</div>
              <div className="shell-mode-copy">{operatorCopy}</div>
            </div>
            <div className="shell-mode-switch" role="group" aria-label="Entry mode">
              <button
                type="button"
                onClick={() => setOperatorMode('human')}
                className={`shell-mode-button ${operatorMode === 'human' ? 'shell-mode-button-active' : ''}`}
              >
                Human
              </button>
              <button
                type="button"
                onClick={() => setOperatorMode('agent')}
                className={`shell-mode-button ${operatorMode === 'agent' ? 'shell-mode-button-active' : ''}`}
              >
                Agent
              </button>
            </div>
          </div>

          <div className="shell-entry-card">
            {operatorMode === 'human' ? (
              <>
                <div className="terminal-label">Human Entry</div>
                <div className="shell-entry-copy">Stay in the product and start from the guided docs surface.</div>
                <div className="shell-entry-actions">
                  <Link href="/docs" className="terminal-command">
                    open /docs
                  </Link>
                  <Link href="/terminal" className="terminal-command">
                    open /terminal
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="terminal-label">Agent Entry</div>
                <div className="shell-entry-copy">Fetch the public skill index directly. The toggle only changes mode; it does not redirect.</div>
                <div className="shell-entry-actions">
                  <a href={PUBLIC_SKILL_URL} target="_blank" rel="noreferrer" className="terminal-command">
                    {PUBLIC_SKILL_CURL}
                  </a>
                  <button type="button" onClick={copyAgentEntry} className="shell-copy-button">
                    {copyNotice || 'Copy'}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
    </div>
  );
}
