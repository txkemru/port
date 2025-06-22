"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import AuthModal from '../../components/AuthModal';
import { FaUser, FaHeart } from 'react-icons/fa';
import StaticGif from '../../components/StaticGif';

export default function PortfolioPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [foundProfiles, setFoundProfiles] = useState<any[]>([]);
  const { profile } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [popularProfiles, setPopularProfiles] = useState<any[]>([]);
  const [popularPosts, setPopularPosts] = useState<any[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [showAllProfiles, setShowAllProfiles] = useState(false);
  const [showAllFoundProfiles, setShowAllFoundProfiles] = useState(false);

  const fetchPosts = async (reset = false) => {
    setLoading(true);
    setError(null);
    setFoundProfiles([]);
    try {
      const res = await fetch(`/api/publications?page=${reset ? 1 : page}&limit=20${search ? `&username=${encodeURIComponent(search)}` : ""}${profile?.id ? `&userId=${profile.id}` : ""}`);
      if (!res.ok) throw new Error('Ошибка загрузки публикаций');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(reset ? data.posts : [...posts, ...data.posts]);
      setHasMore((reset ? data.posts.length : posts.length + data.posts.length) < data.total);
      if ((reset ? data.posts.length : posts.length + data.posts.length) === 0 && search) {
        const profRes = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        const profData = await profRes.json();
        if (Array.isArray(profData.users) && profData.users.length > 0) {
          setFoundProfiles(profData.users);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки публикаций');
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line
  }, [search]);

  const handleShowMore = () => {
    setPage((p) => p + 1);
  };

  useEffect(() => {
    if (page > 1) fetchPosts();
    // eslint-disable-next-line
  }, [page]);

  const handleLike = async (postId: string) => {
    if (!profile?.id) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: profile.id }),
      });
      if (!res.ok) throw new Error('Ошибка лайка');
      const data = await res.json();
      setPosts(posts => posts.map(post => post.id === postId ? {
        ...post,
        likedByMe: data.liked,
        likesCount: post.likesCount + (data.liked ? 1 : -1)
      } : post));
    } catch (e) {
      setError('Ошибка при попытке поставить лайк');
    }
  };

  useEffect(() => {
    setLoadingPopular(true);
    Promise.all([
      fetch('/api/user?sort=popular').then(r => r.json()),
      fetch('/api/publications?sort=popular').then(r => r.json()),
    ]).then(([profilesRes, postsRes]) => {
      setPopularProfiles(profilesRes.profiles || []);
      setPopularPosts(postsRes.posts || []);
    }).finally(() => setLoadingPopular(false));
  }, []);

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <Header />
      <div style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: 24,
        paddingTop: 120,
        boxSizing: 'border-box',
        overflowX: 'hidden',
        width: '100vw',
        maxWidth: '100vw',
      }}>
        <h2 style={{ fontSize: 28, marginBottom: 24, textAlign: "center" }}>Портфолио</h2>
        <form
          onSubmit={e => { e.preventDefault(); setSearch(searchValue); setPage(1); }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}
        >
          <input
            type="text"
            placeholder="Поиск по username, имени, фамилии"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            style={{
              background: "#000",
              color: "#fff",
              border: "1px solid #fff",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 15,
              outline: "none",
              marginRight: 12,
              minWidth: 200,
            }}
          />
          <button type="submit" style={{ background: "#000", color: "#fff", border: "1px solid #fff", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
            Найти
          </button>
        </form>
        <div className="portfolio-main-grid" style={{ display: 'flex', gap: 32, alignItems: 'flex-start', justifyContent: 'center', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
          <div className="portfolio-profiles-col" style={{ flex: 1, minWidth: 260 }}>
            {search && foundProfiles.length > 0 && (
              <>
                <h3 style={{ fontSize: 20, marginBottom: 18, textAlign: 'center' }}>Результаты поиска</h3>
                <div className="posts-masonry-grid" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', columnCount: 2, columnGap: 18 }}>
                  {(showAllFoundProfiles ? foundProfiles : foundProfiles.slice(0, 5)).map(profile => (
                    <div key={profile.username} className="masonry-item" style={{
                      breakInside: 'avoid',
                      borderRadius: 28,
                      border: '1.5px solid #fff',
                      background: '#111',
                      marginBottom: 18,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px #0006',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      cursor: 'pointer',
                      padding: 0,
                      minWidth: 0,
                    }} onClick={() => router.push(`/profile/${profile.username}`)}>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 28, background: '#222', position: 'relative', height: 180 }}>
                        <img
                          src={profile.avatar || '/default-avatar.png'}
                          alt="avatar"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            margin: 'auto',
                            borderRadius: 0,
                            background: 'none',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          left: 12,
                          right: 12,
                          bottom: 12,
                          padding: '8px 20px',
                          fontSize: 15,
                          color: '#fff',
                          background: 'rgba(30,30,30,0.32)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          borderRadius: 999,
                          fontWeight: 400,
                          zIndex: 2,
                          boxShadow: '0 4px 24px #0004, 0 1.5px 8px #0002',
                          overflow: 'hidden',
                          border: 'none',
                          maxWidth: 'calc(100% - 24px)',
                          textAlign: 'center',
                          pointerEvents: 'auto',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          minHeight: 22,
                          lineHeight: '22px',
                          display: 'block',
                        }}
                      >
                        @{profile.username}
                      </div>
                    </div>
                  ))}
                </div>
                {foundProfiles.length > 5 && !showAllFoundProfiles && (
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <button onClick={() => setShowAllFoundProfiles(true)} style={{ background: '#222', color: '#fff', border: '1.5px solid #fff', borderRadius: 10, padding: '7px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Показать ещё</button>
                  </div>
                )}
              </>
            )}
            <h3 style={{ fontSize: 20, marginBottom: 18, textAlign: 'center', marginTop: 36 }}>Популярные профили</h3>
            {loadingPopular ? <Loader /> : (
              popularProfiles.length === 0 ? <EmptyState text="Нет популярных профилей" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {(showAllProfiles ? popularProfiles : popularProfiles.slice(0, 5)).map(profile => (
                    <div key={profile.username} className="profile-card-mobile" style={{ background: '#181818', borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px #0004', cursor: 'pointer' }} onClick={() => router.push(`/profile/${profile.username}`)}>
                      <img src={profile.avatar || '/default-avatar.png'} alt="avatar" style={{ width: 54, height: 54, borderRadius: '50%', border: '2px solid #fff', objectFit: 'cover', background: '#222' }} className="profile-avatar-mobile" />
                      <div style={{ flex: 1 }}>
                        <div className="profile-name-mobile" style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{profile.name || profile.username} {profile.surname}</div>
                        <div className="profile-username-mobile" style={{ color: '#aaa', fontSize: 15 }}>@{profile.username}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaUser size={16} color="#fff" />
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{profile.followersCount}</span>
                      </div>
                    </div>
                  ))}
                  {popularProfiles.length > 5 && !showAllProfiles && (
                    <button onClick={() => setShowAllProfiles(true)} style={{ margin: '0 auto', marginTop: 8, background: '#222', color: '#fff', border: '1.5px solid #fff', borderRadius: 10, padding: '7px 22px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Показать ещё</button>
                  )}
                </div>
              )
            )}
          </div>
          <div className="portfolio-posts-col" style={{ flex: 1.5, minWidth: 320 }}>
            <h3 style={{ fontSize: 20, marginBottom: 18, textAlign: 'center' }}>Популярные публикации</h3>
            <div className="posts-masonry-grid" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', columnCount: 4, columnGap: 18 }}>
              {popularPosts.map(post => (
                <div key={post.id} className="masonry-item" style={{
                  breakInside: 'avoid',
                  borderRadius: 28,
                  border: '1.5px solid #fff',
                  background: '#111',
                  marginBottom: 18,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px #0006',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  cursor: 'pointer',
                  padding: 0,
                  minWidth: 0,
                }} onClick={() => router.push(`/profile/${post.author.username}`)}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 28, background: '#222', position: 'relative' }}>
                    <StaticGif
                      src={post.imageUrl}
                      alt="Публикация"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 340,
                        objectFit: 'cover',
                        display: 'block',
                        margin: 'auto',
                        borderRadius: 0,
                        background: 'none',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      left: 12,
                      right: 12,
                      bottom: 12,
                      padding: '8px 20px',
                      fontSize: 15,
                      color: '#fff',
                      background: 'rgba(30,30,30,0.32)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      borderRadius: 999,
                      fontWeight: 400,
                      zIndex: 2,
                      boxShadow: '0 4px 24px #0004, 0 1.5px 8px #0002',
                      overflow: 'hidden',
                      border: 'none',
                      maxWidth: 'calc(100% - 24px)',
                      textAlign: 'center',
                      pointerEvents: 'auto',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      minHeight: 22,
                      lineHeight: '22px',
                      display: 'block',
                    }}
                  >
                    @{post.author.username}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`
          html, body {
            overflow-x: hidden !important;
            box-sizing: border-box;
            width: 100vw;
            max-width: 100vw;
          }
          @media (max-width: 700px) {
            .portfolio-main-grid {
              flex-direction: column;
              gap: 24px;
              width: 100% !important;
              max-width: 100vw !important;
              box-sizing: border-box;
              overflow-x: hidden;
            }
            .portfolio-profiles-col, .portfolio-posts-col {
              min-width: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box;
            }
            .portfolio-posts-col > .posts-masonry-grid {
              column-count: 2 !important;
              column-gap: 12px !important;
            }
            .profile-card-mobile {
              padding: 8px !important;
              gap: 8px !important;
            }
            .profile-avatar-mobile {
              width: 40px !important;
              height: 40px !important;
            }
            .profile-name-mobile {
              font-size: 15px !important;
            }
            .profile-username-mobile {
              font-size: 13px !important;
            }
            .posts-masonry-grid {
              column-count: 2 !important;
              column-gap: 12px !important;
            }
            .masonry-item {
              width: 100%;
              margin-bottom: 18px;
              display: inline-block;
            }
          }
          .posts-masonry-grid {
            column-count: 4;
            column-gap: 18px;
          }
        `}</style>
      </div>
    </>
  );
} 