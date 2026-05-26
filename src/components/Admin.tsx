import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  PlusCircle,
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
  X,
  PieChart as PieChartIcon,
  TrendingUp,
  Award,
  Upload,
  Image as ImageIcon,
  Star,
  Smile,
  Meh,
  Receipt
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { auth, db, addProject, updateProject } from '../lib/firebase';
import BillingView from './BillingView';
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
import PropertyPalsLogo from './PropertyPalsLogo';

// Admin Portal for PropertyPals
export default function AdminPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'projects' | 'testimonials' | 'estimator' | 'billing'>('dashboard');
  
  // Data State
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

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

    // Real-time snapshot for testimonials
    const testimonialsQuery = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsubscribeTestimonials = onSnapshot(testimonialsQuery, (snapshot) => {
      const testimonialsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestimonials(testimonialsData);
    });

    return () => {
      unsubscribeLeads();
      unsubscribeProjects();
      unsubscribeTestimonials();
    };
  }, [user]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      // Set custom parameters to force account selection if needed
      provider.setCustomParameters({ prompt: 'select_account' });
      
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.message || '';
      
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        setLoginError('Login popup was closed. Please click below to try again.');
      } else if (errorMessage.includes('Pending promise') || errorMessage.includes('INTERNAL ASSERTION FAILED')) {
        setLoginError('The login engine encountered a temporary conflict. Please refresh the page if you cannot sign in.');
      } else {
        setLoginError('An error occurred. Check your connection and ensure popups are permitted.');
      }
    } finally {
      setIsLoggingIn(false);
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
          <h1 className="text-3xl font-display font-extrabold text-primary-900 mb-4 tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 mb-8 font-medium">Access your project management dashboard and customer leads.</p>
          
          {loginError && (
            <div className="mb-6">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-bold uppercase tracking-widest text-center">
                {loginError}
              </div>
              {loginError.includes('refresh') && (
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 w-full text-[10px] font-black uppercase tracking-widest text-primary-900 border-b border-primary-900 mx-auto block py-1 transition-opacity hover:opacity-70"
                >
                  Refresh Page Now
                </button>
              )}
            </div>
          )}

          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-primary-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoggingIn ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign in with Google'
            )}
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
        <div className="flex items-center gap-3 mb-12">
          <PropertyPalsLogo size={42} showText={false} />
          <div>
            <div className="flex items-baseline leading-none">
              <span className="text-xl font-extrabold tracking-tight text-white">Property</span>
              <span className="text-xl font-black tracking-tight text-accent-orange ml-0.5">Pals</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">Admin Suite</p>
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
          <SidebarLink 
            icon={<MessageSquare size={18} />} 
            label="Reviews" 
            active={activeTab === 'testimonials'} 
            onClick={() => setActiveTab('testimonials')} 
          />
          <SidebarLink 
            icon={<TrendingUp size={18} />} 
            label="Estimator" 
            active={activeTab === 'estimator'} 
            onClick={() => setActiveTab('estimator')} 
          />
          <SidebarLink 
            icon={<Receipt size={18} />} 
            label="Invoices & Quotes" 
            active={activeTab === 'billing'} 
            onClick={() => setActiveTab('billing')} 
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
          {activeTab === 'dashboard' && <DashboardView key="dashboard" leads={leads} projects={projects} setActiveTab={setActiveTab} />}
          {activeTab === 'leads' && <LeadsView key="leads" leads={leads} />}
          {activeTab === 'projects' && <ProjectsView key="projects" projects={projects} />}
          {activeTab === 'testimonials' && <TestimonialsView key="testimonials" testimonials={testimonials} />}
          {activeTab === 'estimator' && <CostEstimatorView key="estimator" />}
          {activeTab === 'billing' && <BillingView key="billing" leads={leads} />}
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

