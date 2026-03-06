import { NextResponse } from 'next/server';
import { addGrade } from '@/lib/data/grades';
import { GradeInputSchema } from '@/lib/validators/grades';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const parsed = GradeInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const grade = await addGrade(parsed.data);
    return NextResponse.json({ data: grade }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('permission') || message.includes('forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
