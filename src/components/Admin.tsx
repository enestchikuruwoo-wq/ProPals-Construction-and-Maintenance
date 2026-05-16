import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ExternalLink, 
  MessageSquare, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ChevronRight,
  Filter,
  LayoutDashboard,
  X
} from 'lucide-react';
import { auth, db, addProject } from '../lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

// Admin Portal for ProPals
export default function AdminPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'projects'>('dashboard');
  
  // Data State
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Real-time snapshot for leads
    const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(leadsData);
    });

    // Real-time snapshot for projects
    const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);
    });

    return () => {
      unsubscribeLeads();
      unsubscribeProjects();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
            <LayoutDashboard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-display font-black text-primary-900 uppercase italic mb-4 tracking-tighter">Admin Portal</h1>
          <p className="text-slate-500 mb-8 font-medium">Access your project management dashboard and customer leads.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-primary-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebase/anonymous-scan.png" className="w-5 h-5 hidden" alt="" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  // Check if admin (simple check)
  if (user.email !== 'enestchikuruwoo@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-black text-primary-900 mb-4">Access Denied</h1>
          <p className="text-slate-500 mb-6">This portal is restricted to authorized administrators only.</p>
          <button onClick={handleLogout} className="text-accent-orange font-bold uppercase tracking-widest text-xs underline">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-primary-900 text-white flex flex-col p-8 fixed h-full z-20 shadow-2xl">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-10 h-10 bg-accent-orange rounded flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display font-black uppercase italic tracking-tighter leading-none">ProPals</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Admin Suite</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          <SidebarLink 
            icon={<BarChart3 size={18} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarLink 
            icon={<MessageSquare size={18} />} 
            label="Leads" 
            badge={leads.filter(l => l.status === 'new').length}
            active={activeTab === 'leads'} 
            onClick={() => setActiveTab('leads')} 
          />
          <SidebarLink 
            icon={<Users size={18} />} 
            label="Projects" 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
          />
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full border-2 border-white/20" />
            <div className="overflow-hidden">
              <p className="font-bold text-xs truncate">{user.displayName}</p>
              <p className="text-[10px] text-white/50 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-72 p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardView key="dashboard" leads={leads} projects={projects} />}
          {activeTab === 'leads' && <LeadsView key="leads" leads={leads} />}
          {activeTab === 'projects' && <ProjectsView key="projects" projects={projects} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick, badge }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${
        active 
          ? 'bg-white/10 text-white' 
          : 'text-white/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-accent-orange text-white text-[8px] font-black px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function DashboardView({ leads, projects }: any) {
  const newLeads = leads.filter((l: any) => l.status === 'new');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black text-primary-900 uppercase italic italic tracking-tighter mb-2">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Here's what's happening with your business today.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 text-xs font-black uppercase tracking-widest">
          <Clock size={16} className="text-accent-orange" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <StatCard title="Total Leads" value={leads.length} icon={<MessageSquare />} color="blue" />
        <StatCard title="New Inquiries" value={newLeads.length} icon={<Clock />} color="orange" />
        <StatCard title="Live Projects" value={projects.length} icon={<Users />} color="primary" />
        <StatCard title="Conv. Rate" value="64%" icon={<CheckCircle2 />} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white rounded-2xl border border-slate-100 p-10 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-primary-900 uppercase tracking-tight">Recent Leads</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-accent-blue border-b-2 border-accent-blue/30 pb-1">View All</button>
          </div>
          <div className="space-y-6">
            {leads.slice(0, 5).map((lead: any) => (
              <div key={lead.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-accent-blue/10 group-hover:text-accent-blue transition-colors">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-black text-primary-900 uppercase tracking-tight text-sm">{lead.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lead.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                    {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </p>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                    lead.status === 'new' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
            {leads.length === 0 && <p className="text-center py-10 text-slate-400 text-sm font-medium">No leads yet.</p>}
          </div>
        </div>

        <div className="bg-primary-900 rounded-2xl p-10 shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 italic">Quick Actions</h3>
            <p className="text-white/60 text-sm mb-10 max-w-xs">Efficiently manage your portfolio and respond to potential clients.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <QuickActionBtn icon={<Plus />} label="New Project" color="accent-orange" />
              <QuickActionBtn icon={<Users />} label="Manage Team" color="white/10" />
              <QuickActionBtn icon={<Settings />} label="Site Config" color="white/10" />
              <QuickActionBtn icon={<ExternalLink />} label="View Site" color="white/10" />
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent-orange/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    primary: 'bg-indigo-50 text-indigo-600',
    green: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
      <p className="text-3xl font-display font-black text-primary-900 italic tracking-tighter">{value}</p>
    </div>
  );
}

function QuickActionBtn({ icon, label, color }: any) {
  return (
    <button className={`w-full flex flex-col items-center gap-3 p-6 rounded-xl border border-white/5 transition-all hover:scale-105 ${
      color === 'accent-orange' ? 'bg-accent-orange text-white' : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
    }`}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function LeadsView({ leads }: any) {
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'leads', id), { status: newStatus });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black text-primary-900 uppercase italic tracking-tighter mb-2">Customer Leads</h1>
          <p className="text-slate-500 font-medium">Manage and respond to project inquiries.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border border-slate-100 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary-900 flex items-center gap-2 shadow-sm">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Service</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-6 text-[10px) font-black uppercase tracking-widest text-slate-400">Date</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {leads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-black text-primary-900 uppercase tracking-tight text-sm">{lead.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{lead.email}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{lead.phone}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="bg-primary-900/5 text-primary-900 px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest">
                    {lead.service}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <select 
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full outline-none appearance-none cursor-pointer border-none ${
                      lead.status === 'new' ? 'bg-orange-100 text-orange-600' : 
                      lead.status === 'contacted' ? 'bg-blue-100 text-blue-600' :
                      lead.status === 'in-progress' ? 'bg-indigo-100 text-indigo-600' :
                      'bg-green-100 text-green-600'
                    }`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="px-8 py-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                  </p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => deleteLead(lead.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-primary-900 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="py-24 text-center">
            <MessageSquare size={48} className="mx-auto text-slate-200 mb-6" />
            <h4 className="text-lg font-black text-primary-900 uppercase tracking-tight">No Leads Found</h4>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">When customers use your contact form, they will appear here.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProjectsView({ projects }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Remodel',
    description: '',
    services: '',
    tags: '',
    materials: '',
    completionDate: '',
    image: 'https://images.unsplash.com/photo-1556912177-c540306ea5ae?auto=format&fit=crop&q=80&w=1200', // Placeholder
    beforeImage: '',
    videoUrl: ''
  });

  const deleteProject = async (id: string) => {
    if (!confirm('Permanently delete this project from portfolio?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      console.error('Delete project failed:', error);
    }
  };

  const handleSaveProject = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const projectData = {
        ...newProject,
        services: newProject.services.split(',').map(s => s.trim()).filter(s => s !== ''),
        tags: newProject.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== ''),
        materials: newProject.materials.split(',').map(m => m.trim()).filter(m => m !== ''),
      };
      await addProject(projectData);
      setIsAdding(false);
      setNewProject({
        title: '',
        category: 'Remodel',
        description: '',
        services: '',
        tags: '',
        materials: '',
        completionDate: '',
        image: 'https://images.unsplash.com/photo-1556912177-c540306ea5ae?auto=format&fit=crop&q=80&w=1200',
        beforeImage: '',
        videoUrl: ''
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Remodel', 'Painting', 'Tiling', 'Construction'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black text-primary-900 uppercase italic tracking-tighter mb-2">Project Portfolio</h1>
          <p className="text-slate-500 font-medium">Add and manage showcase projects.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-accent-orange text-white px-8 py-4 rounded-lg text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-accent-orange/20 hover:bg-black transition-all"
        >
          <Plus size={16} /> Add New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project: any) => (
          <div key={project.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm group">
            <div className="h-48 relative">
              <img src={project.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button className="p-3 bg-white rounded-full text-primary-900 hover:bg-accent-orange hover:text-white transition-all shadow-lg">
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => deleteProject(project.id)}
                  className="p-3 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded mb-3 inline-block">
                {project.category}
              </span>
              <h3 className="font-display font-black text-primary-900 uppercase tracking-tight text-xl mb-4 italic leading-tight">
                {project.title}
              </h3>
              <p className="text-slate-500 text-xs line-clamp-2 mb-6 font-medium">
                {project.description}
              </p>
              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <div className="flex -space-x-1">
                  {project.tags?.slice(0, 3).map((tag: string) => (
                    <div key={tag} className="bg-slate-100 text-slate-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-white">
                      #{tag}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {project.completionDate ? new Date(project.completionDate).getFullYear() : 'Ongoing'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="py-24 text-center bg-white rounded-2xl border border-slate-100">
          <LayoutDashboard size={48} className="mx-auto text-slate-100 mb-6" />
          <h4 className="text-lg font-black text-primary-900 uppercase tracking-tight">No Projects Yet</h4>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Start building your public portfolio by adding your recent work.</p>
        </div>
      )}

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-primary-900/95 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-xl rounded-xl p-8 md:p-12 relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-primary-900 transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="text-3xl font-display font-black text-primary-900 uppercase tracking-tighter mb-8 italic leading-none">
                Add New Project
              </h3>

              <form onSubmit={handleSaveProject} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Project Title</label>
                  <input 
                    required
                    value={newProject.title}
                    onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Modern Home Extension"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-accent-orange outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
                    <select 
                      value={newProject.category}
                      onChange={e => setNewProject(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-accent-orange outline-none"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Completion Date</label>
                    <input 
                      type="date"
                      value={newProject.completionDate}
                      onChange={e => setNewProject(p => ({ ...p, completionDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-accent-orange outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Image URL</label>
                  <input 
                    required
                    value={newProject.image}
                    onChange={e => setNewProject(p => ({ ...p, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-accent-orange outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Services (Comma Separated)</label>
                  <input 
                    value={newProject.services}
                    onChange={e => setNewProject(p => ({ ...p, services: e.target.value }))}
                    placeholder="Tiling, Painting, etc."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-accent-orange outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={newProject.description}
                    onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                    placeholder="Tell us about the project details..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-accent-orange outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-900 text-white py-5 rounded font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Project'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
