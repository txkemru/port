import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const viewerId = searchParams.get('viewerId');
  if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 });

  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      user: {
        include: {
          posts: {
            include: {
              image: true,
              likes: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          followers: true,
          following: true,
        },
      },
      avatar: true,
    },
  });
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const posts = profile.user.posts.map(post => ({
    id: post.id,
    imageUrl: post.image?.url || '',
    description: post.description,
    likesCount: post.likes.length,
    likedByMe: viewerId ? post.likes.some(like => like.userId === viewerId) : false,
  }));

  const likesCount = profile.user.posts.reduce((acc, post) => acc + post.likes.length, 0);
  const followersCount = profile.user.followers.length;
  const isFollowing = !!profile.user.followers.find(f => f.followerId === viewerId);

  return NextResponse.json({
    profile: {
      name: profile.name,
      surname: profile.surname,
      username: profile.username,
      avatar: profile.avatar?.url || '',
      description: profile.description,
      telegram: profile.telegram,
      instagram: profile.instagram,
      postsCount: posts.length,
      likesCount,
      followersCount,
      isFollowing,
      publications: posts,
    },
  });
} 