import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const username = searchParams.get('username');
  const sort = searchParams.get('sort');
  const skip = (page - 1) * limit;

  // Фильтрация по username, если есть
  let where: any = {};
  if (username) {
    where = { author: { profile: { username } } };
  }

  let orderBy: any = { createdAt: 'desc' };
  let topLimit = limit;
  if (sort === 'popular') {
    orderBy = { likes: { _count: 'desc' } };
    topLimit = 10;
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: topLimit,
      include: {
        image: true,
        likes: true,
        author: { include: { profile: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const result = posts.map(post => ({
    id: post.id,
    imageUrl: post.image?.url || '',
    description: post.description,
    likesCount: post.likes.length,
    likedByMe: userId ? post.likes.some(like => like.userId === userId) : false,
    author: {
      username: post.author.profile?.username || '',
      avatar: post.author.profile?.avatar || '',
    },
  }));

  return NextResponse.json({ posts: result, total });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  const description = formData.get('description') as string;
  const userId = formData.get('userId') as string;
  if (!file || typeof file === 'string' || !userId) {
    return NextResponse.json({ error: 'No file or userId' }, { status: 400 });
  }
  // Сохраняем файл
  const ext = (file as any).name.split('.').pop();
  const filename = `${uuidv4()}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const arrayBuffer = await (file as Blob).arrayBuffer();
  await fs.writeFile(path.join(uploadDir, filename), Buffer.from(arrayBuffer));
  const fileUrl = `/uploads/${filename}`;
  // Создаем File и Post в БД
  const dbFile = await prisma.file.create({ data: { url: fileUrl } });
  const post = await prisma.post.create({
    data: {
      authorId: userId,
      imageId: dbFile.id,
      description,
    },
    include: { image: true },
  });
  return NextResponse.json({
    id: post.id,
    imageUrl: post.image?.url || '',
    description: post.description,
    likesCount: 0,
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'No id provided' }, { status: 400 });
  try {
    // Находим публикацию и файл
    const post = await prisma.post.findUnique({ where: { id }, include: { image: true } });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // Удаляем все лайки и сохранения, связанные с этим постом
    await prisma.like.deleteMany({ where: { postId: id } });
    await prisma.save.deleteMany({ where: { postId: id } });
    // Удаляем файл из файловой системы
    if (post.image?.url) {
      const filePath = path.join(process.cwd(), 'public', post.image.url);
      try { await fs.unlink(filePath); } catch {}
    }
    // Удаляем файл из базы
    if (post.imageId) await prisma.file.delete({ where: { id: post.imageId } });
    // Удаляем саму публикацию
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
} 