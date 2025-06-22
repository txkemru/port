import React from 'react';
export default function Loader({text = 'Загрузка...'}: {text?: string}) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, color: '#bbb', fontSize: 20}}>
      <div className="loader-spinner" style={{width: 44, height: 44, border: '5px solid #bbb', borderTop: '5px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 16}} />
      {text}
      <style>{`@keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }`}</style>
    </div>
  );
} 