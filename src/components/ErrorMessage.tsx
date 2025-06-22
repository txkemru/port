import React from 'react';
export default function ErrorMessage({text = 'Произошла ошибка', onRetry}: {text?: string, onRetry?: () => void}) {
  return (
    <div style={{color: '#e53935', fontSize: 18, textAlign: 'center', margin: '40px 0', padding: 24, borderRadius: 18, background: 'rgba(229,57,53,0.08)', border: '1.5px solid #e53935', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto'}}>
      {text}
      {onRetry && <div style={{marginTop: 18}}><button onClick={onRetry} style={{padding: '8px 22px', borderRadius: 8, border: '1.5px solid #e53935', background: '#e53935', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer'}}>Повторить</button></div>}
    </div>
  );
} 