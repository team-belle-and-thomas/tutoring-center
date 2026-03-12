import 'server-only';
import { forbidden, notFound } from 'next/navigation';
import { isValidRole, type UserRole } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { PARENT_DETAIL_SELECT_WITH_JOINS, PARENT_SELECT_WITH_JOINS } from '@/lib/supabase/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import {
  ParentDetailWithJoinsSchema,
  ParentWithJoinsListSchema,
  type ParentDetailStudent,
  type ParentWithJoins,
} from '@/lib/validators/parents';

const MISSING_VALUE = '\u2014';

export type ParentRow = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  student_count: number;
  credit_balance_info: number;
};

export type ParentStudentRow = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  grade: string;
};

export type ParentProfileDetail = ParentRow & {
  billing_address: string;
  notification_preferences: string;
  students: ParentStudentRow[];
};

const PARENT_ERROR_MESSAGES = {
  admin: {
    database: 'Parent data is temporarily unavailable. Please retry in a moment.',
    validation: 'Parent data format is invalid. Please try again later.',
  },
} as const;

const ensureAdminRole = (role: UserRole) => {
  if (!isValidRole(role)) {
    throw new Error('Role is required to fetch parents.');
  }

  if (role !== 'admin') {
    forbidden();
  }
};

const parseName = (firstName: string | null | undefined, lastName: string | null | undefined) =>
  [firstName, lastName].filter(Boolean).join(' ') || MISSING_VALUE;

const parseParentUser = (users: ParentWithJoins['users']) => {
  const user = pickFirstEmbedded(users);

  return {
    name: parseName(user?.first_name, user?.last_name),
    email: user?.email ?? MISSING_VALUE,
    phone: user?.phone ?? MISSING_VALUE,
  };
};

const getAvailableCredits = (creditBalances: ParentWithJoins['credit_balances']) =>
  pickFirstEmbedded(creditBalances)?.amount_available ?? 0;

const mapParentRow = (parent: ParentWithJoins): ParentRow => {
  const user = parseParentUser(parent.users);

  return {
    id: parent.id,
    user_id: parent.user_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    student_count: parent.students?.length ?? 0,
    credit_balance_info: getAvailableCredits(parent.credit_balances),
  };
};

const mapParentStudentRow = (student: ParentDetailStudent): ParentStudentRow => {
  const user = pickFirstEmbedded(student.users);

  return {
    id: student.id,
    user_id: student.user_id,
    name: parseName(user?.first_name, user?.last_name),
    email: user?.email ?? MISSING_VALUE,
    phone: user?.phone ?? MISSING_VALUE,
    grade: student.grade ?? MISSING_VALUE,
  };
};

const sortByName = <TRow extends { name: string }>(rows: TRow[]) =>
  rows.slice().sort((left, right) => left.name.localeCompare(right.name));

export async function getParents(role: UserRole) {
  ensureAdminRole(role);

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('parents').select(PARENT_SELECT_WITH_JOINS);

  if (error) {
    throw new Error(PARENT_ERROR_MESSAGES.admin.database);
  }

  const parsedParents = ParentWithJoinsListSchema.safeParse(data ?? []);
  if (!parsedParents.success) {
    throw new Error(PARENT_ERROR_MESSAGES.admin.validation);
  }

  return sortByName(parsedParents.data.map(mapParentRow));
}

export async function getParent(userID: number, role: UserRole): Promise<ParentProfileDetail> {
  ensureAdminRole(role);

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('parents')
    .select(PARENT_DETAIL_SELECT_WITH_JOINS)
    .eq('user_id', userID)
    .maybeSingle();

  if (error) {
    throw new Error(PARENT_ERROR_MESSAGES.admin.database);
  }

  if (!data) {
    notFound();
  }

  const parsedParent = ParentDetailWithJoinsSchema.safeParse(data);
  if (!parsedParent.success) {
    throw new Error(PARENT_ERROR_MESSAGES.admin.validation);
  }

  const parent = parsedParent.data;
  const parentRow = mapParentRow(parent);

  return {
    ...parentRow,
    billing_address: parent.billing_address ?? MISSING_VALUE,
    notification_preferences: parent.notification_preferences ?? MISSING_VALUE,
    students: sortByName((parent.students ?? []).map(mapParentStudentRow)),
  };
}
