import express from 'express';
import { AddressInfo } from 'net';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme as ExactEvmServerScheme } from '@x402/evm/exact/server';
import { ExactEvmScheme as ExactEvmClientScheme } from '@x402/evm';
import { decodePaymentResponseHeader, wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from '../src/config';

const NETWORK = 'eip155:84532';
const PRICE = '$0.01';

function requirePrivateKey(key: string | undefined, name: string): `0x${string}` {
  if (!key) {
    throw new Error(`Missing required env value ${name}.`);
  }
  return key as `0x${string}`;
}

async function main() {
  const payerAccount = privateKeyToAccount(
    requirePrivateKey(config.blockchain.deployerPrivateKey, 'DEPLOYER_PRIVATE_KEY')
  );
  const payToAccount = privateKeyToAccount(
    requirePrivateKey(config.blockchain.agentPrivateKey, 'AGENT_PRIVATE_KEY')
  );

  const facilitator = new HTTPFacilitatorClient({
    url: 'https://x402.org/facilitator',
  });

  const resourceServer = new x402ResourceServer(facilitator).register(
    NETWORK,
    new ExactEvmServerScheme()
  );

  const app = express();

  app.use(
    paymentMiddleware(
      {
        'GET /api/paid-proof': {
          accepts: {
            scheme: 'exact',
            network: NETWORK,
            payTo: payToAccount.address,
            price: PRICE,
          },
          description: 'DealRail x402 Base Sepolia proof endpoint',
        },
      },
      resourceServer
    )
  );

  app.get('/api/paid-proof', (_req, res) => {
    res.json({
      success: true,
      product: 'DealRail',
      proof: 'x402 testnet paid request',
      network: NETWORK,
      price: PRICE,
      timestamp: new Date().toISOString(),
    });
  });

  const server = await new Promise<import('http').Server>((resolve) => {
    const next = app.listen(0, '127.0.0.1', () => resolve(next));
  });

  try {
    const { port } = server.address() as AddressInfo;
    const url = `http://127.0.0.1:${port}/api/paid-proof`;

    const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
      schemes: [
        {
          network: 'eip155:*',
          client: new ExactEvmClientScheme(payerAccount),
        },
      ],
    });

    const response = await fetchWithPayment(url, { method: 'GET' });
    const responseBody = await response.json();

    const paymentResponseHeader = response.headers.get('PAYMENT-RESPONSE');
    if (!paymentResponseHeader) {
      throw new Error('Missing PAYMENT-RESPONSE header from paid x402 request.');
    }

    const settlement = decodePaymentResponseHeader(paymentResponseHeader);

    console.log(
      JSON.stringify(
        {
          success: response.ok,
          provider: 'x402',
          mode: 'live-testnet',
          payer: payerAccount.address,
          payTo: payToAccount.address,
          network: NETWORK,
          price: PRICE,
          endpoint: url,
          responseBody,
          settlement,
        },
        null,
        2
      )
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
