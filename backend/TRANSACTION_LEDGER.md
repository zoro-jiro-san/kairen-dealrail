# DealRail Testnet Transaction Ledger

Last updated: 2026-03-17 (UTC)
Purpose: canonical reference for all live demo onchain transactions used in submission/demo.

## Networks
- Base Sepolia (`84532`): `https://sepolia.basescan.org`
- Celo Sepolia (`11142220`): `https://celo-sepolia.blockscout.com`

## Active Deployment (March 17, 2026, upgraded ERC-8004 trust loop + hook execution)
These addresses are the current canonical deployment for both Base Sepolia and Celo Sepolia.

Contracts:
- NullVerifier: `0x9cF6eE9c8606988525ACa24023E3293130A25f1B` (Base), `0x3Bf4a9DD8200F43eF93bF4DAF1E0148102383835` (Celo)
- ERC8004Verifier: `0xEd943E74001e1129546FEde0484Ec1C0F1419815` (Base), `0x0CF133C9cE602854269CA6e49A4E8697Ef392c76` (Celo)
- EscrowRail (native): `0x7F992E25A7de4269bf6acB187C140920593C2b98` (Base), `0x3FC242a428e612c54Dd7F81181bdDcC295BecEe6` (Celo)
- EscrowRailERC20 (USDC): `0x3Bf4a9DD8200F43eF93bF4DAF1E0148102383835` (Base), `0x03e36985D6497BEf550aFAF8b7105301Ea19C890` (Celo)
- DealRailHook: `0x0CF133C9cE602854269CA6e49A4E8697Ef392c76` (Base), `0x4F7Ed262F1675cdffB5D63eE5E2B0FCb95C0015f` (Celo)

### Celo Sepolia deployment txs (upgraded)
- NullVerifier deploy: `0x239105b357e4be409cfe54e9dc5405327c6a7498f9fa9e84bbc3ea87b98421c5`
- ERC8004Verifier deploy: `0x4bda1f86e3d42c7eb419209ed0ad2b928a9fedfc383a8a32ad72a89aa1d8cbe3`
- EscrowRail deploy: `0x61d57236eac7b4a42448e9f2c6839d09f3bded4cbaca0d64705efa851b8fe8db`
- EscrowRailERC20 deploy: `0x81fb34c8d13f7e477e4292398702ededadeda41278cd46b4a682e22489776512`
- DealRailHook deploy: `0x9989150ca05a7e613c128c0515e5270468a11520c91b245929d90be55b6a9e68`

### Base Sepolia deployment txs (upgraded)
- NullVerifier deploy: `0x15f2a9c54c675cf518b73bd00222f8d49f0a7c39b54acbbe0daf1a35e6c9f4f1`
- ERC8004Verifier deploy: `0x518ff6ca2ddb8913f662155d3c956b1f4c66d0177c7b6ac6d3557a891616308d`
- EscrowRail deploy: `0xd665b65207bdb5c50164e78181d0dd6f963d48e2a12822ff8abcde63a1748d89`
- EscrowRailERC20 deploy: `0x6389dbf42591837019fd5671469cf2d983a70ac35be2f7f0186e6e2ce1ba0c5c`
- DealRailHook deploy: `0xa71ffbb0104ba89319c26f69ddba1a32934b2adc836c3d6c7459f5220f4e70a0`

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

## Celo Sepolia Smoke Demo (live, hook-execution patch deployment)
Run timestamp: `2026-03-17T11:19:11.097Z`
Contract: `0x068358C84a5B5d5b1DD0Bd037E62e81816B61eF7`

### Happy path (jobId: 1, final state: Completed=3)
- createJob: `0xf9b405799494b900c00fa0007ddfe0894b1b111d6da0297be4516fd352dd71fe`
- approve: `0x129f33bcb4f9cd9311dd036e8f4ea20258d49ff310f930c9b50a3336c9a10afd`
- fund: `0x86c35b4e65558ddfdfd9b11cfc30888edf435cc33c81dd0ae1cf033e8f17984b`
- submit: `0xc46be99393dc61c0eee4e0ff09f06e099f894ddd73519841ad326103eb7805c3`
- complete: `0x84ec3908117d7be46752a21d5c9489f8f10ea3a82613dedbbda8f966c60b937a`

