import { purchaseParentCredits, reserveCreditsForBooking } from '@/lib/data/credit-mutations';
import { describe, expect, it, vi } from 'vitest';

describe('credit mutations', () => {
  it('records a purchase after updating the parent balance', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ amount_available: 12, amount_pending: 1 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { id: 99 } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(purchaseParentCredits(44, 12, 3, { amount_available: 9, amount_pending: 1 })).resolves.toEqual({
      balance: {
        amount_available: 12,
        amount_pending: 1,
      },
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/credit-balances',
      expect.objectContaining({
        method: 'PUT',
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/credit-transactions',
      expect.objectContaining({
        method: 'POST',
      })
    );

    const updateBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    const transactionBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));

    expect(updateBody).toEqual({
      parent_id: 44,
      amount_available: 12,
      amount_pending: 1,
    });
    expect(transactionBody).toEqual({
      parent_id: 44,
      student_id: 12,
      amount: 3,
      balance_after: 12,
      type: 'Purchase',
    });
  });

  it('returns a warning when the balance update succeeds but the transaction write fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ amount_available: 7, amount_pending: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'insert failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(purchaseParentCredits(21, 4, 2, { amount_available: 5, amount_pending: 0 })).resolves.toEqual({
      balance: {
        amount_available: 7,
        amount_pending: 0,
      },
      warning: 'Credits were added, but the purchase entry could not be recorded in credit history.',
    });
  });
  it('rejects reservation attempts when there are not enough available credits', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(reserveCreditsForBooking(9, 3, { amount_available: 2, amount_pending: 0 })).rejects.toThrow(
      'Not enough available credits to book this session.'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
