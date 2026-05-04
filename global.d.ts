declare module "*.css";

interface PaystackTransactionResponse {
  reference?: string;
  trxref?: string;
  status?: string;
  message?: string;
}

interface PaystackCheckoutOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  reference: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
  onSuccess?: (transaction: PaystackTransactionResponse) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (error: { message?: string }) => void;
}

interface PaystackInstance {
  checkout: (options: PaystackCheckoutOptions) => Promise<void> | void;
  newTransaction?: (options: PaystackCheckoutOptions) => Promise<void> | void;
  resumeTransaction?: (accessCode: string) => Promise<void> | void;
}

interface FlutterwaveTransactionResponse {
  transaction_id?: number | string;
  tx_ref?: string;
  status?: string;
}

interface FlutterwaveCheckoutOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  customer: {
    email: string;
    name?: string;
    phone_number?: string;
  };
  meta?: Record<string, unknown>;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  callback: (payment: FlutterwaveTransactionResponse) => void | Promise<void>;
  onclose?: (incomplete?: boolean, payment?: FlutterwaveTransactionResponse) => void;
}

declare global {
  interface Window {
    Paystack?: new () => PaystackInstance;
    FlutterwaveCheckout?: (options: FlutterwaveCheckoutOptions) => void;
  }
}

export {};
