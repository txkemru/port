import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  if (!username) return NextResponse.json({ free: false });
  const exists = await prisma.profile.findUnique({ where: { username } });
  return NextResponse.json({ free: !exists });
} 