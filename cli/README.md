# DealRail CLI

Publishable CLI package for DealRail.

It supports two modes:

- Human mode: ASCII command deck output for terminal use
- Agent mode: stable JSON with `--json`

## Commands

```bash
dealrail help
dealrail demo
dealrail status
dealrail scan benchmark report
dealrail providers compliance checks --max-price 0.12
dealrail vend "benchmark report" --budget 0.12 --hours 24
dealrail vend "security review" --budget 0.20 --hours 48 --queue
dealrail rails
dealrail jobs --limit 8
dealrail job 12
```

## Configuration

Set the API base URL with either:

```bash
export DEALRAIL_API_URL=http://localhost:3001
```

or:

```bash
dealrail status --api http://localhost:3001
```

## Development

```bash
npm install
npm run check
npm run build
npm run cli -- help
npm run demo
npm run start -- help
```
