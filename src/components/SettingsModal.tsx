import React, { useState, useRef, useEffect } from 'react';

interface SettingsModalProps {
  onClose: () => void;
  profile?: any;
  onSave?: (profile: any) => void;
}

const MAX_DESC = 200;
const MAX_AVATAR_SIZE = 10 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const SettingsModal = ({ onClose, profile = {}, onSave }: SettingsModalProps) => {
  const [form, setForm] = useState({
    avatar: profile.avatar || '',
    name: profile.name || '',
    surname: profile.surname || '',
    username: profile.username || '',
    lastUsernameChange: profile.lastUsernameChange || '2024-01-01',
    telegram: profile.telegram || '',
    instagram: profile.instagram || '',
    description: profile.description || '',
  });
  const [usernameError, setUsernameError] = useState('');
  const [descCount, setDescCount] = useState(form.description.length);
  const [avatarError, setAvatarError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const prevAvatarRef = useRef(profile.avatar);

  useEffect(() => {
    if (profile.avatar !== prevAvatarRef.current) {
      setAvatarPreview(profile.avatar || '');
      prevAvatarRef.current = profile.avatar;
    }
    setForm({
      avatar: profile.avatar || '',
      name: profile.name || '',
      surname: profile.surname || '',
      username: profile.username || '',
      lastUsernameChange: profile.lastUsernameChange || '2024-01-01',
      telegram: profile.telegram || '',
      instagram: profile.instagram || '',
      description: profile.description || '',
    });
  }, [profile]);

  const canChangeUsername = () => {
    const now = new Date();
    const last = new Date(form.lastUsernameChange);
    return (now.getTime() - last.getTime()) > 30 * 24 * 60 * 60 * 1000;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'description') setDescCount(value.length);
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'username') setUsernameError('');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Только изображения (jpg, png, webp, gif)');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Максимальный размер 10MB');
      return;
    }
    // Логируем userId перед отправкой
    console.log('userId для аватара:', profile.userId);
    // Отправляем файл на сервер
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', profile.userId);
    const res = await fetch('/api/profile', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setAvatarPreview(data.avatar);
      setForm((prev) => ({ ...prev, avatar: data.avatar }));
      if (onSave) onSave({ ...profile, avatar: data.avatar });
    } else {
      setAvatarError('Ошибка загрузки аватара');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.username !== profile.username && !canChangeUsername()) {
      setUsernameError('Username можно менять только раз в месяц');
      return;
    }
    if (form.description.length > MAX_DESC) return;
    // Отправляем PATCH на /api/profile
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: profile.userId,
        name: form.name,
        surname: form.surname,
        username: form.username,
        telegram: form.telegram,
        instagram: form.instagram,
        description: form.description,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (onSave) onSave({ ...profile, ...form, ...data });
      onClose();
    }
  };

  const inputClass =
    'p-3 rounded-2xl border border-white bg-black text-white placeholder:text-neutral-500 placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-white transition';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-black border border-white rounded-2xl w-full max-w-md relative px-4 py-6 sm:p-8">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border border-white text-white focus:outline-none text-xl">✕</button>
        <h2 className="text-xl font-bold mb-4 text-center">Настройки профиля</h2>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Аватар */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-28 h-28 rounded-full border-2 border-white bg-black overflow-hidden flex items-center justify-center">
              {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-white/40">Нет фото</span>}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button type="button" onClick={() => avatarInputRef.current?.click()} className="px-4 py-1 rounded-2xl border border-white text-white hover:bg-white hover:text-black text-sm">Загрузить фото профиля</button>
            {avatarError && <span className="text-xs text-red-400">{avatarError}</span>}
          </div>
          <input type="text" name="name" value={form.name} onChange={handleFormChange} placeholder="Имя" className={inputClass} />
          <input type="text" name="surname" value={form.surname} onChange={handleFormChange} placeholder="Фамилия" className={inputClass} />
          <div className="flex flex-col gap-1">
            <input type="text" name="username" value={form.username} onChange={handleFormChange} placeholder="Username" className={inputClass + ' disabled:opacity-60'} disabled={!canChangeUsername()} />
            <span className="text-xs text-neutral-400">Username можно менять только раз в месяц</span>
            {usernameError && <span className="text-xs text-red-400">{usernameError}</span>}
          </div>
          <input type="text" name="telegram" value={form.telegram} onChange={handleFormChange} placeholder="Ссылка на Telegram" className={inputClass} />
          <input type="text" name="instagram" value={form.instagram} onChange={handleFormChange} placeholder="Ссылка на Instagram" className={inputClass} />
          <div className="flex flex-col gap-1">
            <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Описание" className={inputClass + ' resize-none'} rows={3} maxLength={MAX_DESC} />
            <span className="text-xs text-neutral-400 text-right">{descCount}/{MAX_DESC} символов</span>
          </div>
          <button type="submit" className="mt-2 px-4 py-3 rounded-2xl bg-black border border-white text-white hover:bg-neutral-900 font-bold">Сохранить</button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal; 