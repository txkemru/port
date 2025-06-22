import Header from '../components/Header';
import Footer from '../components/Footer';
import PortfolioCard from '../components/PortfolioCard';

const Portfolio = () => (
  <div className="flex flex-col min-h-screen bg-black text-white">
    <Header />
    <main className="flex-1 pt-16 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto py-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <PortfolioCard key={i} />
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Portfolio; 