import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Hammer } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 border-b-2 ${
        isScrolled ? 'bg-white border-slate-200 py-3 shadow-sm' : 'bg-white md:bg-white/90 border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-10 h-10 bg-primary-900 flex items-center justify-center rounded-sm">
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-white"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-primary-900 leading-tight uppercase tracking-tighter">ProPals</h1>
              <p className="text-[8px] font-bold text-accent-orange uppercase tracking-[0.2em] -mt-1">Construction & Maintenance</p>
            </div>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, idx) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-primary-900 border-b-2 border-transparent hover:border-accent-orange transition-all py-1"
              >
                {link.name}
              </motion.a>
            ))}
            
            <div className="h-8 w-px bg-slate-200 mx-4" />
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Support Line</p>
                <p className="text-xs font-bold text-primary-900 tracking-wide">+27 62 415 9067</p>
              </div>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-accent-orange text-white px-6 py-2.5 rounded-sm text-xs font-black uppercase tracking-widest shadow-lg shadow-accent-orange/20 transition-all"
              >
                Get a Quote
              </motion.a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={isScrolled ? 'text-primary-900' : 'text-white'}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-4 text-xs font-bold uppercase tracking-widest text-primary-900 hover:bg-slate-50 transition-colors border-l-4 border-transparent hover:border-accent-orange"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 px-3">
                <a
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center bg-accent-orange text-white px-6 py-4 rounded-sm text-sm font-black uppercase tracking-widest"
                >
                  Get a Quote
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
