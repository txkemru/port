import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import React, { useEffect, useState } from 'react';

const sections = [
  { key: 'hero', text: 'HERO BLOCK' },
  { key: 'desc', text: 'ОПИСАНИЕ' },
  { key: 'stats', text: 'СТАТИСТИКА' },
  { key: 'jobs', text: 'ПРОФЕССИИ' },
  { key: 'reviews', text: 'ОТЗЫВЫ' },
];

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [data, setData] = useState(sections);

  useEffect(() => {
    // Имитация загрузки и ошибки
    setTimeout(() => {
      // setError('Ошибка загрузки секций'); // Раскомментируй для теста ошибки
      setLoading(false);
      // setData([]); // Раскомментируй для теста пустого состояния
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-28">
        {loading ? (
          <Loader text="Загрузка секций..." />
        ) : error ? (
          <ErrorMessage text={error} onRetry={() => { setLoading(true); setError(null); setTimeout(() => { setLoading(false); }, 1000); }} />
        ) : !data.length ? (
          <EmptyState text="Нет секций для отображения" />
        ) : (
          data.map(({ key, text }) => (
            <div
              key={key}
              className="min-h-screen flex items-center justify-center bg-black border border-white mb-8 rounded-2xl text-3xl font-bold text-white max-w-5xl mx-auto px-8 md:px-[200px]"
            >
              {text}
            </div>
          ))
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home; 