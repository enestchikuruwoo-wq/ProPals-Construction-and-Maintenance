import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';
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
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Listen for hash changes to switch to admin view
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Show tooltip automatically after 3 seconds
  useEffect(() => {
    if (isAdminView) return;
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isAdminView]);

  if (isAdminView) {
    return <AdminPortal />;
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-accent-orange/30 relative">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Testimonials />
        <Contact />
      </main>
      <Footer onAdminClick={() => setIsAdminView(true)} />

      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-slate-900 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-white/10"
            >
              <span>Chat with us on WhatsApp!</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowTooltip(false);
                }}
                className="hover:text-amber-500 font-bold ml-1 text-[11px] p-0.5 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Close tooltip"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.a
          href="https://wa.me/27624159067?text=Hello%20PropertyPals!%20I%20am%20interested%20in%20your%20construction%20and%20renovation%20services."
          target="_blank"
          style={{ originX: 0.5, originY: 0.5 }}
          rel="noopener noreferrer"
          title="Chat with us on WhatsApp"
          aria-label="WhatsApp"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            boxShadow: [
              "0 10px 15px -3px rgba(34, 197, 94, 0.3), 0 4px 6px -4px rgba(34, 197, 94, 0.3)",
              "0 10px 25px -3px rgba(34, 197, 94, 0.6), 0 4px 12px -4px rgba(34, 197, 94, 0.6)",
              "0 10px 15px -3px rgba(34, 197, 94, 0.3), 0 4px 6px -4px rgba(34, 197, 94, 0.3)"
            ],
            transition: {
              boxShadow: {
                repeat: Infinity,
                duration: 2.5,
              }
            }
          }}
          className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[#20ba59]"
        >
          <MessageCircle className="w-6 h-6 fill-current stroke-[2]" />
        </motion.a>
      </div>
    </div>
  );
}

