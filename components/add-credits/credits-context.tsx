'use client';

// TODO(backend): delete this file and replace usages with real server data once
// credit_balances and credit_transactions endpoints are implemented.
import { createContext, useContext, useState, type ReactNode } from 'react';

type CreditBalance = {
  amount_available: number;
  amount_pending: number;
};

type CreditsContextValue = {
  balance: CreditBalance;
  addCredits: (amount: number) => void;
  deductCredits: (amount: number) => void;
};

const CreditsContext = createContext<CreditsContextValue | null>(null);

const STUB_BALANCE: CreditBalance = { amount_available: 0, amount_pending: 0 };

export function CreditsProvider({
  children,
  initial = STUB_BALANCE,
}: {
  children: ReactNode;
  initial?: CreditBalance;
}) {
  const [balance, setBalance] = useState<CreditBalance>(initial);

  function addCredits(amount: number) {
    setBalance(prev => ({ ...prev, amount_available: prev.amount_available + amount }));
  }

  function deductCredits(amount: number) {
    setBalance(prev => ({ ...prev, amount_available: Math.max(0, prev.amount_available - amount) }));
  }

  return <CreditsContext.Provider value={{ balance, addCredits, deductCredits }}>{children}</CreditsContext.Provider>;
}

export function useCredits(): CreditsContextValue {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error('useCredits must be used inside <CreditsProvider>');
  return ctx;
}
