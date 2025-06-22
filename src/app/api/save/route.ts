import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { userId, postId } = await req.json();
  if (!userId || !postId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const existing = await prisma.save.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.save.delete({ where: { id: existing.id } });
    return NextResponse.json({ status: 'unsaved' });
  } else {
    await prisma.save.create({ data: { userId, postId } });
    return NextResponse.json({ status: 'saved' });
  }
} 