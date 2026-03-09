import { EMPTY_CREDIT_BALANCE, type CreditBalance } from '@/lib/credit-balances';

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type CreditMutationResult = {
  balance: CreditBalance;
  warning?: string;
};

export type { CreditMutationResult };

type CreditTransactionType = 'Purchase' | 'Session Debit';

type CreditTransactionInput = {
  amount: number;
  balance_after: number;
  parent_id: number;
  session_id?: number;
  student_id: number;
  type: CreditTransactionType;
};

type CreditBalanceApiResponse = Partial<CreditBalance> & {
  error?: string;
};

async function readJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

function toCreditBalance(balance: Partial<CreditBalance> | null | undefined): CreditBalance {
  return {
    amount_available:
      typeof balance?.amount_available === 'number' ? balance.amount_available : EMPTY_CREDIT_BALANCE.amount_available,
    amount_pending:
      typeof balance?.amount_pending === 'number' ? balance.amount_pending : EMPTY_CREDIT_BALANCE.amount_pending,
  };
}

async function updateCreditBalance(
  parentId: number,
  balance: CreditBalance,
  fetchImpl: FetchLike
): Promise<CreditBalance> {
  const response = await fetchImpl('/api/credit-balances', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parent_id: parentId,
      amount_available: balance.amount_available,
      amount_pending: balance.amount_pending,
    }),
  });

  const body = await readJson<CreditBalanceApiResponse>(response);
  if (!response.ok) {
    throw new Error(body?.error ?? 'Could not update credit balance right now.');
  }

  return toCreditBalance(body ?? balance);
}

async function createCreditTransaction(input: CreditTransactionInput, fetchImpl: FetchLike) {
  const response = await fetchImpl('/api/credit-transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const body = await readJson<{ error?: string }>(response);
  if (!response.ok) {
    throw new Error(body?.error ?? 'Could not record the credit transaction right now.');
  }
}

export async function fetchCreditBalance(parentId: number, fetchImpl: FetchLike = fetch): Promise<CreditBalance> {
  const response = await fetchImpl(`/api/credit-balances?parent_id=${parentId}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return EMPTY_CREDIT_BALANCE;
  }

  const body = await readJson<CreditBalanceApiResponse>(response);
  if (!response.ok) {
    throw new Error(body?.error ?? 'Could not load credit balance right now.');
  }

  return toCreditBalance(body);
}

export async function purchaseCredits(
  parentId: number,
  studentId: number,
  credits: number,
  currentBalance: CreditBalance,
  fetchImpl: FetchLike = fetch
): Promise<CreditMutationResult> {
  const nextBalance = {
    amount_available: currentBalance.amount_available + credits,
    amount_pending: currentBalance.amount_pending,
  };

  const balance = await updateCreditBalance(parentId, nextBalance, fetchImpl);

  try {
    await createCreditTransaction(
      {
        amount: credits,
        balance_after: balance.amount_available,
        parent_id: parentId,
        student_id: studentId,
        type: 'Purchase',
      },
      fetchImpl
    );
  } catch {
    return {
      balance,
      warning: 'Credits were added, but the purchase entry could not be recorded in credit history.',
    };
  }

  return { balance };
}

export async function reserveSessionCredits(
  parentId: number,
  credits: number,
  currentBalance: CreditBalance,
  fetchImpl: FetchLike = fetch
): Promise<CreditMutationResult> {
  if (currentBalance.amount_available < credits) {
    throw new Error('Not enough available credits to book this session.');
  }

  const nextBalance = {
    amount_available: currentBalance.amount_available - credits,
    amount_pending: currentBalance.amount_pending + credits,
  };

  const balance = await updateCreditBalance(parentId, nextBalance, fetchImpl);

  return { balance };
}
