import { NextResponse } from 'next/server';
import { getCurrentUserName } from '@/lib/auth';

export async function GET() {
  try {
    const name = await getCurrentUserName();
    return NextResponse.json({ name });
  } catch (error) {
    console.error('Error in /api/user-name:', error);
    return NextResponse.json({ error: 'Failed to fetch user name' }, { status: 500 });
  }
}
