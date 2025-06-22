import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  if (!q) return NextResponse.json({ users: [], posts: [] });

  const users = await prisma.profile.findMany({
    where: {
      OR: [
        { username: { contains: q } },
        { name: { contains: q } },
        { surname: { contains: q } },
      ],
    },
    take: 10,
    include: {
      avatar: true,
      user: {
        include: {
          posts: { include: { likes: true } },
          followers: true,
        },
      },
    },
  });

  const usersWithCounts = users.map(u => {
    const postsCount = u.user?.posts?.length || 0;
    const followersCount = u.user?.followers?.length || 0;
    const likesCount = u.user?.posts?.reduce((acc, post) => acc + (post.likes?.length || 0), 0) || 0;
    return {
      username: u.username,
      name: u.name,
      surname: u.surname,
      avatar: u.avatar?.url || '',
      postsCount,
      followersCount,
      likesCount,
    };
  });

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { description: { contains: q } },
      ],
    },
    take: 20,
    include: { image: true, author: { include: { profile: true } } },
  });

  return NextResponse.json({
    users: usersWithCounts,
    posts: posts.map(post => ({
      id: post.id,
      imageUrl: post.image?.url || '',
      description: post.description,
      author: {
        username: post.author.profile?.username || '',
        name: post.author.profile?.name || '',
        surname: post.author.profile?.surname || '',
      },
    })),
  });
} 