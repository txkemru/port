import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: { include: { avatar: true } } },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

  // Добавляю userId и avatar url в profile
  const profileWithUserId = {
    ...user.profile,
    userId: user.id,
    avatar: user.profile?.avatar?.url || '',
  };

  // Можно добавить установку cookie/session тут
  return NextResponse.json({
    id: user.id,
    email: user.email,
    profile: profileWithUserId,
  });
} 