import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getPersonalizedRecommendations } from '@/lib/recommendations';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const recommendations = await getPersonalizedRecommendations(user?.userId, 6);
    return NextResponse.json({ recommendations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
