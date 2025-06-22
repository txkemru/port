import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const profiles = await prisma.profile.findMany({
    select: { id: true, userId: true, username: true }
  });
  return NextResponse.json({ profiles });
} 