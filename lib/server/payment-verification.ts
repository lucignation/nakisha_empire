interface VerifiedPaystackTransaction {
  reference: string;
  amount: number;
  currency: string;
  status: string;
}

interface VerifiedFlutterwaveTransaction {
  id: number;
  txRef: string;
  amount: number;
  currency: string;
  status: string;
}

export async function verifyPaystackTransaction(input: {
  reference: string;
  expectedAmount?: number;
  currency?: string;
}) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is missing.");
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(input.reference)}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  const payload = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: {
      status?: string;
      amount?: number;
      currency?: string;
      reference?: string;
    };
  };

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(payload.message ?? "Unable to verify Paystack payment.");
  }

  const transaction = payload.data;
  const expectedCurrency = input.currency ?? "NGN";
  const amountMatches = input.expectedAmount ? transaction.amount === input.expectedAmount : true;
  const currencyMatches = transaction.currency === expectedCurrency;
  const statusMatches = transaction.status === "success";

  if (!amountMatches || !currencyMatches || !statusMatches || !transaction.reference || !transaction.amount || !transaction.currency || !transaction.status) {
    throw new Error(
      !statusMatches
        ? "Paystack payment was not successful."
        : !amountMatches
          ? "Paystack payment amount did not match the order total."
          : "Paystack payment currency did not match the order currency."
    );
  }

  return {
    reference: transaction.reference,
    amount: transaction.amount,
    currency: transaction.currency,
    status: transaction.status
  } satisfies VerifiedPaystackTransaction;
}

export async function verifyFlutterwaveTransaction(input: {
  transactionId: number;
  txRef: string;
  expectedAmount?: number;
  currency?: string;
}) {
  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    throw new Error("FLUTTERWAVE_SECRET_KEY is missing.");
  }

  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${input.transactionId}/verify`, {
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  const payload = (await response.json()) as {
    status?: string;
    message?: string;
    data?: {
      status?: string;
      tx_ref?: string;
      amount?: number;
      currency?: string;
      id?: number;
    };
  };

  if (!response.ok || payload.status !== "success" || !payload.data) {
    throw new Error(payload.message ?? "Unable to verify Flutterwave payment.");
  }

  const transaction = payload.data;
  const expectedCurrency = input.currency ?? "NGN";
  const statusMatches = transaction.status === "successful";
  const referenceMatches = transaction.tx_ref === input.txRef;
  const amountMatches = input.expectedAmount ? Number(transaction.amount) === input.expectedAmount : true;
  const currencyMatches = transaction.currency === expectedCurrency;

  if (
    !statusMatches ||
    !referenceMatches ||
    !amountMatches ||
    !currencyMatches ||
    !transaction.id ||
    !transaction.tx_ref ||
    typeof transaction.amount !== "number" ||
    !transaction.currency ||
    !transaction.status
  ) {
    throw new Error(
      !statusMatches
        ? "Flutterwave payment was not successful."
        : !referenceMatches
          ? "Flutterwave reference did not match the generated transaction reference."
          : !amountMatches
            ? "Flutterwave payment amount did not match the order total."
            : "Flutterwave payment currency did not match the order currency."
    );
  }

  return {
    id: transaction.id,
    txRef: transaction.tx_ref,
    amount: Number(transaction.amount),
    currency: transaction.currency,
    status: transaction.status
  } satisfies VerifiedFlutterwaveTransaction;
}
