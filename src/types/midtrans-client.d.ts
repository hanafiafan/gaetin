declare module "midtrans-client" {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  interface SnapTransactionResult {
    token: string;
    redirect_url: string;
  }

  class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: Record<string, unknown>): Promise<SnapTransactionResult>;
  }

  const midtransClient: { Snap: typeof Snap };
  export default midtransClient;
}
