# `@kairenxyz/dealrail`

Publishable CLI and SDK package for DealRail.

It supports two modes:

- Human mode: ASCII command deck output for terminal use
- Agent mode: stable JSON with `--json`

## Install

Preferred once published:

```bash
npx @kairenxyz/dealrail doctor --json
npx @kairenxyz/dealrail vend "benchmark report" --budget 0.12 --hours 24 --json
```

Global install:

```bash
npm install -g @kairenxyz/dealrail
dealrail help
```

Local project install:

```bash
npm install @kairenxyz/dealrail
```

If you want the client in code:

```ts
import { DealRailClient } from '@kairenxyz/dealrail';

const client = new DealRailClient('http://localhost:3001');
const health = await client.health();
```

## Commands

```bash
dealrail help
dealrail demo
dealrail doctor
dealrail doctor --json
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

Recommended operator flow:

```bash
dealrail doctor
dealrail vend "automation benchmark report" --budget 0.12 --hours 24
dealrail jobs --limit 4
```

Recommended agent flow:

```bash
dealrail doctor --json
dealrail vend "automation benchmark report" --budget 0.12 --hours 24 --json
```

## Development

```bash
npm install
npm run check
npm run build
npm run pack:dry-run
npm run cli -- help
npm run demo
npm run demo:walkthrough
npm run start -- help
```

## Publish

Before first publish:

1. Run `npm login`
2. Run `npm run check`
3. Run `npm run pack:dry-run`
4. Run `npm publish --access public`

npm docs:

- https://docs.npmjs.com/about-scopes
- https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages

## Demo Walkthrough

A separate recordable CLI demo runner lives at:

[`demo/dealrail-demo.sh`](/Users/sarthiborkar/Build/kairen-protocol/kairen-dealrail/cli/demo/dealrail-demo.sh)

It animates typed commands, pauses between scenes, and runs a clean walkthrough for:

- `help`
- `status`
- `scan`
- `vend`
- `jobs`
- `rails`

Run it with:

```bash
cd cli
npm run build
npm run demo:walkthrough
```

Useful knobs for recording:

```bash
TYPE_SPEED=0.01 PAUSE_SHORT=0.8 PAUSE_LONG=1.6 npm run demo:walkthrough
DEALRAIL_API_URL=http://localhost:3001 npm run demo:walkthrough
```
