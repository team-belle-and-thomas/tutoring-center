import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isValidRole, USER_ID_COOKIE_NAME, USER_ROLE_COOKIE_NAME } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { CREDIT_TRANSACTION_SELECT_WITH_JOINS } from '@/lib/supabase/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import {
  TransactionCreateSchema,
  TransactionListQuerySchema,
  TransactionsWithJoins,
  TransactionsWithJoinsListSchema,
} from '@/lib/validators/transactions';

async function resolveParentId(requestedParentId?: number, options?: { requireParentIdForAdmin?: boolean }) {
  const cookieStore = await cookies();
  const role = cookieStore.get(USER_ROLE_COOKIE_NAME)?.value;
  const userIdRaw = cookieStore.get(USER_ID_COOKIE_NAME)?.value;

  if (!isValidRole(role)) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (role === 'tutor') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  if (role === 'admin') {
    if (options?.requireParentIdForAdmin && !requestedParentId) {
      return { response: NextResponse.json({ error: 'parent_id is required' }, { status: 400 }) };
    }

    return { parentId: requestedParentId };
  }

  const userId = Number.parseInt(userIdRaw ?? '', 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const supabase = createSupabaseServiceClient();
  const { data: parent, error: parentError } = await supabase
    .from('parents')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (parentError || !parent) {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { parentId: parent.id };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parentIdRaw = url.searchParams.get('parent_id');
  const requestedParentId = parentIdRaw ? Number.parseInt(parentIdRaw, 10) : undefined;
  const resolvedParent = await resolveParentId(requestedParentId);
  if (resolvedParent.response) {
    return resolvedParent.response;
  }

  const parsed = TransactionListQuerySchema.safeParse({
    parent_id: resolvedParent.parentId,
    student_id: url.searchParams.get('student_id') ?? undefined,
    session_id: url.searchParams.get('session_id') ?? undefined,
    type: url.searchParams.get('type') ?? undefined,
    start_date: url.searchParams.get('start_date') ?? undefined,
    end_date: url.searchParams.get('end_date') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    page_size: url.searchParams.get('page_size') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { parent_id, student_id, session_id, type, start_date, end_date, page, page_size } = parsed.data;

  const from = (page - 1) * page_size;
  const to = from + page_size - 1;

  const supabase = createSupabaseServiceClient();

  // Count first to avoid out of range errors
  let countQuery = supabase.from('credit_transactions').select('id', { count: 'exact', head: true });

  if (parent_id) countQuery = countQuery.eq('parent_id', parent_id);
  if (student_id) countQuery = countQuery.eq('student_id', student_id);
  if (session_id) countQuery = countQuery.eq('session_id', session_id);
  if (type && type !== 'All') countQuery = countQuery.eq('type', type);

  const { error: countErr, count } = await countQuery;
  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });

  const total = count || 0;
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
      filters: { parent_id, student_id, session_id, type, start_date, end_date },
    });
  }

  let dataQuery = supabase.from('credit_transactions').select(CREDIT_TRANSACTION_SELECT_WITH_JOINS).range(from, to);

  if (parent_id) dataQuery = dataQuery.eq('parent_id', parent_id);
  if (student_id) dataQuery = dataQuery.eq('student_id', student_id);
  if (session_id) dataQuery = dataQuery.eq('session_id', session_id);
  if (type && type !== 'All') dataQuery = dataQuery.eq('type', type);
  if (start_date) dataQuery = dataQuery.gte('created_at', start_date);
  if (end_date) dataQuery = dataQuery.lte('created_at', end_date);

  const { error: dataErr, data } = await dataQuery.range(from, to);
  if (dataErr) return NextResponse.json({ error: dataErr.message }, { status: 500 });

  // Validate the joined shape
  const joinParsed = TransactionsWithJoinsListSchema.safeParse(data ?? []);
  if (!joinParsed.success) {
    return NextResponse.json({ error: 'Unexpected sessions join shape returned from Supabase' }, { status: 500 });
  }

  const normalizedData = joinParsed.data.map((row: TransactionsWithJoins) => {
    const parent = pickFirstEmbedded(row.parent) as Record<string, unknown> | null;
    const student = pickFirstEmbedded(row.student) as Record<string, unknown> | null;
    const session = pickFirstEmbedded(row.session) as Record<string, unknown> | null;
    return { ...row, parent, student, session };
  });

  return NextResponse.json({
    data: normalizedData,
    page,
    page_size,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    filters: { parent_id, student_id, session_id, type, start_date, end_date },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const requestedParentId =
    body && typeof body === 'object' && 'parent_id' in body && typeof body.parent_id === 'number'
      ? body.parent_id
      : undefined;
  const resolvedParent = await resolveParentId(requestedParentId, { requireParentIdForAdmin: true });
  if (resolvedParent.response) {
    return resolvedParent.response;
  }

  const parsed = TransactionCreateSchema.safeParse({
    ...(body && typeof body === 'object' ? body : {}),
    parent_id: resolvedParent.parentId,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', issues: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { parent_id, session_id, student_id, amount, balance_after, type } = parsed.data;

  const { data, error } = await supabase
    .from('credit_transactions')
    .insert({
      parent_id,
      session_id,
      student_id,
      amount,
      balance_after,
      type,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
