import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { authorId, postId, content } = await req.json();
  if (!authorId || !postId || !content) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { authorId, postId, content },
  });

  return NextResponse.json({ comment });
} 