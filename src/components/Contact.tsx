import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { submitLead } from '../lib/firebase';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  service: z.string().min(1, { message: 'Please select a service.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await submitLead(data);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Submission failed', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-primary-900 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-accent-orange font-black tracking-[0.2em] uppercase mb-4 text-xs">Get In Touch</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-white mb-10 uppercase tracking-tighter italic leading-[0.95]">
              Let's Build Your <br /> Project Together
            </h2>
            <p className="text-gray-400 text-base mb-12 leading-relaxed">
              Have a question or ready to start your next project? Fill out the form or contact us directly. Our team in Pietermaritzburg is ready to assist you.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-6 group">
                <div className="bg-white/10 p-4 rounded border border-white/10 group-hover:bg-accent-orange transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-accent-blue group-hover:text-white" />
                </div>
                <div>
                  <h4 className="text-[10px] items-center flex font-black uppercase tracking-widest text-slate-400 mb-1">Main Office</h4>
                  <p className="text-white font-bold leading-relaxed">35 Howard road, Pietermaritzburg, <br /> South Africa 3201</p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="bg-white/10 p-4 rounded border border-white/10 group-hover:bg-accent-orange transition-colors duration-300">
                  <Phone className="w-6 h-6 text-accent-blue group-hover:text-white" />
                </div>
                <div>
                  <h4 className="text-[10px] items-center flex font-black uppercase tracking-widest text-slate-400 mb-1">Call Us</h4>
                  <p className="text-white font-bold leading-none mb-1">
                    <a href="tel:+27624159067" className="hover:text-accent-blue transition-colors tracking-tight">+27 62 415 9067</a>
                  </p>
                  <p className="text-white font-bold leading-none">
                    <a href="tel:+27693822309" className="hover:text-accent-blue transition-colors tracking-tight">+27 69 382 2309</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6 group">
                <div className="bg-white/10 p-4 rounded border border-white/10 group-hover:bg-accent-orange transition-colors duration-300">
                  <Mail className="w-6 h-6 text-accent-blue group-hover:text-white" />
                </div>
                <div>
                  <h4 className="text-[10px] items-center flex font-black uppercase tracking-widest text-slate-400 mb-1">Email Us</h4>
                  <p className="text-white font-bold">
                    <a href="mailto:quote@propals.co.za" className="hover:text-accent-blue transition-colors">quote@propals.co.za</a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl"
          >
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-green-100 p-6 rounded-full mb-6"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </motion.div>
                <h3 className="text-3xl font-display font-bold text-primary-900 mb-4">Request Sent!</h3>
                <p className="text-gray-600 mb-8">Thank you for reaching out. We will get back to you shortly with a quote.</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-accent-orange font-bold hover:underline"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary-900 uppercase tracking-wider">Full Name</label>
                    <input 
                      {...register('name')}
                      placeholder="John Doe"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all outline-none"
                    />
                    {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary-900 uppercase tracking-wider">Email Address</label>
                    <input 
                      {...register('email')}
                      placeholder="john@example.com"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all outline-none"
                    />
                    {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary-900 uppercase tracking-wider">Phone Number</label>
                    <input 
                      {...register('phone')}
                      placeholder="+27 12 345 6789"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all outline-none"
                    />
                    {errors.phone && <p className="text-red-500 text-xs font-medium">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary-900 uppercase tracking-wider">Desired Service</label>
                    <select 
                      {...register('service')}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all outline-none appearance-none"
                    >
                      <option value="">Select a service</option>
                      <option value="Kitchen Remodel">Kitchen Remodel</option>
                      <option value="Bathroom Renovation">Bathroom Renovation</option>
                      <option value="Tiling">Professional Tiling</option>
                      <option value="Painting">Painting & Maintenance</option>
                      <option value="General Repairs">General Repairs</option>
                      <option value="Design">Design & Visualization</option>
                    </select>
                    {errors.service && <p className="text-red-500 text-xs font-medium">{errors.service.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary-900 uppercase tracking-wider">Project Details</label>
                  <textarea 
                    {...register('message')}
                    rows={4}
                    placeholder="Tell us about your project..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-all outline-none resize-none"
                  />
                  {errors.message && <p className="text-red-500 text-xs font-medium">{errors.message.message}</p>}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-accent-orange text-white py-5 rounded-sm font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-accent-orange/20 hover:bg-orange-600 transition-all flex items-center justify-center disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Get Free Quote
                      <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
