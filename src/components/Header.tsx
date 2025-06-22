'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  onEditProfile?: () => void;
  onSettings?: () => void;
  isProfilePage?: boolean;
}

const Header = ({ onEditProfile, onSettings, isProfilePage }: HeaderProps) => {
  const { isAuthenticated, logout, profile } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Overlay для блюра и затемнения
  const Overlay = ({ show, onClick }: { show: boolean; onClick: () => void }) => (
    <div
      className={`fixed inset-0 z-[9999] bg-black/30 backdrop-blur transition-all duration-600 ease-in-out ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClick}
    />
  );

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-20 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto mt-6 mx-2 sm:mx-8 rounded-2xl bg-black/80 border border-white shadow-lg flex items-center justify-between h-16 px-4 sm:px-12 min-w-[200px] max-w-4xl w-full" style={{backdropFilter: 'blur(8px)'}}>
          {/* Mobile: бургер */}
          <div className="flex items-center sm:hidden">
            <button onClick={() => { setMobileMenuOpen(true); setProfileMenuOpen(false); }} className="w-10 h-10 flex items-center justify-center rounded-full border border-white text-white focus:outline-none">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          {/* Desktop/Tablet: навигация */}
          <div className="hidden sm:flex gap-4 items-center">
            <Link href="/" className="font-bold text-lg tracking-wide text-white">LOGO</Link>
            <Link href="/portfolio" className="hover:underline text-white">Портфолио</Link>
          </div>
          {/* Mobile: три точки справа */}
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="hover:underline text-white hidden sm:block">Вход</Link>
                <Link href="/register" className="hover:underline text-white hidden sm:block">Регистрация</Link>
              </>
            ) : (
              <>
                {/* Desktop: аватар */}
                <button
                  className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-white bg-black text-white ml-2 focus:outline-none"
                  onClick={() => setProfileMenuOpen(v => !v)}
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-white" />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-neutral-800 border border-white block" />
                  )}
                </button>
                {/* Mobile: три точки */}
                <button
                  className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full border border-white bg-black text-white ml-2 focus:outline-none"
                  onClick={() => { setProfileMenuOpen(true); setMobileMenuOpen(false); }}
                >
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
              </>
            )}
          </div>
          {/* Desktop: выпадающее меню профиля */}
          {profileMenuOpen && isAuthenticated && (
            <div className="absolute right-4 top-20 bg-black border border-white rounded-2xl shadow-lg flex-col min-w-[180px] z-30 hidden sm:flex">
              <Link href="/profile" className="text-white px-4 py-3 hover:bg-white/10 rounded-t-2xl" onClick={() => setProfileMenuOpen(false)}>Профиль</Link>
              {isProfilePage && (
                <button onClick={() => { if (onSettings) onSettings(); setProfileMenuOpen(false); }} className="text-white px-4 py-3 hover:bg-white/10 rounded-none text-left">Настройки профиля</button>
              )}
              <button onClick={() => { logout(); setProfileMenuOpen(false); }} className="text-white px-4 py-3 hover:bg-white/10 rounded-b-2xl text-left">Выйти</button>
            </div>
          )}
        </nav>
      </header>
      {/* Мобильное меню и overlay всегда в DOM, анимация через translate и opacity */}
      <div className="sm:hidden">
        <Overlay show={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
        <div className={`fixed top-0 left-0 h-full w-full z-[9999] flex flex-col transition-all duration-600 ease-in-out ${mobileMenuOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'}`}
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="relative h-full w-full flex flex-col items-center justify-center">
            <span className="font-bold text-2xl text-white absolute top-10 left-1/2 -translate-x-1/2">LOGO</span>
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-6 w-12 h-12 flex items-center justify-center rounded-full border border-white text-white focus:outline-none">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" /></svg>
            </button>
            <div className="flex flex-col gap-4 mt-32 w-full items-center">
              <Link href="/" className="text-white py-4 px-8 text-xl w-full text-center" onClick={() => setMobileMenuOpen(false)}>Главная</Link>
              <Link href="/portfolio" className="text-white py-4 px-8 text-xl w-full text-center" onClick={() => setMobileMenuOpen(false)}>Портфолио</Link>
              {!isAuthenticated && <Link href="/login" className="text-white py-4 px-8 text-xl w-full text-center" onClick={() => setMobileMenuOpen(false)}>Вход</Link>}
              {!isAuthenticated && <Link href="/register" className="text-white py-4 px-8 text-xl w-full text-center" onClick={() => setMobileMenuOpen(false)}>Регистрация</Link>}
            </div>
          </div>
        </div>
        <Overlay show={profileMenuOpen} onClick={() => setProfileMenuOpen(false)} />
        <div className={`fixed top-0 right-0 h-full w-full z-[9999] flex flex-col transition-all duration-600 ease-in-out ${profileMenuOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}`}
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="relative h-full w-full flex flex-col items-center justify-center ml-auto">
            {/* Аватар */}
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-white absolute top-10 left-1/2 -translate-x-1/2" />
            ) : (
              <span className="w-16 h-16 rounded-full bg-neutral-800 border border-white block absolute top-10 left-1/2 -translate-x-1/2" />
            )}
            <button onClick={() => setProfileMenuOpen(false)} className="absolute top-8 right-6 w-12 h-12 flex items-center justify-center rounded-full border border-white text-white focus:outline-none">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" /></svg>
            </button>
            <div className="flex flex-col gap-4 mt-32 w-full items-center">
              <Link href="/profile" className="text-white py-4 px-8 text-xl w-full text-center" onClick={() => setProfileMenuOpen(false)}>Профиль</Link>
              {isProfilePage && (
                <button onClick={() => { onSettings && onSettings(); setProfileMenuOpen(false); }} className="text-white py-4 px-8 text-xl w-full text-center">Настройки профиля</button>
              )}
              <button onClick={() => { logout(); setProfileMenuOpen(false); }} className="text-white py-4 px-8 text-xl w-full text-center">Выйти</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header; 