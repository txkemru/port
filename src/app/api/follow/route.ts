import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { followerId, username } = await req.json();
  if (!followerId || !username) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const profile = await prisma.profile.findUnique({ where: { username } });
  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const followingId = profile.userId;
  if (followerId === followingId) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ status: 'unfollowed' });
  } else {
    await prisma.follow.create({ data: { followerId, followingId } });
    return NextResponse.json({ status: 'followed' });
  }
} 