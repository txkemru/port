import React from 'react';
export default function AuthModal({onClose}: {onClose: () => void}) {
  return (
    <div style={{position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{background: '#222', color: '#fff', borderRadius: 18, padding: '32px 28px 24px 28px', minWidth: 260, boxShadow: '0 4px 32px #000a', textAlign: 'center', border: '2px solid #fff'}}>
        <div style={{fontSize: 20, fontWeight: 700, marginBottom: 18}}>Требуется авторизация</div>
        <div style={{fontSize: 15, color: '#bbb', marginBottom: 24}}>Войдите в аккаунт, чтобы выполнить это действие.</div>
        <div style={{display: 'flex', gap: 16, justifyContent: 'center'}}>
          <button onClick={onClose} style={{padding: '8px 22px', borderRadius: 8, border: '1.5px solid #fff', background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer'}}>Закрыть</button>
          <a href="/login" style={{padding: '8px 22px', borderRadius: 8, border: '1.5px solid #fff', background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', textDecoration: 'none'}}>Войти</a>
        </div>
      </div>
    </div>
  );
} 