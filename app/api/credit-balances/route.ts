import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isValidRole, USER_ID_COOKIE_NAME, USER_ROLE_COOKIE_NAME } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import {
  BalanceQuerySchema,
  BalanceUpdateSchema,
  CreditBalanceSchema,
  type BalanceQueryInput,
  type BalanceUpdateInput,
} from '@/lib/validators/balances';

type AuthContext =
  | { ok: true; role: 'admin'; parentId?: number }
  | { ok: true; role: 'parent'; parentId: number }
  | { ok: false; response: NextResponse };

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

function getRequiredParentId(auth: Extract<AuthContext, { ok: true }>, parsed: BalanceQueryInput | BalanceUpdateInput) {
  const parentId = auth.role === 'parent' ? auth.parentId : parsed.parent_id;
  if (!parentId) {
    return null;
  }
  return parentId;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = BalanceQuerySchema.safeParse({
    parent_id: url.searchParams.get('parent_id') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request', issues: parsed.error.flatten() }, { status: 400 });
  }

  const auth = await resolveAuthParent(parsed.data.parent_id);
  if (!auth.ok) {
    return auth.response;
  }

  const parentId = getRequiredParentId(auth, parsed.data);
  if (!parentId) {
    return NextResponse.json({ error: 'parent_id is required' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('credit_balances').select('*').eq('parent_id', parentId).maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'No credit balance found for the given parent_id' }, { status: 404 });
  }

  const validated = CreditBalanceSchema.safeParse(data);
  if (!validated.success) {
    return NextResponse.json({ error: 'Unexpected credit balance shape returned from Supabase' }, { status: 500 });
  }

  return NextResponse.json(validated.data);
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BalanceUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request', issues: parsed.error.flatten() }, { status: 400 });
  }

  const auth = await resolveAuthParent(parsed.data.parent_id);
  if (!auth.ok) {
    return auth.response;
  }

  const parentId = getRequiredParentId(auth, parsed.data);
  if (!parentId) {
    return NextResponse.json({ error: 'parent_id is required' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  const { data: parent, error: parentError } = await supabase.from('parents').select('id').eq('id', parentId).single();
  if (parentError) {
    return NextResponse.json({ error: parentError.message }, { status: 500 });
  }

  if (!parent) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('credit_balances')
    .upsert(
      {
        parent_id: parentId,
        amount_available: parsed.data.amount_available,
        amount_pending: parsed.data.amount_pending,
      },
      { onConflict: 'parent_id' }
    )
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const validated = CreditBalanceSchema.safeParse(data);
  if (!validated.success) {
    return NextResponse.json({ error: 'Unexpected credit balance shape returned from Supabase' }, { status: 500 });
  }

  return NextResponse.json(validated.data);
}
