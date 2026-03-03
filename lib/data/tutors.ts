import 'server-only';
import { cookies } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { TUTOR_SELECT_WITH_JOINS } from '@/lib/supabase/types';
import type { UserRole } from '@/lib/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import { TutorWithJoinsListSchema, type TutorWithJoins } from '@/lib/validators/tutors';

export type TutorRow = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  education: string;
  verified: boolean;
  years_experience: number;
};

type TutorLoadErrorReason = 'database' | 'validation';

const TUTOR_ERROR_MESSAGES = {
  admin: {
    database: 'Tutor data is temporarily unavailable. Please retry in a moment.',
    validation: 'Tutor data format is invalid. Please try again later.',
  },
} as const;

const isValidRole = (value: unknown): value is UserRole => value === 'admin' || value === 'parent' || value === 'tutor';

export async function getUserRole() {
  const cookieStore = await cookies();
  const role = cookieStore.get('user-role')?.value;
  if (!isValidRole(role)) {
    redirect('/login?redirect=/auth/logout');
  }

  if (role !== 'admin') {
    redirect('/dashboard');
  }

  return role;
}

const parseTutorUser = (users: TutorWithJoins['users']) => {
  const user = pickFirstEmbedded(users);

  return {
    name: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
    email: user?.email ?? '',
    phone: user?.phone ?? '—',
  };
};

const mapTutorRow = (
  tutor: Pick<TutorWithJoins, 'id' | 'user_id' | 'verified' | 'education' | 'years_experience' | 'users'>
) => {
  const user = parseTutorUser(tutor.users);

  return {
    id: tutor.id,
    user_id: tutor.user_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    education: tutor.education ?? '—',
    verified: tutor.verified,
    years_experience: tutor.years_experience ?? 0,
  };
};

export async function getTutors(role: UserRole) {
  if (!isValidRole(role)) {
    throw new Error('Role is required to fetch tutors.');
  }

  if (role !== 'admin') {
    forbidden();
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('tutors').select(TUTOR_SELECT_WITH_JOINS);

  if (error) {
    throw new Error(TUTOR_ERROR_MESSAGES.admin.database);
  }

  const parsedTutors = TutorWithJoinsListSchema.safeParse(data ?? []);
  if (!parsedTutors.success) {
    throw new Error(TUTOR_ERROR_MESSAGES.admin.validation);
  }

  return parsedTutors.data.map(mapTutorRow);
}
