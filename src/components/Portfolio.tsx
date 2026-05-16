import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Play, X, Layers, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const categories = ['All', 'Remodel', 'Painting', 'Tiling'];

export default function Portfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showBefore, setShowBefore] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getGalleryImages = () => {
    if (!selectedProject) return [];
    let images = [selectedProject.image];
    if (selectedProject.gallery && selectedProject.gallery.length > 0) {
      images = [...images, ...selectedProject.gallery];
    }
    return images.filter(img => !!img);
  };

  const nextImage = (e: MouseEvent) => {
    e.stopPropagation();
    const images = getGalleryImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: MouseEvent) => {
    e.stopPropagation();
    const images = getGalleryImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesCategory = activeFilter === 'All' || project.category === activeFilter;
    const matchesSearch = searchQuery === '' || 
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.materials?.some((m: string) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.services?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <section id="portfolio" className="py-24 bg-white flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-accent-orange font-black tracking-[0.2em] uppercase mb-4 text-xs"
            >
              Our Work
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-primary-900 uppercase tracking-tighter italic leading-[0.95]"
            >
              Recent Projects That <br /> Showcase Our Excellence
            </motion.h2>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative group mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-orange transition-colors" />
              <input 
                type="text"
                placeholder="Search tags or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-sm text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-accent-orange outline-none w-48 transition-all"
              />
            </div>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveFilter(category);
                  setSearchQuery('');
                }}
                className={`relative px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
                  activeFilter === category ? 'text-white' : 'text-slate-500 hover:text-primary-900'
                }`}
              >
                <span className="relative z-10">{category}</span>
                {activeFilter === category && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-primary-900 rounded-sm shadow-lg shadow-primary-900/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {activeFilter !== category && (
                  <div className="absolute inset-0 bg-slate-100 rounded-sm -z-10 opacity-100" />
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  setCurrentImageIndex(0);
                  setSelectedProject(project);
                  setShowBefore(false);
                }}
                className={`${index % 4 === 0 ? 'col-span-full md:col-span-2' : 'col-span-1'} relative group overflow-hidden rounded-lg h-[400px] cursor-pointer shadow-xl`}
              >
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/20 to-transparent flex flex-col justify-end p-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-accent-blue font-black text-[10px] uppercase tracking-[0.2em] mb-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        {project.category}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-white group-hover:text-accent-orange transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    {project.videoUrl && (
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/20">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-slate-400 font-medium">No projects found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-primary-900/95 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white w-full max-w-6xl rounded-xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-50 bg-primary-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent-orange transition-colors shadow-xl"
              >
                <X size={20} />
              </button>

              <div className="md:w-3/5 h-[300px] md:h-auto bg-slate-900 relative flex items-center justify-center group/media overflow-hidden">
                <AnimatePresence mode="wait">
                  {selectedProject.videoUrl ? (
                    <motion.video 
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={selectedProject.videoUrl} 
                      controls 
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <motion.div 
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: "anticipate" }}
                      className="w-full h-full"
                    >
                      <img 
                        src={showBefore && selectedProject.beforeImage ? selectedProject.beforeImage : getGalleryImages()[currentImageIndex]} 
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Carousel Controls */}
                {!selectedProject.videoUrl && !showBefore && getGalleryImages().length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 z-30 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent-orange transition-all opacity-0 group-hover/media:opacity-100"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 z-30 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent-orange transition-all opacity-0 group-hover/media:opacity-100"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-6 right-6 z-30 flex gap-2">
                      {getGalleryImages().map((_, idx) => (
                        <div 
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-accent-orange w-4' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {selectedProject.beforeImage && !selectedProject.videoUrl && (
                  <div className="absolute top-6 left-6 z-20 flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-2xl">
                    <button 
                      onClick={() => setShowBefore(false)}
                      className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${!showBefore ? 'bg-accent-orange text-white' : 'text-white/60 hover:text-white'}`}
                    >
                      After
                    </button>
                    <button 
                      onClick={() => setShowBefore(true)}
                      className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${showBefore ? 'bg-accent-blue text-white' : 'text-white/60 hover:text-white'}`}
                    >
                      Before
                    </button>
                  </div>
                )}

                {selectedProject.beforeImage && !selectedProject.videoUrl && (
                  <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-[8px] font-black text-white uppercase tracking-[0.2em] border border-white/10"
                    >
                      {showBefore ? 'The Challenge' : 'The Result'}
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="md:w-2/5 p-8 md:p-12 overflow-y-auto">
                <span className="text-accent-orange font-black text-[10px] uppercase tracking-[0.2em] mb-4 inline-block">
                  {selectedProject.category}
                </span>
                <h3 className="text-3xl md:text-4xl font-display font-black text-primary-900 uppercase tracking-tighter mb-6 italic leading-none">
                  {selectedProject.title}
                </h3>
                
                <div className="h-px bg-slate-100 w-full mb-8" />

                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">The Project</h4>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                        {selectedProject.description}
                      </p>
                    </div>
                    {selectedProject.completionDate && (
                      <div className="text-right">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Completed</h4>
                        <p className="text-primary-900 text-xs font-black uppercase tracking-tighter italic">
                          {new Date(selectedProject.completionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedProject.services && selectedProject.services.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Services Provided</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.services.map((service: string) => (
                          <span 
                            key={service}
                            className="bg-slate-100 text-primary-900 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProject.materials && selectedProject.materials.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Layers size={14} className="text-slate-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Materials Used</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.materials.map((material: string) => (
                          <span 
                            key={material}
                            className="bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-sm"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Project Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag: string) => (
                          <button 
                            key={tag}
                            onClick={() => {
                              setSearchQuery(tag);
                              setActiveFilter('All');
                              setSelectedProject(null);
                            }}
                            className="bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent-blue hover:text-white transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-8">
                    <a 
                      href="#contact" 
                      onClick={() => setSelectedProject(null)}
                      className="inline-block w-full text-center bg-primary-900 text-white py-4 rounded-sm font-black uppercase tracking-[0.2em] text-xs hover:bg-accent-orange transition-all"
                    >
                      Inquire About This Service
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
