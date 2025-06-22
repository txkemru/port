import React, { useState } from 'react';

interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
  onSave: (profile: any) => void;
}

interface ProfileForm {
  name: string;
  username: string;
  description: string;
  // Добавь другие поля профиля, если они есть
  lastUsernameChange?: string | Date;
}

const EditProfileModal = ({ profile, onClose, onSave }: EditProfileModalProps) => {
  const [form, setForm] = useState<ProfileForm>({
    name: profile.name || '',
    username: profile.username || '',
    description: profile.description || '',
    lastUsernameChange: profile.lastUsernameChange || '',
    // Добавь другие поля профиля, если они есть
  });
  const [usernameError, setUsernameError] = useState('');

  const canChangeUsername = () => {
    const now = new Date();
    const last = new Date(profile.lastUsernameChange);
    return (now.getTime() - last.getTime()) > 30 * 24 * 60 * 60 * 1000;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'username') setUsernameError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.username !== profile.username && !canChangeUsername()) {
      setUsernameError('Username можно менять только раз в месяц');
      return;
    }
    onSave({ ...form, lastUsernameChange: form.username !== profile.username ? new Date() : profile.lastUsernameChange });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-black border border-white rounded-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white text-white focus:outline-none">✕</button>
        <h2 className="text-xl font-bold mb-4">Редактировать профиль</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input type="text" name="name" value={form.name} onChange={handleFormChange} placeholder="Имя Фамилия" className="p-2 rounded border border-white bg-black text-white placeholder-white" />
          <div className="flex flex-col gap-1">
            <input type="text" name="username" value={form.username} onChange={handleFormChange} placeholder="Username" className="p-2 rounded border border-white bg-black text-white placeholder-white disabled:opacity-60" disabled={!canChangeUsername()} />
            <span className="text-xs text-neutral-400">Username можно менять только раз в месяц</span>
            {usernameError && <span className="text-xs text-red-400">{usernameError}</span>}
          </div>
          <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Описание" className="p-2 rounded border border-white bg-black text-white placeholder-white resize-none" rows={3} />
          <button type="submit" className="mt-2 px-4 py-2 rounded bg-black border border-white text-white hover:bg-neutral-900">Сохранить</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 