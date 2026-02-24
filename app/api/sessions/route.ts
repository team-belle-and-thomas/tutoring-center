// app/api/sessions/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import {
  CANCELED_SESSION_STATUS,
  DEFAULT_SESSION_STATUS,
  SESSION_SELECT_FIELDS,
  SESSION_SELECT_WITH_JOINS,
} from '@/lib/supabase/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import {
  SessionCreateSchema,
  SessionListQuerySchema,
  SessionWithJoinsListSchema,
  type SessionWithJoins,
} from '@/lib/validators/sessions';

type SessionApiRow = Omit<SessionWithJoins, 'student' | 'tutor' | 'parent'> & {
  student: Record<string, unknown> | null;
  tutor: Record<string, unknown> | null;
  parent: Record<string, unknown> | null;
};

export async function GET(req: Request) {
  const url = new URL(req.url);

  const parsed = SessionListQuerySchema.safeParse({
    kind: url.searchParams.get('kind') ?? undefined,

    parent_id: url.searchParams.get('parent_id') ?? undefined,
    tutor_id: url.searchParams.get('tutor_id') ?? undefined,
    student_id: url.searchParams.get('student_id') ?? undefined,
    subject_id: url.searchParams.get('subject_id') ?? undefined,

    status: url.searchParams.get('status') ?? undefined,

    page: url.searchParams.get('page') ?? undefined,
    page_size: url.searchParams.get('page_size') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { kind, parent_id, tutor_id, student_id, subject_id, status, page, page_size } = parsed.data;

  const from = (page - 1) * page_size;
  const to = from + page_size - 1;

  const supabase = createSupabaseServiceClient();
  const nowIso = new Date().toISOString();

  // Count first to avoid 416 errors for out-of-range pages
  let countQuery = supabase.from('sessions').select('id', { count: 'exact', head: true });

  if (parent_id) countQuery = countQuery.eq('parent_id', parent_id);
  if (tutor_id) countQuery = countQuery.eq('tutor_id', tutor_id);
  if (student_id) countQuery = countQuery.eq('student_id', student_id);
  if (subject_id) countQuery = countQuery.eq('subject_id', subject_id);
  if (status) countQuery = countQuery.eq('status', status);

  if (kind === 'upcoming') countQuery = countQuery.gte('scheduled_at', nowIso);
  if (kind === 'past') countQuery = countQuery.lt('scheduled_at', nowIso);

  const { error: countErr, count } = await countQuery;
  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / page_size);

  if (total === 0 || from >= total) {
    return NextResponse.json({
      data: [],
      page,
      page_size,
      total,
      totalPages,
      hasNextPage: false,
      hasPrevPage: page > 1,
      filters: { kind, parent_id, tutor_id, student_id, subject_id, status },
    });
  }

  let q = supabase.from('sessions').select(SESSION_SELECT_WITH_JOINS).range(from, to);

  if (parent_id) q = q.eq('parent_id', parent_id);
  if (tutor_id) q = q.eq('tutor_id', tutor_id);
  if (student_id) q = q.eq('student_id', student_id);
  if (subject_id) q = q.eq('subject_id', subject_id);
  if (status) q = q.eq('status', status);

  if (kind === 'upcoming') q = q.gte('scheduled_at', nowIso);
  if (kind === 'past') q = q.lt('scheduled_at', nowIso);

  if (kind === 'upcoming') q = q.order('scheduled_at', { ascending: true });
  else q = q.order('scheduled_at', { ascending: false });

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Validate the joined shape so we don't guess at nested fields
  const joinedParsed = SessionWithJoinsListSchema.safeParse(data ?? []);
  if (!joinedParsed.success) {
    return NextResponse.json({ error: 'Unexpected sessions join shape returned from Supabase' }, { status: 500 });
  }

  const normalized: SessionApiRow[] = joinedParsed.data.map((row: SessionWithJoins) => {
    const student = pickFirstEmbedded(row.student) as Record<string, unknown> | null;
    const tutor = pickFirstEmbedded(row.tutor) as Record<string, unknown> | null;
    const parent = pickFirstEmbedded(row.parent) as Record<string, unknown> | null;

    return {
      ...row,
      student,
      tutor,
      parent,
    };
  });

  return NextResponse.json({
    data: normalized,
    page,
    page_size,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1 && totalPages > 0,
    filters: { kind, parent_id, tutor_id, student_id, subject_id, status },
  });
}

export async function POST(req: Request) {
  const supabase = createSupabaseServiceClient();

  const body = await req.json().catch(() => null);
  const parsed = SessionCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', issues: parsed.error.flatten() }, { status: 400 });
  }

  const s = parsed.data;

  // Overlap protection: existing.start < new.end AND existing.end > new.start
  // Ignore canceled sessions
  const { data: overlaps, error: overlapErr } = await supabase
    .from('sessions')
    .select('id')
    .eq('tutor_id', s.tutor_id)
    .neq('status', CANCELED_SESSION_STATUS)
    .lt('scheduled_at', s.ends_at)
    .gt('ends_at', s.scheduled_at)
    .limit(1);

  if (overlapErr) return NextResponse.json({ error: overlapErr.message }, { status: 500 });

  if (overlaps && overlaps.length > 0) {
    return NextResponse.json({ error: 'Tutor already has a session in that time range' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      tutor_id: s.tutor_id,
      student_id: s.student_id,
      subject_id: s.subject_id,
      parent_id: s.parent_id,
      slot_units: s.slot_units,
      scheduled_at: s.scheduled_at,
      ends_at: s.ends_at,
      status: s.status ?? DEFAULT_SESSION_STATUS,
    })
    .select(SESSION_SELECT_FIELDS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}
