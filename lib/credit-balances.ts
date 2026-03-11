export type CreditBalance = {
  amount_available: number;
  amount_pending: number;
};

export const EMPTY_CREDIT_BALANCE: CreditBalance = {
  amount_available: 0,
  amount_pending: 0,
};