### Reject path (jobId: 2, final state: Rejected=4)
- createJob: `0xa4a88f221eb4c1858d7e1812f61c216b63a2f1cc5869b0d09ae8af4dbcd613b5`
- approve: `0xc2df1d27033c23fc581a7456e912e1671ca780c21b7f3f2403ec4f5930671d8f`
- fund: `0x7aff01d638ce38f330d8f7dc01d54c83df071d60c611c2ad0d115a6140bb1b8d`
- submit: `0x2440fe75cd2f4cb6dd7cd408dac3e3eaaa54df7caa7348041bc152ba3ffd21d3`
- reject: `0x20079f7fb8e1de0ff52f291da52989e550e83d61905e356c235d191ca4f6e69f`

## Base Sepolia Smoke Demo (live, hook-execution patch deployment)
Run timestamp: `2026-03-17T11:20Z`
Contract: `0x068358C84a5B5d5b1DD0Bd037E62e81816B61eF7`
JobId: `1` (completed)

- createJob: `0x3ac22d01fdd13889b15b8b0ea471bdeedbbd8f942544d2609911f8371acaeb88`
- approve: `0x9dd68406ce6d445eb8cb1b132253a6474999164195cf7617abc28a808a47d969`
- fund: `0x9da238db3169e35f3aef90595922db6fcc8e91da051d2ef91f9ecf1ab09d3212`
- submit: `0x780fe4a642eaa4baf7c54535f4e116e4a97e649ecbd63e898744fed35e5ddef7`
- complete: `0x0f5906409c53c20bf22038d8273ba7926a85e1259a4cba48ef5beb4426be3694`

## Celo Sepolia Smoke Demo (live, final deployment)
Run timestamp: `2026-03-17T11:24:24.645Z`
Contract: `0x03e36985D6497BEf550aFAF8b7105301Ea19C890`

### Happy path (jobId: 1, final state: Completed=3)
- createJob: `0xd37d2927b5d87c4f7b485385f82f4ab6baa73eb776a5ebd114d1b38e47433a93`
- approve: `0x000f98d27398954c75d025b0c131bde950405d5732f6deddf395edcbfff978e3`
- fund: `0x4f685c120a3f961b892fb7e69e2c2b97642389e562ba081c46b200ce590f874a`
- submit: `0x3f8dafa310a440f8dbde2ba0ec56fd560599392d8e8820e9be3a6f20e51ecbe7`
- complete: `0x1c7aa72ec08b86a72a65b5a9a182d14c07c6e106b288191366fa450236e16502`

### Reject path (jobId: 2, final state: Rejected=4)
- createJob: `0xb22dee065bfaf5797a7849faac6846fd890b51bc1895243fb541ef521da2779e`
- approve: `0x9d10898546996f4600ddd457f7aec98c544ab31e5d83284e93ce4e58b096b0ad`
- fund: `0x1378587f21b591d80483c11ee7055f50b1fc81a5ae106389d4afca51486d9de1`
- submit: `0x8c77df6eaa97a5a998c456aeec92b3f11c79d02d47a4a2abe454f029ec114a01`
- reject: `0xb400ab111085c1ca5dbe3d12f87dcd0612409d48f7ff956d8922780ea35e04da`

## Base Sepolia Smoke Demo (live, final deployment)
Run timestamp: `2026-03-17T11:25Z`
Contract: `0x3Bf4a9DD8200F43eF93bF4DAF1E0148102383835`
JobId: `1` (completed)

- createJob: `0xe55276ccb8c6c93c7d9fda8e036cc498d0dadad9b709fe80036fc124bf06d76f`
- approve: `0x3ff366a3dc4d4ca0fdb4331a0f7dc10c5aed68fa99160f2b9a9919b01dbf750c`
- fund: `0x8a7d52d20b4ef322916bb5be832e46ab143b5a1b3d94be155bd1fa05a91df1a1`
- submit: `0x7ca85de284424afb8be6dff54ef5d11e92f5fdde9cb510242e30804d74d7f927`
- complete: `0xef6d30ee706cbfa880244c9883c8f0d68179041363a0fd4ea182d030283f6f65`

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
