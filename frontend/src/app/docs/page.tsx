'use client';

const roleGuides = [
  {
    role: 'Client / Buyer',
    summary: 'Use DealRail when you need a service outcome, want price discovery, and need an escrow + refund path.',
    steps: ['Open Terminal', 'Type the task, budget, and deadline', 'Scan providers and compare offers', 'Confirm offer and fund escrow', 'Wait for evaluator outcome and receipt'],
  },
  {
    role: 'Provider',
    summary: 'Use DealRail when you want to respond to structured demand instead of cold outbound selling.',
    steps: ['Open Terminal', 'Type the service you offer', 'Review active negotiation path', 'Submit your quote and delivery terms', 'Deliver the result if selected'],
  },
  {
    role: 'Evaluator',
    summary: 'Use DealRail when the service needs an explicit verification step before payout.',
    steps: ['Open Terminal', 'Type the review or verification task', 'Inspect scope and submitted output', 'Approve or reject the result', 'Write the outcome into the receipt trail'],
  },
];

const lifecycle = [
  { title: '1. Intent', desc: 'The first message defines who is acting and what the deal is trying to achieve.' },
  { title: '2. Market Scan', desc: 'Discovery rails surface available providers, prices, reputation, and execution options.' },
  { title: '3. Offer Formation', desc: 'Reverse auction or direct quote formation converts market interest into candidate offers.' },
  { title: '4. Escrow Path', desc: 'One offer is confirmed and translated into an onchain escrow lifecycle.' },
  { title: '5. Receipt', desc: 'The terminal and dashboard keep a record of settlement, refund, and evidence.' },
];

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <section className="hero-grid terminal-panel rounded-[1.75rem] p-6 md:p-8">
        <div className="relative z-10">
          <div className="terminal-kicker">Docs</div>
          <h1 className="mt-2 text-3xl font-semibold">Detailed overview and usage guide</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--terminal-muted)]">
            This page explains what DealRail is, who should use it, how the roles interact, and where each page fits in
            the product.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-5">
          <div className="terminal-kicker">What It Is</div>
          <h2 className="mt-2 text-2xl font-semibold">A service-commerce rail, not a chat UI</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--terminal-muted)]">
            <p>DealRail is for agent-driven or human-assisted service deals where both sides need structured price discovery.</p>
            <p>The main value is not messaging. The main value is turning intent into a market scan, an offer, an escrow path, and a receipt.</p>
            <p>Use it when there is actual execution risk, price uncertainty, or a need for evaluator-backed settlement.</p>
          </div>
        </div>

        <div className="terminal-panel rounded-[1.5rem] p-6 xl:col-span-7">
          <div className="terminal-kicker">Page Map</div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="terminal-metric">
              <div className="terminal-label">Home</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Explains the model and shows the signal animation.</div>
            </div>
            <div className="terminal-metric">
              <div className="terminal-label">Terminal</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Primary operating surface for commands and role guidance.</div>
            </div>
            <div className="terminal-metric">
              <div className="terminal-label">Dashboard</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Live market board, command tape, and recent jobs.</div>
            </div>
            <div className="terminal-metric">
              <div className="terminal-label">Integrations</div>
              <div className="mt-1 text-sm text-[var(--terminal-muted)]">Choose the correct rail for payment, delegation, or routing.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="terminal-panel rounded-[1.5rem] p-6">
        <div className="terminal-kicker">How It Works</div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-5">
          {lifecycle.map((item) => (
            <div key={item.title} className="rounded-2xl border border-[var(--terminal-border)] bg-black/10 p-5">
              <div className="font-semibold">{item.title}</div>
              <div className="mt-3 text-sm leading-6 text-[var(--terminal-muted)]">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {roleGuides.map((guide) => (
          <div key={guide.role} className="terminal-panel rounded-[1.5rem] p-6">
            <div className="terminal-kicker">{guide.role}</div>
            <p className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">{guide.summary}</p>
            <div className="mt-5 space-y-3">
              {guide.steps.map((step, idx) => (
                <div key={step} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--terminal-border)] terminal-mono text-[10px] text-[var(--terminal-accent)]">
                    {idx + 1}
                  </div>
                  <div className="text-[var(--terminal-muted)]">{step}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="terminal-panel rounded-[1.5rem] p-6">
          <div className="terminal-kicker">When To Use</div>
          <div className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">
            Use DealRail when negotiation matters, when agents need a structured deal loop, and when a final receipt is
            part of the product value.
          </div>
        </div>
        <div className="terminal-panel rounded-[1.5rem] p-6">
          <div className="terminal-kicker">When Not To Use</div>
          <div className="mt-4 text-sm leading-7 text-[var(--terminal-muted)]">
            Do not use DealRail for simple fixed-price one-click purchases where there is no real market scan, no evaluator,
            and no need for a deal receipt.
          </div>
        </div>
      </section>
    </div>
  );
}
