import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const surname = formData.get('surname') as string;
  const username = formData.get('username') as string;

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }
  const existsUsername = await prisma.profile.findUnique({ where: { username } });
  if (existsUsername) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      profile: {
        create: {
          name: name || '',
          surname: surname || '',
          username,
        },
      },
    },
    include: { profile: { include: { avatar: true } } },
  });

  if (user.profile) {
    user.profile.avatar = user.profile.avatar?.url || '';
  }

  return NextResponse.json({ user });
} 