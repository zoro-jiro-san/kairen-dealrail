# DealRail Testnet Transaction Ledger

Last updated: 2026-03-17 (UTC)
Purpose: canonical reference for all live demo onchain transactions used in submission/demo.

## Networks
- Base Sepolia (`84532`): `https://sepolia.basescan.org`
- Celo Sepolia (`11142220`): `https://celo-sepolia.blockscout.com`

## Active Deployment (March 17, 2026, upgraded ERC-8004 trust loop)
These addresses are the current canonical deployment for both Base Sepolia and Celo Sepolia.

Contracts:
- NullVerifier: `0x79d0d1a9292421E940ABab2eFf250eB103834D1A`
- ERC8004Verifier: `0xA3F079E0230Cf8FB0F40C8942841564A39d8cC1b`
- EscrowRail (native): `0x08A88af8F4d0fcbF64FFBcd493520411c96c0B28`
- EscrowRailERC20 (USDC): `0x0F8247f68521ad7EeaD623A9ca5a28787F27376B`
- DealRailHook: `0x06bF44b8eb768e2738933222273e61C6442A0c94`

### Celo Sepolia deployment txs (upgraded)
- NullVerifier deploy: `0xd64ce76d1683039c7f8ed1169fb29ec3d7a865dae06b5af1864e05db39714c15`
- ERC8004Verifier deploy: `0x98af4da66137563d2402ad7d65854bd5d6195c3651809456079b6082d9ca36bd`
- EscrowRail deploy: `0x57b1e9958d3ca4040bcde84ea1e5e7e94c1375c1fa682a8c2b1b6f8a179c45c2`
- EscrowRailERC20 deploy: `0x10adbc9c23989deb76d0408eb06e429fb29888ead1dbf5428c339373dfa32843`
- DealRailHook deploy: `0xd43b1dadedbc8e2bba28eaf1f4f9ae1a06952c4e637c4852b7aea48acd1da993`

### Base Sepolia deployment txs (upgraded)
- NullVerifier deploy: `0xc490e8b5c6d3b35bea234677942e673e71285f329bbc31eddf3e3c79a7a989a3`
- ERC8004Verifier deploy: `0x72337b4145c31e75f7205797f1c143ba2d99dd3a88bcd3c4bc9366f05fb695eb`
- EscrowRail deploy: `0xfdf0b07912fae7b7744003193eb404822cb8bb1f72e13396309332561944f4ef`
- EscrowRailERC20 deploy: `0x94fbeb06d31e4400fbec0d6d66476f46de2ee36b84596290c82c25bc17588407`
- DealRailHook deploy: `0xc9e758280848abba9c0083f7406feba726f98bb9a42a4f9d07f0652e58b065c1`

## Celo Sepolia Deployment (March 17, 2026, initial)
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

## Celo Sepolia Smoke Demo (live, upgraded deployment)
Run timestamp: `2026-03-17T11:09:24.459Z`
Contract: `0x0F8247f68521ad7EeaD623A9ca5a28787F27376B`

### Happy path (jobId: 1, final state: Completed=3)
- createJob: `0x030d870c30c9a6d643eee83916ea421df9b29f4bf3961f8c9a186a3c7c58cced`
- approve: `0xe01ac3b51cacb485da8d87cd8e52052973f359fe56e672d271e1179d0bfeb3ad`
- fund: `0x055b79207cd4d620152aeaf4e5898a688609445766ab07f0db76802b96e824f5`
- submit: `0xd2a7cba3634a1aac26b7342890b1775c86d6d4d0fae62b801876aeb8cfc73ec6`
- complete: `0xc072c925bf539761b7e814551a9b607efd697d0c0900a882ab2522a8975dacef`

### Reject path (jobId: 2, final state: Rejected=4)
- createJob: `0x9e19fe616b3104ced31891772133df753190aa21c676ea0170b0df1204ec2d2a`
- approve: `0xb2ef216cdc6f8eeed4cb15092ffa10e05c77372beb8a0dbb12028a84a930c7e0`
- fund: `0x3de7aa44cfb7e4863aa6591e4c715c10ad71a4dcf86f498d67c7ae689bfaeab6`
- submit: `0x24241b42ae146d5e0446fe742e7202bc184adab54fc4f2e3d4d45c36229feeee`
- reject: `0x51a6b708933742ac864749cb231ffd263c13e42056597efaa38ad2893061ea96`

## Base Sepolia Smoke Demo (live, upgraded deployment)
Run timestamp: `2026-03-17T11:11Z`
Contract: `0x0F8247f68521ad7EeaD623A9ca5a28787F27376B`
JobId: `8` (completed)

- createJob: `0x68113da1922720ea0692832b79e53aff7149c2daf7da08cdfe9c9dcf21834bb2`
- approve: `0xe4be6e3826caa5f3073baa3a3d93e0cc98dbbfd75c3e78e394c3565bd1242ff9`
- fund: `0x85f72b13445ce470aa87b2a97dd873bea97947f3ec981f710d97b11353fce573`
- submit: `0x2119dfa210bbce59a4afc95328f4c750bfa5d76ef52b395285e15a6fc339347a`
- complete: `0x8b12c807e008bdd161a64fd4e8c04b14b9dabf3890f837e1452451a8216a422b`

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
