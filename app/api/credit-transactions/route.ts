import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isValidRole, USER_ID_COOKIE_NAME, USER_ROLE_COOKIE_NAME } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import {
  TransactionCreateSchema,
  TransactionListQuerySchema,
  TransactionsWithJoinsListSchema,
  type TransactionCreateInput,
  type TransactionListQueryInput,
  type TransactionsWithJoins,
} from '@/lib/validators/transactions';

type AuthContext =
  | { ok: true; role: 'admin'; parentId?: number }
  | { ok: true; role: 'parent'; parentId: number }
  | { ok: false; response: NextResponse };

type TransactionApiRow = Omit<TransactionsWithJoins, 'parent' | 'student' | 'session'> & {
  parent: Record<string, unknown> | null;
  student: Record<string, unknown> | null;
  session: Record<string, unknown> | null;
};

const CREDIT_TRANSACTION_SELECT_WITH_JOINS = `
  id,
  amount,
  balance_after,
  created_at,
  parent_id,
  session_id,
  student_id,
  type,
  parent:parents (
    id,
    users:user_id ( first_name, last_name, email )
  ),
  student:students (
    id,
    parent_id,
    users:user_id ( first_name, last_name, email )
  ),
  session:sessions (
    id,
    scheduled_at,
    ends_at,
    status
  )
` as const;

async function resolveAuthParent(requestedParentId?: number): Promise<AuthContext> {
  const cookieStore = await cookies();
  const role = cookieStore.get(USER_ROLE_COOKIE_NAME)?.value;
  const userIdRaw = cookieStore.get(USER_ID_COOKIE_NAME)?.value;

  if (!isValidRole(role)) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  if (role === 'tutor') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  if (role === 'admin') {
    return { ok: true, role, parentId: requestedParentId };
  }

  const userId = Number.parseInt(userIdRaw ?? '', 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const supabase = createSupabaseServiceClient();
  const { data: parent, error } = await supabase.from('parents').select('id').eq('user_id', userId).single();

  if (error || !parent) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true, role, parentId: parent.id };
}

function getScopedParentId(
  auth: Extract<AuthContext, { ok: true }>,
  parsed: TransactionCreateInput | TransactionListQueryInput
) {
  return auth.role === 'parent' ? auth.parentId : parsed.parent_id;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = TransactionListQuerySchema.safeParse({
    parent_id: url.searchParams.get('parent_id') ?? undefined,
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

  const auth = await resolveAuthParent(parsed.data.parent_id);
  if (!auth.ok) {
    return auth.response;
  }

  const parentId = getScopedParentId(auth, parsed.data);
  const { student_id, session_id, type, start_date, end_date, page, page_size } = parsed.data;
  const from = (page - 1) * page_size;
  const to = from + page_size - 1;

  const supabase = createSupabaseServiceClient();

  let countQuery = supabase.from('credit_transactions').select('id', { count: 'exact', head: true });

  if (parentId) countQuery = countQuery.eq('parent_id', parentId);
  if (student_id) countQuery = countQuery.eq('student_id', student_id);
  if (session_id) countQuery = countQuery.eq('session_id', session_id);
  if (type !== 'All') countQuery = countQuery.eq('type', type);
  if (start_date) countQuery = countQuery.gte('created_at', start_date);
  if (end_date) countQuery = countQuery.lte('created_at', end_date);

  const { error: countError, count } = await countQuery;
  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

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
      filters: { parent_id: parentId, student_id, session_id, type, start_date, end_date },
    });
  }

  let dataQuery = supabase
    .from('credit_transactions')
    .select(CREDIT_TRANSACTION_SELECT_WITH_JOINS)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (parentId) dataQuery = dataQuery.eq('parent_id', parentId);
  if (student_id) dataQuery = dataQuery.eq('student_id', student_id);
  if (session_id) dataQuery = dataQuery.eq('session_id', session_id);
  if (type !== 'All') dataQuery = dataQuery.eq('type', type);
  if (start_date) dataQuery = dataQuery.gte('created_at', start_date);
  if (end_date) dataQuery = dataQuery.lte('created_at', end_date);

  const { data, error } = await dataQuery;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const joinedParsed = TransactionsWithJoinsListSchema.safeParse(data ?? []);
  if (!joinedParsed.success) {
    return NextResponse.json(
      { error: 'Unexpected credit transactions join shape returned from Supabase' },
      { status: 500 }
    );
  }

  const normalized: TransactionApiRow[] = joinedParsed.data.map((row: TransactionsWithJoins) => ({
    ...row,
    parent: pickFirstEmbedded(row.parent) as Record<string, unknown> | null,
    student: pickFirstEmbedded(row.student) as Record<string, unknown> | null,
    session: pickFirstEmbedded(row.session) as Record<string, unknown> | null,
  }));

  return NextResponse.json({
    data: normalized,
    page,
    page_size,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    filters: { parent_id: parentId, student_id, session_id, type, start_date, end_date },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = TransactionCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body', issues: parsed.error.flatten() }, { status: 400 });
  }

  const auth = await resolveAuthParent(parsed.data.parent_id);
  if (!auth.ok) {
    return auth.response;
  }

  const parentId = getScopedParentId(auth, parsed.data);
  if (!parentId) {
    return NextResponse.json({ error: 'parent_id is required' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('credit_transactions')
    .insert({
      parent_id: parentId,
      session_id: parsed.data.session_id ?? null,
      student_id: parsed.data.student_id,
      amount: parsed.data.amount,
      balance_after: parsed.data.balance_after,
      type: parsed.data.type,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
