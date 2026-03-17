# DealRail Testnet Transaction Ledger

Last updated: 2026-03-17 (UTC)
Purpose: canonical reference for all live demo onchain transactions used in submission/demo.

## Networks
- Base Sepolia (`84532`): `https://sepolia.basescan.org`
- Celo Sepolia (`11142220`): `https://celo-sepolia.blockscout.com`

## Celo Sepolia Deployment (March 17, 2026)
Contracts:
- NullVerifier: `0xA6eb0b8B88fb7172D2e404A8523C8E62e3efa7Bf`
- ERC8004Verifier: `0x668Dcc3a039CBef0054AAF244763db419BE6A521`
- EscrowRail (native): `0x8148Eb0F451e43af3286541806339157678f7F4F`
- EscrowRailERC20 (USDC): `0x53d368b5467524F7d674B70F00138a283e1533ce`
- DealRailHook: `0x61B73b679E3BE2256dAa90A3c37E10AEacD8a9Cc`

Deployment txs:
- NullVerifier deploy: `0xabab31327ac15c4b25f334a0ad424578fdc6893f6bc19a7956239f0c7c983711`
- ERC8004Verifier deploy: `0x613988e51a1f410f81cc7317be428af585d06ca8467cbf8f7a0790fd3c4142e3`
- EscrowRail deploy: `0x0e6538aea40c9c40971e63887becb7279353d7755223c25e10ce54c369a786e4`
- EscrowRailERC20 deploy: `0x45d1a454ee41b7623834aa3245e3f163ab18c74cb2f0e4adc8bf86b0c3b5fcee`
- DealRailHook deploy: `0x33c8a39ca9679538c39b8e2acf4de322d527cffd36dc38deb402e8ab2856c046`

## Celo Sepolia Funding Ops (minimal top-ups)
- CELO top-up to provider: `0x9de3ed6c843da10241e585f525e09f621797b1022c74474267588811192a3d41`
- CELO top-up to evaluator: `0xefaf0b9ca52fd9cc8639f18170156eeaf0986c88dded69344d6e1daa50f78006`
- USDC transfer to provider (2.0): `0x336791afc7471b3376f7e926a1023289cd9cce6b390ab9c2c37c4f4995b27f1f`
- USDC transfer to evaluator (2.0): `0x6db1f3d1b0b4bae774245cd524d4c64cce06a5962d4eea800488e56be44c5300`

## Celo Sepolia Smoke Demo (live)
Run timestamp: `2026-03-17T10:43:40.923Z`
Script: `backend/tests/test-lifecycle-celo-sepolia.ts`
Artifact: `backend/tests/artifacts/celo-sepolia-smoke-2026-03-17.json`

### Happy path (jobId: 1, final state: Completed=3)
- createJob: `0x04a59317fa444a02d92cc554c7e3f6a5f58fe27494f1eebd933c248d224ece61`
- approve: `0x9832fb548a2f0a6ee818cca6723dabdfb86ee9608d1db105221f0361034de3bf`
- fund: `0xf6cbac19d09569dbb4ba98a50225d76a322a0a098d66391cdffec729bf55dc6d`
- submit: `0x621f6db1c2f0709f05b0e6a578e236a18de8c13b8a2e319d80659d18824808f2`
- complete: `0x948fd246f205505d7d56598ac72150ab199d4870db42788f2ab0e2098cc29762`

### Reject path (jobId: 2, final state: Rejected=4)
- createJob: `0x12193f895474f6540ff8652f9666c5b70ae9ec5b1ff6713b708b788e743b74a2`
- approve: `0xe9a927153e5f252de095305100c4035d0dd178b5f207589b56cfa0a484fd334e`
- fund: `0xe5f9ce920637d3017d9e92692499844743ba195025e23f7adea82ccc7c156b8f`
- submit: `0xe9582cf03762a75cb37a172c10e4fc3138e113870c58dab8fe89b31dc8f17a49`
- reject: `0x5a9612e13a7f8c07f9e787adedf704b434ecbf6120af455e508d20d89cfa0325`

## Celo Sepolia Smoke Demo (live, second verification run)
Run timestamp: `2026-03-17T10:48:03.785Z`
Command: `npm run smoke:celo-sepolia` (in `backend/`)

### Happy path (jobId: 3, final state: Completed=3)
- createJob: `0x5ee8c6d91033da1c98b3633c5b04618c2405d4fc7283b3781c9d4584975c1f44`
- approve: `0x76e4beec7186f16f34bb753cef32c736c19521c685564846a86f2812f56c5254`
- fund: `0xdf1e9631aa467a13a2d244d9792ccd6eec17d0d6e5adf045130ca6d662ce3c5c`
- submit: `0xbed7a3dcc383727ec90f83cbb9f282db2bb2d8a8fd6ad8544a1bdbd0d16ec1d6`
- complete: `0x040ebe50a4798f1fc352cda19b6d685eeace537977de9e5f076c9c1e12ae773e`

### Reject path (jobId: 4, final state: Rejected=4)
- createJob: `0x93fea07ebf585ff4ac242d5a02da9b814006e4c2463a35b2b2ba1e59f4362239`
- approve: `0xa9ed34fb9318bd0022bc35dcef83d896140658c432337321caeadad59d132655`
- fund: `0x5580e4e6d1f3a0907ade15a166ae653035eef6c3ebb209d957bef44b56189f70`
- submit: `0x221a518558857b5c826621f8ce27a67414969cdd308d4152e4336bf35d133f1f`
- reject: `0x95adaeaa706e6e2f9817ecf9c06a7c9cdde9e49792326008dbe04f85d58a9189`

## Base Sepolia Existing Smoke References (historical)
- Happy path create: `0xd891fcb2b468684d85f0ff4b4d52c2df822c1fdc1db3dc6e5f738f20498d2ede`
- Happy path approve: `0x4d3a5e28377777cc194fb9147f8895f52f31f3000fe6f4e7378397755205dee8`
- Happy path fund: `0x43e3dc08d75491b431d6f0342f6627c1d5896596818e98f9a477840b79c7ebca`
- Happy path submit: `0xd1b4f16ef4cbe59fd568f89135efc2c5983691f2c5a2dbe9f314cc6cd74dc286`
- Happy path complete: `0x7f4fb1484fa47788fec768fbef3f307f65bb8d90df919e028c53d8f445056ed7`

## Re-run Commands
- Celo Sepolia smoke test:
```bash
npx tsx backend/tests/test-lifecycle-celo-sepolia.ts
```

- Deployment (already completed):
```bash
cd contracts
set -a && source ../.env && set +a
forge script script/DeployCeloSepolia.s.sol:DeployCeloSepolia \
  --rpc-url "$CELO_SEPOLIA_RPC" \
  --broadcast \
  --legacy
```
