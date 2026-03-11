export const ADMIN_DASHBOARD_VIEW_KEYS = [
  'sessions-today',
  'pending-notes',
  'accounts-needing-attention',
  'sessions-billed',
  'sessions-pending-billing',
] as const;

export type ViewKey = (typeof ADMIN_DASHBOARD_VIEW_KEYS)[number];

export const ADMIN_DASHBOARD_VIEW_TITLES: Record<ViewKey, string> = {
  'sessions-today': 'Sessions Today',
  'pending-notes': 'Pending Notes',
  'accounts-needing-attention': 'Accounts Needing Attention',
  'sessions-billed': 'Sessions Billed',
  'sessions-pending-billing': 'Sessions Pending Billing',
};

export function parseViewKey(value: string | undefined): ViewKey {
  const legacyAliases: Record<string, ViewKey> = {
    'at-risk': 'accounts-needing-attention',
    'credits-captured': 'sessions-billed',
    'credits-leaked': 'sessions-pending-billing',
  };

  if (value && value in legacyAliases) {
    return legacyAliases[value];
  }

  if (ADMIN_DASHBOARD_VIEW_KEYS.includes(value as ViewKey)) {
    return value as ViewKey;
  }

  return 'sessions-today';
}
