import { ReactNode, useState } from 'react';
import { Hammer, Facebook, Instagram, Linkedin, Twitter, MapPin, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Footer({ onAdminClick }: { onAdminClick?: () => void }) {
  const currentYear = new Date().getFullYear();
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

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
                <a href="#contact" className="text-xs font-black text-primary-900 hover:text-accent-orange transition-colors">quote@propals.co.za</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Ready to build?</p>
              <a href="tel:+27693822309" className="text-lg font-black text-accent-orange leading-none hover:text-primary-900 transition-colors tracking-tighter italic">
                +27 69 382 2309
              </a>
            </div>
            <div className="flex gap-2">
              <SocialIcon href="https://www.facebook.com/propertypals" icon={<Facebook size={14} />} />
              <SocialIcon href="#" icon={<Instagram size={14} />} />
              <SocialIcon href="#" icon={<Linkedin size={14} />} />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <p>© {currentYear} ProPals Construction & Maintenance</p>
          <div className="flex gap-6">
            <button onClick={() => setActiveModal('privacy')} className="hover:text-accent-orange transition-colors">Privacy</button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-accent-orange transition-colors">Terms</button>
            <button 
              onClick={onAdminClick || (() => window.location.hash = 'admin')} 
              className="hover:text-accent-orange transition-colors opacity-30 hover:opacity-100"
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Info Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-primary-900/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl p-8 md:p-12 relative z-10 max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-100"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-primary-900 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="prose prose-slate max-w-none">
                {activeModal === 'privacy' ? (
                  <>
                    <h2 className="text-4xl font-display font-black text-primary-900 uppercase tracking-tighter mb-8 italic">Privacy Policy</h2>
                    <div className="space-y-6 text-slate-600 font-medium text-sm leading-relaxed">
                      <p>Propals Construction & Maintenance ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">1. Information Collection</h4>
                      <p>We collect information that you provide directly to us through our contact forms, including your name, email address, phone number, and details about your project needs.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">2. Use of Information</h4>
                      <p>We use the information we collect to respond to your inquiries, provide quotes, manage your projects, and send you professional updates related to our services.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">3. Data Security</h4>
                      <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">4. Third-Party Disclosure</h4>
                      <p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information unless we provide users with advance notice.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">5. Contact Us</h4>
                      <p>If there are any questions regarding this privacy policy, you may contact us using the information in the footer.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl font-display font-black text-primary-900 uppercase tracking-tighter mb-8 italic">Terms of Use</h2>
                    <div className="space-y-6 text-slate-600 font-medium text-sm leading-relaxed">
                      <p>By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">1. Use License</h4>
                      <p>Permission is granted to temporarily view the materials on Propals Construction's website for personal, non-commercial transitory viewing only.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">2. Disclaimer</h4>
                      <p>The materials on our website are provided "as is". Propals Construction makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">3. Revisions and Errata</h4>
                      <p>The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">4. Links</h4>
                      <p>Propals Construction has not reviewed all of the sites linked to its Internet website and is not responsible for the contents of any such linked site.</p>
                      
                      <h4 className="text-primary-900 font-black uppercase tracking-widest text-[10px]">5. Site Terms of Use Modifications</h4>
                      <p>Propals Construction may revise these terms of use for its website at any time without notice.</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="bg-primary-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}

function SocialIcon({ icon, href = "#" }: { icon: ReactNode, href?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-primary-900 text-white rounded flex items-center justify-center hover:bg-accent-orange transition-all shadow-lg hover:shadow-accent-orange/20">
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
