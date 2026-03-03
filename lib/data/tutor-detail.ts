import 'server-only';
import { notFound } from 'next/navigation';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { TUTOR_SELECT_WITH_JOINS } from '@/lib/supabase/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import { TutorWithJoinsSchema, type TutorWithJoins } from '@/lib/validators/tutors';

export { getUserRole } from '@/lib/auth';

export type TutorDetailType = {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  education: string;
  bio: string;
  tagline: string;
  verified: boolean;
  years_experience: number;
};

const mapTutorDetail = (tutor: TutorWithJoins): TutorDetailType => {
  const user = pickFirstEmbedded(tutor.users);

  return {
    id: tutor.id,
    user_id: tutor.user_id,
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '—',
    education: tutor.education ?? '—',
    bio: tutor.bio ?? '—',
    tagline: tutor.tagline ?? '—',
    verified: tutor.verified,
    years_experience: tutor.years_experience ?? 0,
  };
};

export async function getTutor(id: number): Promise<TutorDetailType> {
  const supabase = createSupabaseServiceClient();

  // Query by tutor's actual id (not user_id)
  const { data, error } = await supabase.from('tutors').select(TUTOR_SELECT_WITH_JOINS).eq('id', id).single();

  if (error || !data) {
    notFound();
  }

  const parsedTutor = TutorWithJoinsSchema.safeParse(data);
  if (!parsedTutor.success) {
    notFound();
  }

  return mapTutorDetail(parsedTutor.data);
}