function DashboardView({ leads, projects, setActiveTab }: any) {
  const newLeads = leads.filter((l: any) => l.status === 'new');
  const completedLeads = leads.filter((l: any) => l.status === 'completed');
  const conversionRate = leads.length > 0 ? Math.round((completedLeads.length / leads.length) * 100) : 0;

  // Process data for charts
  const serviceStats = leads.reduce((acc: Record<string, number>, lead: any) => {
    const service = lead.service || 'Other';
    acc[service] = (acc[service] || 0) + 1;
    return acc;
  }, {});
  
  const serviceData: { name: string, value: number }[] = (Object.entries(serviceStats) as [string, number][]).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const idx = (currentMonthIdx - 5 + i + 12) % 12;
    return months[idx];
  });

  const projectsByMonth = projects.reduce((acc: Record<string, number>, project: any) => {
    const date = project.completionDate ? new Date(project.completionDate) : null;
    if (date) {
      const month = months[date.getMonth()];
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {});

  const trendData = last6Months.map(m => ({ 
    name: m, 
    projects: projectsByMonth[m] || 0,
    leads: leads.filter((l: any) => {
        const d = l.createdAt?.toDate ? l.createdAt.toDate() : null;
        return d && months[d.getMonth()] === m;
    }).length
  }));

  const conversionTrendData = last6Months.map(m => {
    const leadsInMonth = leads.filter((l: any) => {
      const d = l.createdAt?.toDate ? l.createdAt.toDate() : null;
      return d && months[d.getMonth()] === m;
    });
    const completedInMonth = leadsInMonth.filter((l: any) => l.status === 'completed');
    const rate = leadsInMonth.length > 0 ? Math.round((completedInMonth.length / leadsInMonth.length) * 100) : 0;
    return {
      name: m,
      rate,
      totalLeads: leadsInMonth.length,
      completed: completedInMonth.length
    };
  });

  const COLORS = ['#0F172A', '#F97316', '#3B82F6', '#10B981', '#6366F1'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-display font-extrabold text-primary-900 tracking-tight mb-2 leading-none font-black">Welcome Back</h1>
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
        <StatCard title="Conv. Rate" value={`${conversionRate}%`} icon={<CheckCircle2 />} color="green" />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-primary-900 uppercase tracking-tight flex items-center gap-2">
                <TrendingUp size={20} className="text-accent-orange" />
                Performance Trends
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Growth & Conversions</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-900"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Leads</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-orange"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Projects</span>
               </div>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase'
                  }} 
                />
                <Area type="monotone" dataKey="leads" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="projects" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorProjects)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-primary-900 uppercase tracking-tight flex items-center gap-2 mb-8">
            <PieChartIcon size={20} className="text-accent-blue" />
            Popular Services
          </h3>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-primary-900">{leads.length}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Leads</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {serviceData.slice(0, 3).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-primary-900">{leads.length > 0 ? Math.round(((item.value as number) / leads.length) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Rate Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-primary-900 uppercase tracking-tight flex items-center gap-2">
                <CheckCircle2 size={20} className="text-accent-blue" />
                Conversion Rate Trend (Last 6 Months)
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                Percentage of monthly customer leads successfully converted to completed projects
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl flex items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-900">
                Average Rate: {conversionRate}%
              </span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Conversion Rate']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  activeDot={{ r: 8, fill: '#3B82F6', stroke: 'white', strokeWidth: 2 }}
                  dot={{ r: 4, fill: 'white', stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50 p-10 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-primary-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
              Monthly Conversion Funnel
            </h4>
            
            <div className="space-y-4">
              {conversionTrendData.map((item) => (
                <div key={item.name} className="flex items-center justify-between border-b border-slate-200/40 pb-3 last:border-0 last:pb-0">
                  <div>
                    <span className="text-xs font-black text-primary-900 uppercase">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block font-bold mt-0.5">
                      {item.completed} of {item.totalLeads} leads converted
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-accent-blue">{item.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

        <div className="bg-primary-900 rounded-3xl p-10 shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 italic">Quick Actions</h3>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-10 max-w-xs leading-relaxed">
              Accelerate your workflow with one-click access to common tasks.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <QuickActionBtn 
                icon={<Plus size={20} />} 
                label="New Project" 
                description="Expand Portfolio"
                color="orange" 
                onClick={() => setActiveTab('projects')}
              />
              <QuickActionBtn 
                icon={<Users size={20} />} 
                label="Leads" 
                description="Manage Clients"
                color="navy"
                onClick={() => setActiveTab('leads')}
              />
              <QuickActionBtn 
                icon={<BarChart3 size={20} />} 
                label="Reports" 
                description="Export Data"
                color="navy"
                onClick={() => alert('Report generation feature coming soon.')}
              />
              <QuickActionBtn 
                icon={<ExternalLink size={20} />} 
                label="Preview" 
                description="Live Site"
                color="navy"
                onClick={() => window.open('/', '_blank')}
              />
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent-orange/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-accent-blue/10 rounded-full blur-2xl"></div>
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
      <p className="text-3xl font-display font-bold text-primary-900 tracking-tight">{value}</p>
    </div>
  );
}

function QuickActionBtn({ icon, label, description, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex flex-col items-start gap-4 p-5 rounded-2xl border transition-all text-left relative group overflow-hidden ${
        color === 'orange' 
          ? 'bg-accent-orange border-accent-orange text-white shadow-lg shadow-accent-orange/20 hover:scale-[1.02]' 
          : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
        color === 'orange' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-accent-orange'
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className={`text-[8px] font-bold uppercase tracking-tight ${color === 'orange' ? 'text-white/70' : 'text-white/40'}`}>
          {description}
        </p>
      </div>
      <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight size={12} className={color === 'orange' ? 'text-white' : 'text-accent-orange'} />
      </div>
    </button>
  );
}

function LeadsView({ leads }: any) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTrends, setShowTrends] = useState<boolean>(true);

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

  const getLeadDate = (lead: any) => {
    if (lead.createdAt?.toDate) {
      return lead.createdAt.toDate();
    }
    if (lead.createdAt) {
      return new Date(lead.createdAt);
    }
    return null;
  };

  // Extract years dynamically
  const years = Array.from(
    new Set(
      leads.map((lead: any) => {
        const d = getLeadDate(lead);
        return d ? d.getFullYear().toString() : null;
      }).filter(Boolean)
    )
  ).sort((a: any, b: any) => b - a);

  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  // Apply filters
  const filteredLeads = leads.filter((lead: any) => {
    const d = getLeadDate(lead);
    
    const yearMatch = selectedYear === 'all' || (d && d.getFullYear().toString() === selectedYear);
    const monthMatch = selectedMonth === 'all' || (d && d.getMonth().toString() === selectedMonth);
    const statusMatch = selectedStatus === 'all' || lead.status === selectedStatus;

    const textStr = `${lead.name || ''} ${lead.email || ''} ${lead.phone || ''} ${lead.service || ''}`.toLowerCase();
    const searchMatch = searchQuery.trim() === '' || textStr.includes(searchQuery.toLowerCase());

    return yearMatch && monthMatch && statusMatch && searchMatch;
  });

  const chartYear = selectedYear === 'all' ? (years[0] || new Date().getFullYear().toString()) : selectedYear;

  const monthlyCounts = Array.from({ length: 12 }, (_, monthIdx) => {
    const monthLabel = months[monthIdx].label.substring(0, 3);
    const count = leads.filter((lead: any) => {
      const d = getLeadDate(lead);
      return d && d.getFullYear().toString() === chartYear && d.getMonth() === monthIdx;
    }).length;

    return {
      name: monthLabel,
      Leads: count
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-display font-extrabold text-primary-900 tracking-tight mb-2 leading-none font-black">Customer Leads</h1>
          <p className="text-slate-500 font-medium">Manage and respond to project inquiries.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowTrends(!showTrends)}
            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border transition-all ${
              showTrends 
                ? 'bg-primary-900 border-primary-900 text-white' 
                : 'bg-white border-slate-100 text-primary-900'
            }`}
          >
            <TrendingUp size={14} /> {showTrends ? 'Hide Chart' : 'Show Chart'}
          </button>
        </div>
      </div>

      {/* Dynamic Lead Generation Trends Chart */}
      {showTrends && leads.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-md font-black text-primary-900 uppercase tracking-tight flex items-center gap-2">
                <TrendingUp size={18} className="text-accent-orange" />
                Monthly Lead Generation Trends ({chartYear})
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                Detailed flow diagram of customer inquiries over the year {chartYear}
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-50 py-1.5 px-3 rounded text-slate-500 font-bold border border-slate-100">
              Total {chartYear} Leads: {leads.filter((l: any) => getLeadDate(l)?.getFullYear().toString() === chartYear).length}
            </span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCounts}>
                <defs>
                  <linearGradient id="colorLeadsKey" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase'
                  }} 
                />
                <Area type="monotone" dataKey="Leads" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorLeadsKey)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search leads by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Year:</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-primary-900 uppercase tracking-tight py-2.5 px-4 outline-none focus:ring-2 focus:ring-accent-orange cursor-pointer"
              >
                <option value="all">All Years</option>
                {years.map((yr: any) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Month:</span>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-primary-900 uppercase tracking-tight py-2.5 px-4 outline-none focus:ring-2 focus:ring-accent-orange cursor-pointer"
              >
                <option value="all">All Months</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status:</span>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-primary-900 uppercase tracking-tight py-2.5 px-4 outline-none focus:ring-2 focus:ring-accent-orange cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Reset Button */}
            {(selectedYear !== 'all' || selectedMonth !== 'all' || selectedStatus !== 'all' || searchQuery !== '') && (
              <button 
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedMonth('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                title="Clear Filters"
              >
                <X size={16} />
              </button>
            )}
          </div>
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
            {filteredLeads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-black text-primary-900 uppercase tracking-tight text-sm">{lead.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium hover:text-accent-blue transition-colors">
                    <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium hover:text-accent-blue transition-colors">
                    <a href={`tel:${lead.phone.replace(/\s/g, '')}`}>{lead.phone}</a>
                  </p>
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
        {filteredLeads.length === 0 && (
          <div className="py-24 text-center">
            <MessageSquare size={48} className="mx-auto text-slate-200 mb-6" />
            <h4 className="text-lg font-black text-primary-900 uppercase tracking-tight">No Leads Found</h4>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">No leads match the specified filter criteria.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProjectsView({ projects }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Remodel',
    description: '',
    services: '',
    tags: '',
    materials: '',
    completionDate: '',
    image: '',
    gallery: [] as string[],
    beforeImage: '',
    videoUrl: '',
    progress: 0,
    milestones: [] as { id: string; title: string; completed: boolean }[]
  });

  const resetProjectForm = () => {
    setEditingId(null);
    setNewProject({
      title: '',
      category: 'Remodel',
      description: '',
      services: '',
      tags: '',
      materials: '',
      completionDate: '',
      image: 'https://images.unsplash.com/photo-1556912177-c540306ea5ae?auto=format&fit=crop&q=80&w=1200',
      gallery: [] as string[],
      beforeImage: '',
      videoUrl: '',
      progress: 0,
      milestones: []
    });
  };

  const handleEditProject = (project: any) => {
    setEditingId(project.id);
    setNewProject({
      title: project.title || '',
      category: project.category || 'Remodel',
      description: project.description || '',
      services: project.services ? project.services.join(', ') : '',
      tags: project.tags ? project.tags.join(', ') : '',
      materials: project.materials ? project.materials.join(', ') : '',
      completionDate: project.completionDate || '',
      image: project.image || '',
      gallery: project.gallery || [],
      beforeImage: project.beforeImage || '',
      videoUrl: project.videoUrl || '',
      progress: project.progress !== undefined ? project.progress : 0,
      milestones: project.milestones || []
    });
    setUploadMethod(project.image && project.image.startsWith('data:') ? 'file' : 'url');
    setIsAdding(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, target: 'image' | 'gallery' = 'image') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (target === 'image') {
      const file = files[0];
      if (file.size > 800000) {
        alert('File is too large. Max 800KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      const remaining = 6 - (newProject.gallery?.length || 0);
      const toProcess = Array.from(files).slice(0, remaining);

      toProcess.forEach((file: File) => {
        if (file.size > 500000) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewProject(prev => ({ 
            ...prev, 
            gallery: [...(prev.gallery || []), reader.result as string] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index)
    }));
  };

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
        services: typeof newProject.services === 'string' 
          ? newProject.services.split(',').map(s => s.trim()).filter(s => s !== '')
          : newProject.services,
        tags: typeof newProject.tags === 'string'
          ? newProject.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '')
          : newProject.tags,
        materials: typeof newProject.materials === 'string'
          ? newProject.materials.split(',').map(m => m.trim()).filter(m => m !== '')
          : newProject.materials,
        progress: typeof newProject.progress === 'number' ? newProject.progress : parseInt(newProject.progress) || 0,
        milestones: newProject.milestones || []
      };

      if (editingId) {
        await updateProject(editingId, projectData);
      } else {
        await addProject(projectData);
      }

      setIsAdding(false);
      resetProjectForm();
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
          <h1 className="text-5xl font-display font-extrabold text-primary-900 tracking-tight mb-2 leading-none">Project Portfolio</h1>
          <p className="text-slate-500 font-medium">Add and manage showcase projects with progress tracking.</p>
        </div>
        <button 
          onClick={() => {
            resetProjectForm();
            setIsAdding(true);
          }}
          className="bg-accent-orange text-white px-8 py-4 rounded-lg text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-accent-orange/20 hover:bg-black transition-all"
        >
          <Plus size={16} /> Add New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project: any) => (
          <div key={project.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm group flex flex-col h-full">
            <div className="h-48 relative">
              <img src={project.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => handleEditProject(project)}
                  className="p-3 bg-white rounded-full text-primary-900 hover:bg-accent-orange hover:text-white transition-all shadow-lg"
                >
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
            <div className="p-8 flex flex-col flex-grow">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded mb-3 inline-block self-start">
                {project.category}
              </span>
              <h3 className="font-display font-bold text-primary-900 tracking-tight text-xl mb-4 leading-tight">
                {project.title}
              </h3>
              <p className="text-slate-500 text-xs line-clamp-2 mb-6 font-medium">
                {project.description}
              </p>

              {/* Progress & Milestones Tracking Block */}
              <div className="mt-auto pt-4 border-t border-slate-50 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Project Progress</span>
                  <span className="text-accent-orange font-bold font-mono">{project.progress || 0}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-accent-orange rounded-full transition-all duration-500"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
                
                {project.milestones && project.milestones.length > 0 ? (
                  <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Milestones Completed</span>
                    <span className="font-bold text-slate-500 font-mono">
                      {project.milestones.filter((m: any) => m.completed).length} / {project.milestones.length}
                    </span>
                  </div>
                ) : (
                  <div className="text-[9px] font-semibold text-slate-300 uppercase tracking-wider">
                    No milestones configured
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-50">
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

      {/* Add/Edit Project Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAdding(false);
                resetProjectForm();
              }}
              className="absolute inset-0 bg-primary-900/95 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-xl rounded-xl p-8 md:p-12 relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <button 
                onClick={() => {
                  setIsAdding(false);
                  resetProjectForm();
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-primary-900 transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="text-3xl font-display font-extrabold text-primary-900 tracking-tight mb-8 leading-tight">
                {editingId ? 'Edit Project' : 'Add New Project'}
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Image</label>
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                      <button 
                        type="button"
                        onClick={() => setUploadMethod('file')}
                        className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-md transition-all ${uploadMethod === 'file' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-400'}`}
                      >
                        Upload
                      </button>
                      <button 
                        type="button"
                        onClick={() => setUploadMethod('url')}
                        className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-md transition-all ${uploadMethod === 'url' ? 'bg-white text-primary-900 shadow-sm' : 'text-slate-400'}`}
                      >
                        URL
                      </button>
                    </div>
                  </div>

                  {uploadMethod === 'file' ? (
                    <div className="space-y-4">
                      <div className="relative group">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          id="project-image-upload"
                          className="hidden"
                        />
                        <label 
                          htmlFor="project-image-upload"
                          className="w-full h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-accent-orange hover:bg-orange-50 transition-all overflow-hidden"
                        >
                          {newProject.image ? (
                            <img src={newProject.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-accent-orange group-hover:bg-white transition-colors">
                                <Upload size={20} />
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] font-black text-primary-900 uppercase tracking-widest">Click to select</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">MAX 800KB</p>
                              </div>
                            </>
                          )}
                        </label>
                        {newProject.image && (
                          <button 
                            type="button"
                            onClick={() => setNewProject(p => ({ ...p, image: '' }))}
                            className="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <input 
                      required
                      value={newProject.image}
                      onChange={e => setNewProject(p => ({ ...p, image: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded focus:ring-2 focus:ring-accent-orange outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Project Gallery (Max 6)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(newProject.gallery || []).map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {(newProject.gallery?.length || 0) < 6 && (
                      <label className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 hover:border-accent-orange hover:text-accent-orange cursor-pointer transition-all">
                        <Upload size={16} />
                        <input 
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'gallery')}
                        />
                      </label>
                    )}
                  </div>
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

                {/* Progress & Milestones Section */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary-900 font-bold">Project Progress Percentage</label>
                      <span className="text-sm font-black font-mono text-accent-orange">{newProject.progress || 0}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={newProject.progress || 0}
                        onChange={e => setNewProject(p => ({ ...p, progress: parseInt(e.target.value) || 0 }))}
                        className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent-orange"
                      />
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={newProject.progress || 0}
                        onChange={e => {
                          let val = parseInt(e.target.value);
                          if (isNaN(val)) val = 0;
                          if (val > 100) val = 100;
                          if (val < 0) val = 0;
                          setNewProject(p => ({ ...p, progress: val }));
                        }}
                        className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded text-center text-xs font-bold font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Milestones Array Manager */}
                  <div className="space-y-4 pt-4 border-t border-slate-200/60">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary-900 font-bold">Milestones & Phases List</label>
                      <button
                        type="button"
                        onClick={() => {
                          const newMs = {
                            id: Math.random().toString(36).substr(2, 9),
                            title: '',
                            completed: false
                          };
                          setNewProject(p => ({
                            ...p,
                            milestones: [...(p.milestones || []), newMs]
                          }));
                        }}
                        className="text-accent-orange hover:text-orange-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all"
                      >
                        <PlusCircle size={14} /> Add Phase
                      </button>
                    </div>

                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                      Define the phases of this construction project and check them off as work progresses.
                    </p>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {(newProject.milestones || []).map((ms, idx) => (
                        <div key={ms.id} className="flex gap-2.5 items-center bg-white p-2.5 rounded-lg border border-slate-200/60">
                          <input 
                            type="checkbox"
                            checked={ms.completed}
                            onChange={e => {
                              const updated = (newProject.milestones || []).map((m, i) => {
                                if (i === idx) {
                                  return { ...m, completed: e.target.checked };
                                }
                                return m;
                              });
                              
                              const completedCount = updated.filter(m => m.completed).length;
                              const totalCount = updated.length;
                              const newPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : newProject.progress;
                              
                              setNewProject(p => ({
                                ...p,
                                milestones: updated,
                                progress: newPct
                              }));
                            }}
                            className="w-4 h-4 rounded text-accent-orange focus:ring-accent-orange cursor-pointer"
                          />
                          <input 
                            required
                            type="text"
                            value={ms.title}
                            onChange={e => {
                              const updated = (newProject.milestones || []).map((m, i) => {
                                if (i === idx) {
                                  return { ...m, title: e.target.value };
                                }
                                return m;
                              });
                              setNewProject(p => ({ ...p, milestones: updated }));
                            }}
                            placeholder={`Phase ${idx+1} (e.g. Foundation Pour)`}
                            className="flex-grow bg-slate-50 px-3 py-1.5 rounded text-xs font-bold outline-none border border-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (newProject.milestones || []).filter((_, i) => i !== idx);
                              const completedCount = updated.filter(m => m.completed).length;
                              const totalCount = updated.length;
                              const newPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                              
                              setNewProject(p => ({
                                ...p,
                                milestones: updated,
                                progress: newPct
                              }));
                            }}
                            className="text-slate-300 hover:text-red-500 p-1.5 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {(newProject.milestones || []).length === 0 && (
                        <div className="py-4 text-center border-2 border-dashed border-slate-200 rounded-lg">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No custom milestones configured yet.</p>
                        </div>
                      )}
                    </div>

                    {(newProject.milestones || []).length > 0 && (
                      <div className="flex gap-4 justify-between items-center text-[9px] font-black uppercase text-slate-400 bg-slate-100 p-2.5 rounded">
                        <span>Milestone Calculation:</span>
                        <span className="text-primary-900 font-bold">
                          {(newProject.milestones || []).filter(m => m.completed).length} / {(newProject.milestones || []).length} phases done &rarr; {
                            Math.round(((newProject.milestones || []).filter(m => m.completed).length / (newProject.milestones || []).length) * 100)
                          }%
                        </span>
                      </div>
                    )}
                  </div>
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

function TestimonialsView({ testimonials }: any) {
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), { status: newStatus });
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const analyzeSentiment = (quote: string): 'Positive' | 'Neutral' => {
    if (!quote) return 'Neutral';
    const text = quote.toLowerCase();
    const positiveKeywords = [
      'great', 'awesome', 'excellent', 'amazing', 'perfect', 'fantastic', 
      'outstanding', 'love', 'loved', 'highly', 'professional', 'recommend', 
      'recommends', 'happy', 'best', 'good', 'brilliant', 'wonderful', 
      'pleased', 'exceeded', 'clean', 'tidy', 'neat', 'superb', 'beautiful',
      'impressed', 'stellar', 'perfectly', 'top', 'quality', 'efficient',
      'professionalism', 'friendly', 'courteous', 'punctual', 'reliable'
    ];
    const hasPositiveKeyword = positiveKeywords.some(word => text.includes(word));
    return hasPositiveKeyword ? 'Positive' : 'Neutral';
  };

  const totalCount = testimonials.length;
  const pendingCount = testimonials.filter((t: any) => t.status === 'pending').length;
  const positiveCount = testimonials.filter((t: any) => analyzeSentiment(t.quote) === 'Positive').length;
  const neutralCount = testimonials.filter((t: any) => analyzeSentiment(t.quote) === 'Neutral').length;

  const filteredTestimonials = testimonials.filter((t: any) => {
    const sentiment = analyzeSentiment(t.quote);
    const sentimentMatch = selectedSentiment === 'all' || sentiment.toLowerCase() === selectedSentiment;
    const statusMatch = selectedStatus === 'all' || t.status === selectedStatus;
    const textStr = `${t.name || ''} ${t.role || ''} ${t.location || ''} ${t.quote || ''}`.toLowerCase();
    const searchMatch = searchQuery.trim() === '' || textStr.includes(searchQuery.toLowerCase());
    return sentimentMatch && statusMatch && searchMatch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-display font-extrabold text-primary-900 tracking-tight mb-2 leading-none">Client Reviews</h1>
          <p className="text-slate-500 font-medium">Manage customer feedback and testimonials.</p>
        </div>
      </div>

      {/* Sentiment & Status metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Feedback</p>
          <p className="text-3xl font-display font-bold text-primary-900 mt-2">{totalCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Positive Sentiment</p>
            <p className="text-3xl font-display font-bold text-green-600 mt-2">{positiveCount}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl text-green-600 border border-green-100">
            <Smile size={24} className="stroke-[2.5]" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neutral Sentiment</p>
            <p className="text-3xl font-display font-bold text-slate-500 mt-2">{neutralCount}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl text-slate-500 border border-slate-100">
            <Meh size={24} className="stroke-[2.5]" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Approval</p>
            <p className="text-3xl font-display font-bold text-orange-500 mt-2">{pendingCount}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl text-orange-500 border border-orange-100">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Toolbar with Filter & Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search reviews by name, client, content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-accent-orange outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            {/* Sentiment Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sentiment:</span>
              <select 
                value={selectedSentiment}
                onChange={(e) => setSelectedSentiment(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-primary-900 uppercase tracking-tight py-2.5 px-4 outline-none focus:ring-2 focus:ring-accent-orange cursor-pointer"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive Only</option>
                <option value="neutral">Neutral Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status:</span>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-primary-900 uppercase tracking-tight py-2.5 px-4 outline-none focus:ring-2 focus:ring-accent-orange cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedSentiment !== 'all' || selectedStatus !== 'all' || searchQuery !== '') && (
              <button 
                onClick={() => {
                  setSelectedSentiment('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                title="Clear Filters"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Feedback</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Sentiment</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTestimonials.map((t: any) => {
              const sentiment = analyzeSentiment(t.quote);
              return (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-black text-primary-900 uppercase tracking-tight text-sm">{t.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t.role}</p>
                    <p className="text-[10px] text-accent-blue font-black uppercase tracking-widest">{t.location}</p>
                    {t.invoiceNumber && (
                      <span className="inline-flex items-center gap-1 mt-1 bg-green-50 text-green-700 px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-green-100">
                        <CheckCircle2 size={10} className="stroke-[3]" /> Auto-Verified ({t.invoiceNumber})
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 max-w-md">
                    <p className="text-slate-600 text-xs italic line-clamp-3 font-medium">"{t.quote}"</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < (t.rating || 0) ? 'text-accent-orange fill-accent-orange' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {sentiment === 'Positive' ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                        <Smile size={12} className="stroke-[3] text-green-600" /> Positive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">
                        <Meh size={12} className="stroke-[3] text-slate-500" /> Neutral
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full outline-none appearance-none cursor-pointer border-none ${
                        t.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => deleteTestimonial(t.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTestimonials.length === 0 && (
          <div className="py-24 text-center">
            <MessageSquare size={48} className="mx-auto text-slate-200 mb-6" />
            <h4 className="text-lg font-black text-primary-900 uppercase tracking-tight">No Reviews Found</h4>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">No reviews match your selected filter criteria.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const CONSTRUCTION_RATES = {
  tiling: { label: 'Tiling (per m²)', rate: 250 },
  painting: { label: 'Painting (per m²)', rate: 85 },
  plumbing: { label: 'Plumbing (per fixture)', rate: 1200 },
  electrical: { label: 'Electrical (per point)', rate: 450 },
  brickwork: { label: 'Brickwork (per m²)', rate: 650 },
  plastering: { label: 'Plastering (per m²)', rate: 120 },
  roofing: { label: 'Roofing (per m²)', rate: 850 },
  ceiling: { label: 'Ceiling Installation (per m²)', rate: 180 }
};

function CostEstimatorView() {
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [rates, setRates] = useState<Record<string, number>>(
    Object.entries(CONSTRUCTION_RATES).reduce((acc, [key, item]) => ({ ...acc, [key]: item.rate }), {})
  );
  const [markup, setMarkup] = useState(25); // Default 25% profit markup

  const updateQuantity = (key: string, qty: string) => {
    const val = parseFloat(qty) || 0;
    setSelections(prev => ({ ...prev, [key]: val }));
  };

  const updateRate = (key: string, rate: string) => {
    const val = parseFloat(rate) || 0;
    setRates(prev => ({ ...prev, [key]: val }));
  };

  const calculateSubtotal = () => {
    return Object.entries(selections).reduce((acc: number, [key, qty]: [string, number]) => {
      const rate = rates[key] || 0;
      return acc + (qty * rate);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const profit = (subtotal * markup) / 100;
  const total = subtotal + profit;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div>
        <h1 className="text-5xl font-display font-extrabold text-primary-900 tracking-tight mb-2 leading-none">Cost Estimator</h1>
        <p className="text-slate-500 font-medium">Quick estimate tool based on standard South African rates (ZAR).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-50 pb-4">Service Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {Object.entries(CONSTRUCTION_RATES).map(([key, item]) => (
                <div key={key} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-black text-primary-900 uppercase tracking-tight">{item.label}</label>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">R</span>
                      <input 
                        type="number"
                        value={rates[key]}
                        onChange={(e) => updateRate(key, e.target.value)}
                        className="w-16 bg-transparent border-b border-slate-100 text-[10px] text-slate-500 font-bold focus:border-accent-orange outline-none transition-colors text-right"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder="0"
                      onChange={(e) => updateQuantity(key, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-accent-orange outline-none transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">Qty</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary-900 text-white p-10 rounded-2xl shadow-2xl shadow-primary-900/40 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-orange/10 rounded-full blur-3xl" />
            
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-8 leading-none">Estimate Summary</h3>
            
            <div className="space-y-6 mb-10 pb-10 border-b border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold opacity-60">Subtotal (Labour & Material)</span>
                <span className="font-black tracking-tight">R {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                   <span className="text-sm font-bold opacity-60 block text-white/40">Profit Markup (%)</span>
                   <input 
                    type="number" 
                    value={markup}
                    onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-white/10 border-none px-2 py-1 rounded text-xs font-black outline-none focus:ring-1 focus:ring-accent-orange"
                   />
                </div>
                <span className="font-black tracking-tight text-accent-orange">+ R {profit.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent-blue">Estimated Total</p>
              <p className="text-6xl font-display font-extrabold tracking-tight leading-none">
                R {total.toLocaleString()}
              </p>
            </div>

            <button 
              onClick={() => window.print()}
              className="w-full mt-12 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2"
            >
              Export Estimate
            </button>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent-orange rounded-full" />
              Contractor Note
            </h4>
            <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
              These rates are approximations for the Pietermaritzburg area. Material costs may vary significantly based on brand selection and site conditions. Always conduct a site visit before finalizing a quote.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
