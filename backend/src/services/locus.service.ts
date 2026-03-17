import { config } from '../config';

export interface LocusSendUsdcInput {
  fromAgentId: string;
  toAddress: string;
  amountUsdc: string;
  chain: 'base' | 'base-sepolia' | 'celo' | 'celo-sepolia';
  memo?: string;
}

export interface LocusSendUsdcOutput {
  mode: 'mock' | 'live';
  operationId: string;
  status: 'accepted' | 'failed';
  provider: 'locus-mcp';
  request: LocusSendUsdcInput;
  raw?: unknown;
}

class LocusService {
  async listTools(): Promise<unknown> {
    if (config.integrations.locus.mockMode || !config.integrations.locus.apiKey) {
      return {
        mode: 'mock',
        tools: [
          { name: config.integrations.locus.sendUsdcTool, description: 'Send USDC payment' },
        ],
      };
    }

    try {
      const response = await fetch(config.integrations.locus.mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.integrations.locus.apiKey}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/list',
          params: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Locus tools/list failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        mode: 'fallback',
        error: (error as Error).message,
      };
    }
  }

  async sendUsdc(input: LocusSendUsdcInput): Promise<LocusSendUsdcOutput> {
    if (!config.integrations.locus.mockMode) {
      const live = await this.tryLiveSendUsdc(input);
      if (live) {
        return live;
      }
    }

    return {
      mode: 'mock',
      operationId: `locus_mock_${Date.now()}`,
      status: 'accepted',
      provider: 'locus-mcp',
      request: input,
      raw: {
        note: 'Mock mode enabled or live call unavailable',
      },
    };
  }

  private async tryLiveSendUsdc(input: LocusSendUsdcInput): Promise<LocusSendUsdcOutput | null> {
    if (!config.integrations.locus.apiKey) {
      return null;
    }

    try {
      const response = await fetch(config.integrations.locus.mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.integrations.locus.apiKey}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: config.integrations.locus.sendUsdcTool,
            arguments: {
              fromAgentId: input.fromAgentId,
              to: input.toAddress,
              amount: input.amountUsdc,
              chain: input.chain,
              memo: input.memo ?? '',
            },
          },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const body = await response.json();
      return {
        mode: 'live',
        operationId: `locus_live_${Date.now()}`,
        status: 'accepted',
        provider: 'locus-mcp',
        request: input,
        raw: body,
      };
    } catch {
      return null;
    }
  }
}

export const locusService = new LocusService();
