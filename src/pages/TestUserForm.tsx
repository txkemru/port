import React, { useState } from 'react';

export default function TestUserForm() {
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch('/api/user-create', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Создать пользователя с аватаром</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input name="email" type="email" placeholder="Email" required /><br />
        <input name="password" type="password" placeholder="Пароль" required /><br />
        <input name="name" type="text" placeholder="Имя" /><br />
        <input name="surname" type="text" placeholder="Фамилия" /><br />
        <input name="username" type="text" placeholder="Username" /><br />
        <input name="avatar" type="file" accept="image/*" /><br /><br />
        <button type="submit">Создать</button>
      </form>
      {result && (
        <pre style={{ background: '#eee', padding: 10, marginTop: 20 }}>{result}</pre>
      )}
    </div>
  );
} 