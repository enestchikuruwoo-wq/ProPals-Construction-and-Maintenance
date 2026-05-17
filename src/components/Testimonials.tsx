import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, Plus, X, CheckCircle2 } from 'lucide-react';
import { db, submitTestimonial, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Homeowner',
    quote: '',
    rating: 5,
    location: ''
  });

  useEffect(() => {
    // Fetch only approved testimonials for the public view
    // Or fetch all if they want "unlimited" and immediate appearance? 
    // Usually approved is better, but maybe prompt user? 
    // I'll start with fetching all for now so they see immediate feedback as requested ("enable unlimited number to write")
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestimonials(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitTestimonial(formData);
      setSubmitted(true);
      setTimeout(() => {
        setShowForm(false);
        setSubmitted(false);
        setFormData({ name: '', role: 'Homeowner', quote: '', rating: 5, location: '' });
      }, 2000);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) / testimonials.length).toFixed(1)
    : '5.0';

  return (
    <section id="testimonials" className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-accent-orange font-black tracking-[0.2em] uppercase mb-4 text-xs"
            >
              Client Feedback
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-primary-900 uppercase tracking-tighter italic leading-[0.95]"
            >
              What Our Clients <br /> Are Saying
            </motion.h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4 min-w-[200px]">
             <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-accent-orange text-white px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent-orange/20 flex items-center gap-2"
            >
              <Plus size={14} /> Leave a Review
            </motion.button>
            <p className="text-slate-500 font-medium max-w-xs text-[10px] uppercase tracking-widest text-left md:text-right">
              Join our list of satisfied customers in Pietermaritzburg.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.length > 0 ? (
            testimonials.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group flex flex-col h-full"
              >
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-accent-orange p-3 rounded shadow-lg shadow-accent-orange/20">
                  <Quote className="w-5 h-5 text-white" />
                </div>

                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < (t.rating || 0) ? 'text-accent-orange fill-accent-orange' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>

                <blockquote className="text-slate-600 font-medium leading-relaxed mb-8 italic">
                  "{t.quote}"
                </blockquote>

                <div className="mt-auto border-t border-slate-50 pt-6">
                  <p className="font-black text-primary-900 uppercase tracking-tight text-lg">{t.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                    <p className="text-[10px] font-black text-accent-blue uppercase tracking-widest">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 italic font-medium">
              Loading verified reviews...
            </div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <div className="bg-primary-900 text-white px-10 py-4 rounded-sm flex items-center gap-6 shadow-2xl">
            <div className="text-center">
              <p className="text-2xl font-black italic leading-none">{avgRating}/5</p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Avg Rating</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black italic leading-none">{testimonials.length}+</p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Verified Reviews</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-900 bg-slate-200" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Review Submission Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowForm(false)}
              className="absolute inset-0 bg-primary-900/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-2xl p-8 md:p-12 shadow-2xl relative z-10"
            >
              {!submitted ? (
                <>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-black transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-3xl font-display font-black text-primary-900 uppercase italic tracking-tighter mb-8 bg-white">
                    Submit Your Feedback
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Your Name</label>
                        <input 
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="Full Name"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Location</label>
                        <input 
                          required
                          value={formData.location}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                          placeholder="e.g. Hilton, PMB"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Your Role</label>
                      <select 
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none"
                      >
                        <option>Homeowner</option>
                        <option>Property Developer</option>
                        <option>Business Owner</option>
                        <option>Architect</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                           <button 
                            key={star}
                            type="button"
                            onClick={() => setFormData({...formData, rating: star})}
                            className="transition-transform active:scale-90"
                           >
                            <Star 
                              className={`w-8 h-8 ${star <= formData.rating ? 'text-accent-orange fill-accent-orange' : 'text-slate-200'}`} 
                            />
                           </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Your Feedback</label>
                      <textarea 
                        required
                        rows={4}
                        value={formData.quote}
                        onChange={e => setFormData({...formData, quote: e.target.value})}
                        placeholder="Tell us about your experience..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none resize-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-accent-orange transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-3xl font-display font-black text-primary-900 uppercase italic tracking-tighter mb-4">
                    Thank You!
                  </h3>
                  <p className="text-slate-500 font-medium">Your review has been submitted successfully.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
