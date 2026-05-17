import { motion } from 'motion/react';
import { ChevronRight, ShieldCheck, Clock, Award } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative h-screen min-h-[800px] flex items-center bg-slate-50 pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Main Hero Block */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-grow bg-primary-900 rounded-xl p-10 md:p-16 flex flex-col justify-center text-white relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/10 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10">
              <span className="bg-accent-orange text-[10px] px-4 py-1.5 font-black uppercase tracking-[0.2em] rounded-full mb-8 inline-block shadow-lg shadow-accent-orange/20">
                Pietermaritzburg's Preferred Builder
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[0.95] mb-8 tracking-tighter uppercase italic">
                Precision <br />
                <span className="text-accent-blue font-display">Building.</span><br />
                <span className="text-white font-display">Professional Results.</span>
              </h1>
              <p className="text-blue-100 max-w-lg text-base md:text-lg leading-relaxed mb-10 font-medium opactiy-90">
                Providing top-tier construction, remodelling, and maintenance services for homeowners and businesses in Pietermaritzburg and surrounding areas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <div className="bg-white/10 px-6 py-3 rounded border border-white/20 backdrop-blur-sm">
                  <p className="text-2xl font-black italic">150+</p>
                  <p className="text-[10px] items-center flex font-bold uppercase tracking-widest opacity-70">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Projects Done
                  </p>
                </div>
                <div className="bg-white/10 px-6 py-3 rounded border border-white/20 backdrop-blur-sm">
                  <p className="text-2xl font-black italic">100%</p>
                  <p className="text-[10px] items-center flex font-bold uppercase tracking-widest opacity-70">
                    <Award className="w-3 h-3 mr-1" /> Client Trust
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a href="#contact" className="bg-white text-primary-900 px-8 py-4 rounded-sm font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all shadow-xl shadow-black/20">
                  Start Your Project
                </a>
                <a href="#services" className="bg-transparent border border-white/40 text-white px-8 py-4 rounded-sm font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
                  Our Services
                </a>
              </div>
            </div>
          </motion.div>

          {/* Design Visualization Side Block */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="lg:w-80 bg-white border border-slate-200 rounded-xl p-8 flex flex-col shadow-xl"
          >
            <div className="w-full h-40 bg-slate-50 rounded-lg mb-6 flex items-center justify-center border-dashed border-2 border-slate-200 group overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=800" 
                alt="3D Visualization" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
              />
              <p className="relative z-10 text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/80 px-3 py-1 rounded">3D Visualization</p>
            </div>
            <h3 className="font-black text-primary-900 uppercase tracking-tight text-2xl mb-4 leading-none">Design Services</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
              Visualize your dream space before the first brick is laid with our professional CAD & 3D visualization services.
            </p>
            <button className="mt-auto text-xs font-black text-accent-orange uppercase tracking-[0.2em] flex items-center gap-2 group hover:translate-x-1 transition-all">
              View Portfolio <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
