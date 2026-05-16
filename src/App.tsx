import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPortal from './components/Admin';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    // Listen for hash changes to switch to admin view
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isAdminView) {
    return <AdminPortal />;
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-accent-orange/30">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Testimonials />
        <Contact />
      </main>
      <Footer onAdminClick={() => setIsAdminView(true)} />
    </div>
  );
}
