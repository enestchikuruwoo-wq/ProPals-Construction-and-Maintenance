import { ReactNode } from 'react';
import { Hammer, Facebook, Instagram, Linkedin, Twitter, MapPin, Mail } from 'lucide-react';

export default function Footer({ onAdminClick }: { onAdminClick?: () => void }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 py-12 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-sm">
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Office */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-primary-900 border border-slate-100 shadow-sm">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 leading-none mb-1 tracking-widest">Main Office</p>
                <p className="text-xs font-black text-primary-900">35 Howard Road, PMB, ZA</p>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200 hidden md:block" />

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-primary-900 border border-slate-100 shadow-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 leading-none mb-1 tracking-widest">Email Us</p>
                <p className="text-xs font-black text-primary-900">quote@propals.co.za</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Ready to build?</p>
              <p className="text-lg font-black text-accent-orange leading-none">+27 69 382 2309</p>
            </div>
            <div className="flex gap-2">
              <SocialIcon icon={<Facebook size={14} />} />
              <SocialIcon icon={<Instagram size={14} />} />
              <SocialIcon icon={<Linkedin size={14} />} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <p>© {currentYear} ProPals Construction & Maintenance</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent-orange transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent-orange transition-colors">Terms</a>
            <button 
              onClick={onAdminClick || (() => window.location.hash = 'admin')} 
              className="hover:text-accent-orange transition-colors opacity-30 hover:opacity-100"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: ReactNode }) {
  return (
    <a href="#" className="w-10 h-10 bg-primary-900 text-white rounded flex items-center justify-center hover:bg-accent-orange transition-all shadow-lg hover:shadow-accent-orange/20">
      {icon}
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-gray-500 hover:text-accent-orange hover:translate-x-1 inline-block transition-all">
      {children}
    </a>
  );
}
