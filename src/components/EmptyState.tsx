import React from 'react';
export default function EmptyState({text = 'Нет данных', icon}: {text?: string, icon?: React.ReactNode}) {
  return (
    <div style={{color: '#bbb', fontSize: 20, textAlign: 'center', margin: '48px 0 64px 0', padding: 32, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1.5px dashed #888', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto'}}>
      {icon && <div style={{fontSize: 48, marginBottom: 12}}>{icon}</div>}
      {text}
    </div>
  );
} 