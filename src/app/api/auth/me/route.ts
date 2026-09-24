import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import db from '@/lib/db';

export async function GET() {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const fullUser = await db.user.findUnique({
      where: { id: userSession.userId },
      include: { profile: true },
    });

    if (!fullUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
        profile: fullUser.profile,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
