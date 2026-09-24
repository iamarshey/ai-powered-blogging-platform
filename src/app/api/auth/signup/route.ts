import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
  try {
    const { email, password, name, username, role } = await req.json();

    if (!email || !password || !name || !username) {
      return NextResponse.json({ error: 'Missing required registration fields' }, { status: 400 });
    }

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { profile: { username } }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or username already in use' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'AUTHOR' || role === 'ADMIN' ? role : 'READER';

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role: assignedRole,
        profile: {
          create: {
            name,
            username: username.toLowerCase().trim(),
            bio: `${assignedRole} on AI Blogging Platform`,
          },
        },
      },
      include: { profile: true },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.profile!.username,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.profile!.name,
        username: user.profile!.username,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}
