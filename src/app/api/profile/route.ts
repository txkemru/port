import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export async function GET(req: NextRequest) {
  // ... существующий GET ...
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  // ... остальной код ...
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId') as string;
    console.log('Avatar upload: userId =', userId);
    if (!file || typeof file === 'string' || !userId) {
      return NextResponse.json({ error: 'No file or userId' }, { status: 400 });
    }
    // Проверка существования профиля
    const profileExists = await prisma.profile.findUnique({ where: { userId } });
    if (!profileExists) {
      console.error('Profile not found for userId:', userId);
      return NextResponse.json({ error: 'Profile not found for this userId' }, { status: 404 });
    }
    // Проверка размера файла (до 10 МБ)
    const MAX_SIZE = 10 * 1024 * 1024;
    if ((file as Blob).size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }
    // Проверка типа файла (только изображения)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes((file as Blob).type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 415 });
    }
    // Сохраняем файл
    const ext = (file as any).name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const arrayBuffer = await (file as Blob).arrayBuffer();
    await fs.writeFile(path.join(uploadDir, filename), Buffer.from(arrayBuffer));
    const fileUrl = `/uploads/${filename}`;
    // Создаем File в БД
    const dbFile = await prisma.file.create({ data: { url: fileUrl } });
    // Обновляем профиль
    const profile = await prisma.profile.update({
      where: { userId },
      data: { avatarId: dbFile.id },
      include: { avatar: true },
    });
    return NextResponse.json({ avatar: profile.avatar?.url || '' });
  } catch (e) {
    console.error('Avatar upload error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, surname, username, telegram, instagram, description } = body;
    if (!userId) {
      return NextResponse.json({ error: 'No userId' }, { status: 400 });
    }
    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        name,
        surname,
        username,
        telegram,
        instagram,
        description,
      },
      include: { avatar: true },
    });
    return NextResponse.json({
      ...profile,
      avatar: profile.avatar?.url || '',
    });
  } catch (e) {
    console.error('Profile update error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 