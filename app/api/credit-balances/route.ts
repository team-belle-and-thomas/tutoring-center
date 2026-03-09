import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { BalanceQuerySchema, BalanceUpdateSchema } from '@/lib/validators/balances';

export async function GET(req: Request) {
  const url = new URL(req.url);

  const parsed = BalanceQuerySchema.safeParse({
    parent_id: url.searchParams.get('parent_id') ?? undefined,
    student_id: url.searchParams.get('student_id') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { parent_id } = parsed.data;

  const supabase = createSupabaseServiceClient();

  const query = supabase.from('credit_balances').select('*').eq('parent_id', parent_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'No credit balance found for the given parent_id' }, { status: 404 });
  }

  return NextResponse.json(data[0]);
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BalanceUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { parent_id, amount_available, amount_pending } = parsed.data;

  const supabase = createSupabaseServiceClient();

  const { error: parentError } = await supabase.from('parents').select('id').eq('id', parent_id).single();
  if (parentError) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('credit_balances')
    .upsert(
      {
        parent_id,
        amount_available,
        amount_pending,
      },
      { onConflict: 'parent_id' }
    )
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
