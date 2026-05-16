import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Homeowner',
    quote: 'The kitchen remodel surpassed all my expectations. The ProPals team handled every bottleneck with such professionalism. Their attention to detail in the custom cabinetry is unmatched.',
    rating: 5,
    location: 'Hayfields, PMB'
  },
  {
    name: 'David van Wyk',
    role: 'Property Developer',
    quote: 'Professional, timely, and excellent craftsmanship. We’ve worked with many contractors, but the tiling and plumbing standards delivered here are simply superior.',
    rating: 5,
    location: 'Hilton, KZN'
  },
  {
    name: 'Lerato Mokoena',
    role: 'Business Owner',
    quote: 'I highly recommend ProPals for any commercial renovation. They completed our retail space ahead of schedule without compromising the high-end finish we needed.',
    rating: 5,
    location: 'Liberty Mall Area'
  }
];

export default function Testimonials() {
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
              className="text-4xl md:text-5xl font-display font-black text-primary-900 uppercase tracking-tighter italic"
            >
              What Our Clients <br /> Are Saying
            </motion.h2>
          </div>
          <div className="h-px bg-slate-200 flex-grow mx-8 hidden lg:block" />
          <p className="text-slate-500 font-medium max-w-xs text-sm">
            Our reputation is built on the trust and satisfaction of homeowners and businesses across Pietermaritzburg.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group"
            >
              <div className="absolute top-0 right-10 -translate-y-1/2 bg-accent-orange p-3 rounded shadow-lg shadow-accent-orange/20">
                <Quote className="w-5 h-5 text-white" />
              </div>

              <div className="flex mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent-orange fill-accent-orange" />
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
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <div className="bg-primary-900 text-white px-10 py-4 rounded-sm flex items-center gap-6 shadow-2xl">
            <div className="text-center">
              <p className="text-2xl font-black italic leading-none">4.9/5</p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Avg Rating</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black italic leading-none">500+</p>
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
    </section>
  );
}
