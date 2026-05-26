import { motion } from 'motion/react';
import { 
  PaintBucket, 
  Bath, 
  ChefHat, 
  Grid3X3, 
  Wrench, 
  Eye 
} from 'lucide-react';

const services = [
  {
    title: 'Kitchen Remodel',
    description: 'Custom cabinetry, high-end plumbing, and modern workspace layouts for your home.',
    number: '01',
    borderColor: 'border-accent-blue',
    bgColor: 'bg-accent-blue/10',
    textColor: 'text-accent-blue'
  },
  {
    title: 'Bathroom Upgrades',
    description: 'Luxury fixtures and high-quality waterproofing solutions for a spa-like retreat.',
    number: '02',
    borderColor: 'border-accent-orange',
    bgColor: 'bg-accent-orange/10',
    textColor: 'text-accent-orange'
  },
  {
    title: 'Professional Tiling',
    description: 'Precision floor and wall tiling for commercial and residential applications.',
    number: '03',
    borderColor: 'border-primary-900',
    bgColor: 'bg-primary-900/10',
    textColor: 'text-primary-900'
  },
  {
    title: 'Home Repairs',
    description: 'General maintenance, expert painting, and structural repairs you can trust.',
    number: '04',
    borderColor: 'border-slate-400',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600'
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-accent-orange font-black tracking-[0.2em] uppercase mb-4 text-xs"
            >
              Our Expertise
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-primary-900 tracking-tight leading-tight"
            >
              Specialized Services <br /> For Your Project
            </motion.h2>
          </div>
          <div className="h-px bg-slate-200 flex-grow mx-8 hidden lg:block" />
          <p className="text-slate-500 font-medium max-w-xs text-sm">
            We combine years of experience with precision craftsmanship across all our service offerings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white p-8 rounded-lg border-b-4 ${service.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 group cursor-default`}
            >
              <div className={`w-12 h-12 ${service.bgColor} ${service.textColor} rounded flex items-center justify-center mb-6 font-black text-lg group-hover:scale-110 transition-transform`}>
                {service.number}
              </div>
              <h4 className="font-black text-lg text-primary-900 mb-3 uppercase tracking-tight">{service.title}</h4>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
