"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import EditProfileModal from '../../../components/EditProfileModal';
import SettingsModal from '../../../components/SettingsModal';
import { FaTelegramPlane, FaInstagram, FaHeart, FaRegHeart, FaTrashAlt } from 'react-icons/fa';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Loader from '../../../components/Loader';
import EmptyState from '../../../components/EmptyState';
import ErrorMessage from '../../../components/ErrorMessage';
import AuthModal from '../../../components/AuthModal';
import StaticGif from '../../../components/StaticGif';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function PublicProfilePage() {
  const params = useParams() || {};
  const username = Array.isArray(params.username) ? params.username[0] : params.username || '';
  const { profile: viewer, setProfile } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [publicationDesc, setPublicationDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [publications, setPublications] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgHeight, setImgHeight] = useState<number | undefined>(undefined);
  const [imgWidth, setImgWidth] = useState<number | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const viewerUserId = viewer?.userId || viewer?.id || '';
  const scrollYRef = useRef(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Jiggle keyframes
  const jiggleStyle = {
    animation: 'jiggle 0.33s infinite',
  };

  function handleDragEnd(event: any) {
    const {active, over} = event;
    if (active.id !== over.id) {
      setPublications((items) => {
        const oldIndex = items.findIndex((i) => (i.id || i._id) === active.id);
        const newIndex = items.findIndex((i) => (i.id || i._id) === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function SortableItem({img, i, children}: any) {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: img.id || img._id || i});
    const id = img.id || img._id || i;
    return (
      <div style={{position: 'relative'}}>
        {editMode && (
          <button
            onClick={() => setDeleteId(id)}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              zIndex: 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#bbb',
              color: '#fff',
              border: '3px solid #fff',
              fontWeight: 900,
              fontSize: 28,
              cursor: 'pointer',
              boxShadow: '0 2px 12px #0007',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.18s',
              pointerEvents: 'auto',
            }}
            title="Удалить публикацию"
          >×</button>
        )}
        <div
          ref={setNodeRef}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
            ...(editMode ? jiggleStyle : {}),
          }}
          {...(editMode ? listeners : {})}
          {...(editMode ? attributes : {})}
        >
          {children}
        </div>
      </div>
    );
  }

  // Модалка подтверждения удаления
  function DeleteModal({onConfirm, onCancel}: {onConfirm: () => void, onCancel: () => void}) {
    return (
      <div style={{position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{background: '#222', color: '#fff', borderRadius: 18, padding: '32px 28px 24px 28px', minWidth: 260, boxShadow: '0 4px 32px #000a', textAlign: 'center', border: '2px solid #fff'}}>
          <div style={{fontSize: 20, fontWeight: 700, marginBottom: 18}}>Удалить публикацию?</div>
          <div style={{fontSize: 15, color: '#bbb', marginBottom: 24}}>Вы уверены, что хотите удалить эту публикацию? Это действие необратимо.</div>
          <div style={{display: 'flex', gap: 16, justifyContent: 'center'}}>
            <button onClick={onCancel} style={{padding: '8px 22px', borderRadius: 8, border: '1.5px solid #fff', background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer'}}>Отмена</button>
            <button onClick={onConfirm} style={{padding: '8px 22px', borderRadius: 8, border: '1.5px solid #fff', background: '#e53935', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer'}}>Удалить</button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`/api/user-profile?username=${username}&viewerId=${viewerUserId}`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки профиля');
        return res.json();
      })
      .then(res => {
        setData(res);
        setPublications(res?.profile?.publications || []);
      })
      .catch(e => {
        setError(e.message || 'Ошибка загрузки профиля');
        setData(null);
        setPublications([]);
      })
      .finally(() => setLoading(false));
  }, [username, viewerUserId]);

  const handleFollow = async () => {
    if (!viewer?.id) {
      setShowAuth(true);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: viewer.id, username }),
      });
      if (!res.ok) throw new Error('Ошибка подписки');
      await refreshProfile(true);
    } catch (e) {
      setError('Ошибка при попытке подписки');
    }
    setSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Только изображения (jpg, png, webp, gif)');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Максимальный размер 10MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSavePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !imagePreview) return;
    if (!viewer?.userId) {
      setShowAuth(true);
      return;
    }
    setSubmitting(true);
    setImageError('');
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('description', publicationDesc);
      formData.append('userId', viewer?.userId || '');
      const res = await fetch('/api/publications', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Ошибка загрузки публикации');
      const pub = await res.json();
      setPublications(prev => [pub, ...prev]);
      setImageFile(null);
      setImagePreview(null);
      setPublicationDesc('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setImageError('Ошибка загрузки публикации');
    }
    setSubmitting(false);
  };

  // Функция для обновления профиля с сервера
  const refreshProfile = async (suppressLoading = false) => {
    if (!suppressLoading) setLoading(true);
    const res = await fetch(`/api/user-profile?username=${username}&viewerId=${viewerUserId}`);
    const json = await res.json();
    setData(json);
    setPublications(json?.profile?.publications || []);
    if (!suppressLoading) setLoading(false);
  };

  // Отключаем скролл заднего фона при открытой модалке
  useEffect(() => {
    if (selectedPost) {
      scrollYRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollYRef.current}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      if (document.body.style.top) {
        const y = -parseInt(document.body.style.top || '0', 10);
        document.body.style.top = '';
        window.scrollTo(0, y);
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      if (document.body.style.top) {
        const y = -parseInt(document.body.style.top || '0', 10);
        document.body.style.top = '';
        window.scrollTo(0, y);
      }
    };
  }, [selectedPost]);

  // Следим за высотой изображения
  useEffect(() => {
    if (imgRef.current) {
      setImgHeight(imgRef.current.clientHeight);
    }
    setImgLoaded(false);
    setModalVisible(false);
    const timer = setTimeout(() => setModalVisible(true), 10);
    return () => clearTimeout(timer);
  }, [selectedPost?.id]);

  // --- Лайки ---
  const handleLike = async (postId: string) => {
    if (!viewer?.id) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: viewer.id }),
      });
      if (!res.ok) throw new Error('Ошибка лайка');
      const data = await res.json();
      setPublications(posts => {
        const newPosts = posts.map(post => post.id === postId ? {
          ...post,
          likedByMe: data.status === 'liked',
          likesCount: post.likesCount + (data.status === 'liked' ? 1 : -1)
        } : post);
        // Если лайкаем в модалке — обновляем selectedPost полностью из массива
        if (selectedPost && selectedPost.id === postId) {
          const updated = newPosts.find(post => post.id === postId);
          if (updated) setSelectedPost(updated);
        }
        return newPosts;
      });
    } catch (e) {
      setError('Ошибка при попытке поставить лайк');
    }
  };

  if (loading) return <Loader text="Загрузка профиля..." />;
  if (error) return <ErrorMessage text={error} onRetry={() => window.location.reload()} />;
  if (!data) return <EmptyState text="Профиль не найден" />;
  const p = data.profile;
  const isMe = viewer?.username === p.username;
  const avatar = isMe ? viewer.avatar : p.avatar;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header onEditProfile={() => setEditProfileOpen(true)} onSettings={() => setSettingsOpen(true)} isProfilePage={true} />
      {settingsOpen && isMe && <SettingsModal profile={{...p, userId: viewer?.userId}} onClose={() => setSettingsOpen(false)} onSave={() => { setProfile({ ...viewer, ...p }); refreshProfile(); }} />}
      <main className="flex-1 pt-44 pb-12 flex flex-col items-center px-4">
        <div className="w-full max-w-3xl flex flex-col items-center mx-auto">
          <div
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: '2px solid #fff',
              borderRadius: 28,
              padding: '72px 32px 32px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 32px #0008',
              width: '100%',
              margin: '0 auto',
              position: 'relative',
            }}
            className="w-full"
          >
            <img
              src={avatar || '/default-avatar.png'}
              alt="avatar"
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: '4px solid #fff',
                objectFit: 'cover',
                background: '#222',
                boxShadow: '0 2px 12px #0008',
                position: 'absolute',
                top: -70,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
              }}
            />
            <div style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 4, color: '#fff', marginTop: 80 }}>{p.name || p.username} {p.surname}</div>
            <div style={{ color: '#fff', fontSize: 18, marginBottom: 18, textAlign: 'center', fontWeight: 400 }}>
              @{p.username}
            </div>
            <div style={{ display: 'flex', gap: 40, marginBottom: 24, justifyContent: 'center', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{p.followersCount?.toLocaleString('ru-RU')}</span>
                <span style={{ color: '#bbb', fontSize: 14, marginTop: 2 }}>Подписчики</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{p.likesCount?.toLocaleString('ru-RU')}</span>
                <span style={{ color: '#bbb', fontSize: 14, marginTop: 2 }}>Лайки</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{p.postsCount?.toLocaleString('ru-RU')}</span>
                <span style={{ color: '#bbb', fontSize: 14, marginTop: 2 }}>Публикации</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 12, width: '100%', marginBottom: 18, justifyContent: 'center', alignItems: 'center', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
              {isMe ? (
                <button
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: 16,
                    padding: '16px 0',
                    fontWeight: 700,
                    fontSize: 20,
                    flex: 1,
                    boxShadow: '0 2px 8px #0008',
                    cursor: 'pointer',
                    minWidth: 160,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setSettingsOpen(true)}
                >
                  Редактировать
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={submitting}
                  style={{
                    background: 'transparent',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: 16,
                    padding: '16px 0',
                    fontWeight: 700,
                    fontSize: 20,
                    flex: 1,
                    boxShadow: '0 2px 8px #0008',
                    cursor: 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    minWidth: 160,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {p.isFollowing ? 'Отписаться' : 'Подписаться'}
                </button>
              )}
              {p.telegram && (
                <a
                  href={p.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    border: '2px solid #fff',
                    background: 'rgba(79,170,255,0.08)',
                    transition: 'background 0.2s',
                    boxShadow: '0 1px 4px #0008',
                    marginLeft: 0,
                  }}
                  title="Telegram"
                >
                  <FaTelegramPlane size={30} color="#4faaff" />
                </a>
              )}
              {p.instagram && (
                <a
                  href={p.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    border: '2px solid #fff',
                    background: 'rgba(225,48,108,0.08)',
                    transition: 'background 0.2s',
                    boxShadow: '0 1px 4px #0008',
                    marginLeft: 0,
                  }}
                  title="Instagram"
                >
                  <FaInstagram size={30} color="#e1306c" />
                </a>
              )}
            </div>
            {p.description && (
              <div
                style={{
                  color: '#fff',
                  fontSize: 16,
                  textAlign: 'center',
                  marginTop: 8,
                  marginBottom: 4,
                  lineHeight: 1.6,
                  maxWidth: 600,
                  wordBreak: 'break-word',
                  borderRadius: 14,
                  padding: '16px 18px',
                  fontWeight: 400,
                  letterSpacing: 0.01,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                {p.description.slice(0, 300)}
              </div>
            )}
          </div>
          {/* Кнопка загрузки публикации с большими отступами или просто отступ для чужих профилей */}
          {isMe ? (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                onClick={handleUploadClick}
                className="w-full max-w-3xl py-3 rounded-xl border border-white text-white text-lg font-bold hover:bg-white hover:text-black transition"
                style={{ marginTop: 40, marginBottom: 32 }}
              >
                Загрузить публикацию
              </button>
            </>
          ) : (
            <div style={{ marginTop: 40, marginBottom: 32 }} />
          )}
          <div
            className="masonry-grid"
            style={{
              width: '100%',
              maxWidth: 1200,
              margin: '0 auto',
              columnCount: 4,
              columnGap: 18,
            }}
          >
            {publications.length === 0 ? (
              <EmptyState text={isMe ? 'У вас пока нет публикаций. Загрузите первую публикацию!' : 'Публикаций пока нет.'} />
            ) : (
              publications.map((img, i) => (
                <div
                  key={img.id || img._id || i}
                  className="masonry-item"
                  style={{
                    breakInside: 'avoid',
                    borderRadius: 18,
                    border: '1.5px solid #fff',
                    background: '#111',
                    marginBottom: 18,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px #0006',
                    position: 'relative',
                    display: 'block',
                    width: '100%',
                    cursor: 'pointer',
                    padding: 0,
                    ...(editMode ? jiggleStyle : {}),
                  }}
                  onClick={() => !editMode && setSelectedPost(img)}
                >
                  {/* Мобильная обертка для aspect-ratio */}
                  <span className="masonry-img-mobile-wrap">
                    <StaticGif
                      src={img.imageUrl}
                      alt="Публикация"
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                        display: 'block',
                        margin: 0,
                        background: 'none',
                        borderRadius: 18,
                      }}
                    />
                  </span>
                  {img.description && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 12,
                        right: 12,
                        bottom: 12,
                        padding: '12px 22px',
                        fontSize: 16,
                        color: '#fff',
                        background: 'rgba(30,30,30,0.32)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderRadius: 18,
                        fontWeight: 400,
                        zIndex: 2,
                        boxShadow: '0 4px 24px #0004, 0 1.5px 8px #0002',
                        overflow: 'hidden',
                        border: 'none',
                        maxWidth: 'calc(100% - 24px)',
                        textAlign: 'center',
                        pointerEvents: 'auto',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        minHeight: 22,
                        lineHeight: '1.5',
                        display: 'block',
                      }}
                    >
                      {img.description}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setEditMode((v) => !v)}
            disabled={publications.length === 0}
            style={{
              marginBottom: 18,
              alignSelf: 'flex-end',
              background: editMode ? '#fff' : '#222',
              color: editMode ? '#222' : '#fff',
              border: '1.5px solid #fff',
              borderRadius: 12,
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 16,
              cursor: publications.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px #0004',
              opacity: publications.length === 0 ? 0.5 : 1,
            }}
          >{editMode ? 'Готово' : 'Редактировать доску'}</button>
          {imagePreview && isMe && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-black border border-white rounded-2xl p-8 w-full max-w-md relative">
                <button onClick={() => { setImagePreview(null); setImageFile(null); setPublicationDesc(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white text-white focus:outline-none">✕</button>
                <h2 className="text-xl font-bold mb-4">Загрузить публикацию</h2>
                <form className="flex flex-col gap-4" onSubmit={handleSavePublication}>
                  {imageError && <span className="text-xs text-red-400">{imageError}</span>}
                  {imagePreview && <img src={imagePreview} alt="preview" className="w-full rounded-xl border border-white" />}
                  <textarea value={publicationDesc} onChange={e => setPublicationDesc(e.target.value)} placeholder="Описание публикации..." className="w-full rounded border border-white bg-black text-white p-2 resize-none" rows={3} />
                  <button type="submit" className="mt-2 px-4 py-2 rounded bg-black border border-white text-white hover:bg-neutral-900">Сохранить</button>
                </form>
              </div>
            </div>
          )}
          {editProfileOpen && isMe && (
            <EditProfileModal profile={p} onClose={() => setEditProfileOpen(false)} onSave={setProfile} />
          )}
          {/* Модальное окно публикации */}
          {selectedPost && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm"
              style={{ animation: 'fadeIn 0.2s', background: 'none' }}
              onClick={() => setSelectedPost(null)}
            >
              <div
                className="relative flex flex-col items-center mx-2 overflow-y-auto bg-none rounded-2xl"
                style={{
                  padding: 0,
                  maxHeight: '60vh',
                  width: 'auto',
                  maxWidth: typeof window !== 'undefined' && window.innerWidth > 768 ? '700px' : '98vw',
                  minWidth: 0,
                  alignItems: 'center',
                  position: 'relative',
                  opacity: modalVisible ? 1 : 0,
                  transition: 'opacity 0.3s',
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Картинка с fade-in */}
                <div className="relative flex flex-col items-center w-full md:max-w-[60vw] max-w-[98vw] md:overflow-visible overflow-y-auto"
                  style={{
                    minWidth: 0,
                    minHeight: imgLoaded ? 0 : 320,
                    maxHeight: '60vh',
                    overflow: 'hidden',
                    background: 'none',
                    borderRadius: 24,
                    position: 'relative',
                  }}
                >
                  {/* Плейсхолдер */}
                  {!imgLoaded && (
                    <div style={{ position: 'absolute', inset: 0, background: '#222', borderRadius: 24, zIndex: 1 }} />
                  )}
                  <img
                    ref={imgRef}
                    src={selectedPost.imageUrl}
                    alt="Публикация"
                    className="block object-contain"
                    style={{
                      display: 'block',
                      background: 'none',
                      maxWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '98vw' : '520px',
                      width: '100%',
                      maxHeight: '60vh',
                      height: 'auto',
                      objectFit: 'contain',
                      boxShadow: 'none',
                      borderRadius: 24,
                      opacity: imgLoaded ? 1 : 0,
                      transition: 'opacity 0.4s',
                      position: 'relative',
                      zIndex: 2,
                    }}
                    onLoad={e => {
                      setImgHeight((e.target as HTMLImageElement).clientHeight);
                      setImgLoaded(true);
                    }}
                  />
                  {/* Описание на изображении снизу */}
                  {selectedPost.description && (
                    <div
                      className="absolute left-4 right-4 bottom-4 z-20"
                      style={{ pointerEvents: 'none' }}
                    >
                      <div
                        style={{
                          width: '100%',
                          padding: '8px 20px',
                          fontSize: 17,
                          color: '#fff',
                          background: 'rgba(60,60,60,0.18)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          borderRadius: 24,
                          fontWeight: 400,
                          textAlign: 'center',
                          boxShadow: '0 4px 24px #0004, 0 1.5px 8px #0002',
                          pointerEvents: 'auto',
                          minHeight: 22,
                          maxHeight: 66,
                          lineHeight: '22px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textShadow: '0 2px 8px #000b, 0 1px 2px #0008',
                        }}
                      >
                        {selectedPost.description}
                      </div>
                    </div>
                  )}
                  {/* Крестик для закрытия модалки */}
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full glass-btn text-xl transition"
                    style={{ zIndex: 30, background: 'rgba(0,0,0,0.5)', color: '#fff', border: '2px solid #fff' }}
                    title="Закрыть"
                  >✕</button>
                </div>
                {/* Контейнер с кнопками под изображением */}
                <div className="w-full flex justify-center" style={{ marginTop: 24 }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 18,
                    padding: '12px 32px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.32)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    boxShadow: '0 4px 32px #0003',
                  }}>
                    <button
                      onClick={() => handleLike(selectedPost.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full glass-btn text-xl transition"
                      style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}
                      title={selectedPost.likedByMe ? 'Убрать лайк' : 'Поставить лайк'}
                    >
                      {selectedPost.likedByMe ? (
                        <FaHeart size={20} color="#e53935" style={{ verticalAlign: 'middle' }} />
                      ) : (
                        <FaRegHeart size={20} color="#fff" style={{ verticalAlign: 'middle' }} />
                      )}
                      <span style={{ fontSize: 13, color: '#fff', marginLeft: 6, minWidth: 20, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{selectedPost.likesCount}</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full glass-btn text-xl transition" title="Поделиться">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 16V4m0 0L8 8m4-4 4 4"/></svg>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full glass-btn text-xl transition" title="Ещё">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {deleteId && (
            <DeleteModal
              onCancel={() => setDeleteId(null)}
              onConfirm={async () => {
                // Удаляем публикацию через API
                try {
                  await fetch(`/api/publications?id=${deleteId}`, { method: 'DELETE' });
                  setPublications((prev) => prev.filter((p, idx) => (p.id || p._id || idx) !== deleteId));
                } catch {}
                setDeleteId(null);
              }}
            />
          )}
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes jiggle {
          0% { transform: rotate(-2deg); }
          25% { transform: rotate(2deg); }
          50% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
          100% { transform: rotate(-2deg); }
        }
        .masonry-grid {
          column-count: 4;
          column-gap: 18px;
        }
        @media (max-width: 1199px) {
          .masonry-grid { column-count: 3; }
        }
        @media (max-width: 899px) {
          .masonry-grid { column-count: 2; }
        }
        @media (max-width: 700px) {
          .masonry-grid { column-count: 2 !important; column-gap: 10px !important; }
        }
        @media (max-width: 599px) {
          .masonry-grid { column-count: 1; }
        }
        .masonry-item {
          width: 100%;
          margin-bottom: 18px;
          display: inline-block;
          vertical-align: top;
        }
      `}</style>
    </div>
  );
}