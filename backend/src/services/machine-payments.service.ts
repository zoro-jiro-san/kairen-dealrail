import { x402Service, type X402ProxyRequest, type X402ProxyResult } from './x402.service';

export type MachinePaymentProviderId = 'x402';

export type MachinePaymentProxyRequest = X402ProxyRequest & {
  provider?: MachinePaymentProviderId;
};

export type MachinePaymentProxyResult = X402ProxyResult & {
  provider: MachinePaymentProviderId;
};

export type MachinePaymentsStatus = {
  success: boolean;
  primaryProvider: MachinePaymentProviderId;
  providers: Array<{
    id: MachinePaymentProviderId;
    mode: 'adapter';
    settlementModel: 'pay-per-call';
    useCase: string;
  }>;
  endpoints: string[];
  useCase: string;
};

class MachinePaymentsService {
  getStatus(): MachinePaymentsStatus {
    return {
      success: true,
      primaryProvider: 'x402',
      providers: [
        {
          id: 'x402',
          mode: 'adapter',
          settlementModel: 'pay-per-call',
          useCase: 'Ethereum-native machine payments for API and data calls before escrow-backed service settlement.',
        },
      ],
      endpoints: ['POST /api/v1/payments/proxy'],
      useCase:
        'Use machine payments for immediate pay-per-call requests, then use DealRail escrow when the interaction becomes a negotiated service job with delivery and dispute risk.',
    };
  }

  async proxyRequest(payload: MachinePaymentProxyRequest): Promise<MachinePaymentProxyResult> {
    const provider = payload.provider ?? 'x402';

    switch (provider) {
      case 'x402': {
        const result = await x402Service.proxyRequest(payload);
        return {
          ...result,
          provider,
        };
      }
      default:
        throw new Error(`Unsupported machine payment provider: ${provider satisfies never}`);
    }
  }
}

export const machinePaymentsService = new MachinePaymentsService();
