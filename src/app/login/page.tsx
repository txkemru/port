'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/login', {
      method: 'POST',
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      login({
        ...data.profile,
        userId: data.id,
        id: data.id,
        email: data.email,
      });
      router.push(`/profile/${data.profile.username}`);
    } else {
      setErrors(['Неверный email или пароль']);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#000',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          minWidth: 320,
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          border: '1px solid #fff',
        }}
      >
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: 8 }}>Вход</h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          style={inputStyle}
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          name="password"
          type="password"
          placeholder="Пароль"
          required
          style={inputStyle}
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
        />
        {loading && <Loader text="Вход..." />}
        {errors.length > 0 && <ErrorMessage text={errors[0]} onRetry={() => setErrors([])} />}
        <button
          type="submit"
          style={{
            background: '#000',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: 8,
            padding: '12px 0',
            fontWeight: 600,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 8,
            transition: 'background 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          disabled={loading}
        >
          Войти
        </button>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <span style={{ color: '#aaa', fontSize: 14 }}>
            Нет аккаунта?{' '}
            <span
              style={{ color: '#4faaff', cursor: loading ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}
              onClick={() => !loading && router.push('/register')}
            >
              Зарегистрируйтесь
            </span>
          </span>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  background: '#000',
  color: '#fff',
  border: '1px solid #fff',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 15,
  outline: 'none',
  marginBottom: 0,
  transition: 'border 0.2s',
} as React.CSSProperties; 