import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AVAILABLE_SLOTS_ERROR_MESSAGES, getAvailableSlots } from '@/lib/data/available-sessions';
import { USER_ROLE_COOKIE_NAME } from '@/lib/mock-api';
import { AvailableSessionsQuerySchema } from '@/lib/validators/sessions';
import { id } from '@/lib/validators/shared';
import { z } from 'zod';

const TutorParamsSchema = z.object({ id });
const ALLOWED_ROLE = 'parent';

type TutorAvailableSessionsRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: TutorAvailableSessionsRouteContext) {
  const cookieStore = await cookies();
  const role = cookieStore.get(USER_ROLE_COOKIE_NAME)?.value;

  if (!role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (role !== ALLOWED_ROLE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsedParams = TutorParamsSchema.safeParse(await context.params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Bad request', issues: parsedParams.error.flatten() }, { status: 400 });
  }

  const url = new URL(req.url);
  const parsedQuery = AvailableSessionsQuerySchema.safeParse({
    subject_id: url.searchParams.get('subject_id') ?? undefined,
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: 'Bad request', issues: parsedQuery.error.flatten() }, { status: 400 });
  }

  try {
    const data = await getAvailableSlots(
      parsedParams.data.id,
      parsedQuery.data.subject_id,
      parsedQuery.data.from,
      parsedQuery.data.to
    );

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === AVAILABLE_SLOTS_ERROR_MESSAGES.tutorSubject) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: AVAILABLE_SLOTS_ERROR_MESSAGES.database }, { status: 500 });
  }
}
