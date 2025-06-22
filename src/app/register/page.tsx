'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle'|'checking'|'free'|'taken'>('idle');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Проверка username на уникальность
  const checkUsername = async (value: string) => {
    setUsernameStatus('checking');
    const res = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`);
    const data = await res.json();
    setUsernameStatus(data.free ? 'free' : 'taken');
  };

  const validate = () => {
    const errs: string[] = [];
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      errs.push('Пароль должен быть не менее 8 символов и содержать буквы и цифры.');
    }
    if (password !== confirmPassword) {
      errs.push('Пароли не совпадают.');
    }
    if (usernameStatus === 'taken') {
      errs.push('Username уже занят.');
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/user-create', {
      method: 'POST',
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      // Автоматический вход после регистрации
      login({
        id: data.user.id,
        userId: data.user.id,
        email: data.user.email,
        ...data.user.profile,
      });
      router.push(`/profile/${data.user.profile.username}`);
    } else {
      setErrors(['Ошибка регистрации']);
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
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: 8 }}>Регистрация</h2>
        <input name="email" type="email" placeholder="Email" required style={inputStyle} disabled={loading} />
        <input name="password" type="password" placeholder="Пароль" required style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
        <input name="confirmPassword" type="password" placeholder="Подтвердите пароль" required style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} />
        <input name="name" type="text" placeholder="Имя" style={inputStyle} disabled={loading} />
        <input name="surname" type="text" placeholder="Фамилия" style={inputStyle} disabled={loading} />
        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          style={inputStyle}
          value={username}
          onChange={e => {
            setUsername(e.target.value);
            setUsernameStatus('idle');
          }}
          onBlur={e => {
            if (e.target.value) checkUsername(e.target.value);
          }}
          disabled={loading}
        />
        <div style={{ minHeight: 18, color: usernameStatus === 'taken' ? '#ff5555' : usernameStatus === 'free' ? '#4fff55' : '#fff', fontSize: 13 }}>
          {usernameStatus === 'checking' && 'Проверка...'}
          {usernameStatus === 'free' && 'Username свободен'}
          {usernameStatus === 'taken' && 'Username уже занят'}
        </div>
        {loading && <Loader text="Регистрация..." />}
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
          Зарегистрироваться
        </button>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <span style={{ color: '#aaa', fontSize: 14 }}>
            Уже есть аккаунт?{' '}
            <span
              style={{ color: '#4faaff', cursor: loading ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}
              onClick={() => !loading && router.push('/login')}
            >
              Войти
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