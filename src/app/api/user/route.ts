import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const sort = searchParams.get('sort');
  if (sort === 'popular') {
    // Топ-10 профилей по количеству подписчиков
    const profiles = await prisma.profile.findMany({
      include: {
        avatar: true,
        user: {
          include: {
            followers: true,
          },
        },
      },
    });
    const sorted = profiles
      .map(p => ({
        username: p.username,
        name: p.name,
        surname: p.surname,
        avatar: p.avatar?.url || '',
        followersCount: p.user?.followers?.length || 0,
      }))
      .sort((a, b) => b.followersCount - a.followersCount)
      .slice(0, 10);
    return NextResponse.json({ profiles: sorted });
  }
  if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: { include: { avatar: true } },
      posts: { include: { image: true, likes: true }, orderBy: { createdAt: 'desc' } },
      likes: true,
      followers: true,
      following: true,
      saves: true,
    },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ user });
} 