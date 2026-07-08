import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Users, FileText, Building2, Plus,
  Bell, Settings, LogOut, MessageSquare,
  UserCheck, UserX, Trash2, Download, Edit,
  Shield, Menu, Search, LayoutDashboard, Calendar,
  X, CheckCircle, Eye
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToCandidates, subscribeToJobs, subscribeToCompanies,
  subscribeToMessages, subscribeToConsultations,
  updateCandidateStatus, deleteMessage, updateJob, addJob, deleteJob,
  updateConsultationStatus, updateCompanyRequestStatus
} from '../lib/db';
import { db } from '../lib/firebase';
import { updateDoc, doc } from 'firebase/firestore';

import CMSAdmin from '../components/CMSAdmin';

type AdminSection = "overview" | "candidates" | "jobs" | "companies" | "messages" | "consultations" | "cms";

// ─── Loading Skeleton ───
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
}

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ───
function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, userRole, loading: authLoading, loginWithEmail, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // All data starts empty - populated only from Firestore
  const [candidates, setCandidates] = useState<any[]>([]);
  const [adminJobs, setAdminJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);

  // Search states
  const [candidateSearch, setCandidateSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Job form modal
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [pendingPublishRequestId, setPendingPublishRequestId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    title: "", company: "", location: "", salary: "", type: "Full-time",
    experience: "", category: "Technology", description: "", requirements: "", logo: ""
  });

  // Real-time subscriptions
  useEffect(() => {
    if (userRole !== 'admin') return;
    
    setDataLoading(true);
    let loaded = 0;
    const checkLoaded = () => { loaded++; if (loaded >= 5) setDataLoading(false); };

    const unsubs = [
      subscribeToCandidates((data) => { setCandidates(data); checkLoaded(); }),
      subscribeToJobs((data) => { setAdminJobs(data); checkLoaded(); }),
      subscribeToCompanies((data) => { setCompanies(data); checkLoaded(); }),
      subscribeToMessages((data) => { setMessages(data); checkLoaded(); }),
      subscribeToConsultations((data) => { setConsultations(data); checkLoaded(); }),
    ];

    // Timeout fallback in case some collections are empty (onSnapshot fires once even for empty)
    const timeout = setTimeout(() => setDataLoading(false), 3000);

    return () => {
      unsubs.forEach(u => u());
      clearTimeout(timeout);
    };
  }, [userRole]);

  // Dynamic stats calculated from real data
  const adminStats = [
    { label: "Total Candidates", value: candidates.length.toLocaleString(), change: `${candidates.filter(c => c.status === 'pending').length} pending`, icon: Users },
    { label: "Total Companies", value: companies.length.toLocaleString(), change: `${companies.filter(c => c.status === 'active').length} active`, icon: Building2 },
    { label: "CVs Uploaded", value: candidates.filter(c => c.cvUrl).length.toLocaleString(), change: "with CV files", icon: FileText },
    { label: "Open Jobs", value: adminJobs.filter(j => j.status === 'open').length.toLocaleString(), change: `${adminJobs.length} total`, icon: Briefcase },
    { label: "Messages", value: messages.filter(m => m.status === 'new').length.toLocaleString(), change: `${messages.length} total`, icon: MessageSquare },
  ];

  // ─── Actions ───
  const handleAcceptCandidate = async (id: string) => {
    const feedback = window.prompt("Optional: Enter a message for the candidate (e.g. Interview scheduled for tomorrow):") || "";
    try {
      await updateCandidateStatus(id, 'accepted', feedback);
      toast.success("Candidate accepted successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to accept candidate");
    }
  };

  const handleRejectCandidate = async (id: string) => {
    const feedback = window.prompt("Optional: Enter feedback for rejection:") || "";
    try {
      await updateCandidateStatus(id, 'rejected', feedback);
      toast.success("Candidate rejected");
    } catch (e) {
      console.error(e);
      toast.error("Failed to reject candidate");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteMessage(id);
      toast.success("Message deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete message");
    }
  };

  const handleMarkMessageRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'messages', id), { status: 'read' });
      toast.success("Marked as read");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update message");
    }
  };

  const handleConfirmConsultation = async (id: string) => {
    try {
      await updateConsultationStatus(id, 'confirmed');
      toast.success("Consultation confirmed");
    } catch (e) {
      console.error(e);
      toast.error("Failed to confirm consultation");
    }
  };

  const handleCancelConsultation = async (id: string) => {
    try {
      await updateConsultationStatus(id, 'cancelled');
      toast.success("Consultation cancelled");
    } catch (e) {
      console.error(e);
      toast.error("Failed to cancel consultation");
    }
  };

  // ─── Job CRUD ───
  const resetJobForm = () => {
    setJobForm({ title: "", company: "", location: "", salary: "", type: "Full-time", experience: "", category: "Technology", description: "", requirements: "", logo: "" });
    setEditingJob(null);
    setPendingPublishRequestId(null);
    setShowJobModal(false);
  };

  const handleSaveJob = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.location) {
      toast.error("Please fill in the required fields (Title, Company, Location)");
      return;
    }
    try {
      if (editingJob) {
        await updateJob(editingJob.id, jobForm);
        toast.success("Job updated successfully");
      } else {
        await addJob({ ...jobForm, logo: jobForm.company.split(" ")[0].slice(0, 2).toUpperCase() });
        toast.success("Job added successfully");
        
        if (pendingPublishRequestId) {
          await updateCompanyRequestStatus(pendingPublishRequestId, 'published');
        }
      }
      resetJobForm();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save job");
    }
  };

  const handlePublishJobFromRequest = (c: any) => {
    setJobForm({
      title: c.jobTitle || "",
      company: c.company || c.name || "",
      location: "",
      salary: "",
      type: "Full-time",
      experience: "",
      category: "Other",
      description: c.description || "",
      requirements: "",
      logo: c.company ? c.company.split(" ")[0].slice(0, 2).toUpperCase() : (c.name?.split(" ")[0].slice(0, 2).toUpperCase() || "")
    });
    setEditingJob(null);
    setPendingPublishRequestId(c.id);
    setShowJobModal(true);
    setActiveSection("jobs");
  };

  const handleEditJob = (job: any) => {
    setJobForm({
      title: job.title || "", company: job.company || "", location: job.location || "",
      salary: job.salary || "", type: job.type || "Full-time", experience: job.experience || "",
      category: job.category || "Technology", description: job.description || "", requirements: job.requirements || "", logo: job.logo || ""
    });
    setEditingJob(job);
    setShowJobModal(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id);
      toast.success("Job deleted successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete job");
    }
  };

  const handleToggleJobStatus = async (job: any) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await updateJob(job.id, { status: newStatus });
      toast.success(`Job ${newStatus === 'open' ? 'reopened' : 'closed'}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update job status");
    }
  };

  // ─── Helpers ───
  const badge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-50 text-amber-600 border-amber-500/30",
      accepted: "bg-emerald-50 text-emerald-600 border-emerald-500/30",
      rejected: "bg-rose-50 text-rose-600 border-rose-500/30",
      open: "bg-blue-50 text-blue-600 border-blue-500/30",
      closed: "bg-gray-100 text-gray-500 border-slate-200",
      active: "bg-emerald-50 text-emerald-600 border-emerald-500/30",
      inactive: "bg-gray-100 text-gray-500 border-slate-200",
      new: "bg-blue-50 text-blue-600 border-blue-500/30",
      read: "bg-gray-100 text-gray-500 border-slate-200",
      confirmed: "bg-emerald-50 text-emerald-600 border-emerald-500/30",
      cancelled: "bg-rose-50 text-rose-600 border-rose-500/30",
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status] || "bg-gray-100 text-gray-600"}`;
  };

  const navItems: { key: AdminSection; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "candidates", label: "Candidates", icon: Users, count: candidates.length },
    { key: "jobs", label: "Jobs", icon: Briefcase, count: adminJobs.length },
    { key: "companies", label: "Companies", icon: Building2, count: companies.length },
    { key: "messages", label: "Messages", icon: MessageSquare, count: messages.filter(m => m.status === 'new').length },
    { key: "consultations", label: "Consultations", icon: Calendar, count: consultations.filter(c => c.status === 'pending').length },
    { key: "cms", label: "Content (CMS)", icon: Settings },
  ];

  const initials = (name: string) => name ? name.split(" ").map(n => n[0]).join("") : "?";

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const timeAgo = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // ─── Filtered data ───
  const filteredCandidates = candidates.filter(c => {
    const q = candidateSearch.toLowerCase();
    if (!q) return true;
    return (c.name?.toLowerCase().includes(q) || c.role?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
  });

  const filteredJobs = adminJobs.filter(j => {
    const q = jobSearch.toLowerCase();
    if (!q) return true;
    return (j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q));
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // ─── Auth States ───
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0F4C81] flex items-center justify-center animate-pulse">
            <Briefcase className="w-6 h-6 text-gray-900" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await loginWithEmail(email, password);
      toast.success("Signed in successfully");
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || "An error occurred");
      toast.error(err.message || "Failed to sign in");
    }
  };

  if (!currentUser || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Admin Access</h2>
          <p className="text-gray-500 mb-8">Please sign in with your administrator credentials to access the dashboard.</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-4 mb-6">
            <div>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10 text-left"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10 text-left"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-sm text-left">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-[#0F4C81] text-white font-semibold py-3.5 rounded-xl hover:bg-[#0A3860] transition-colors flex items-center justify-center gap-2"
            >
              Sign In as Admin
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200">
            <button onClick={() => navigate("/")} className="text-sm text-gray-500 hover:text-gray-900 font-medium">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"}
          bg-slate-950/95 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col transition-all duration-300 flex-shrink-0 overflow-hidden
        `}>
          <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            {(sidebarOpen || window.innerWidth < 1024) && (
              <span className="font-bold text-white text-lg whitespace-nowrap tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Career<span className="text-amber-400">Bridge</span>
              </span>
            )}
            {/* Close button for mobile */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => {
                setActiveSection(key);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium text-sm ${
                activeSection === key
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.4)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(sidebarOpen || window.innerWidth < 1024) && (
                <span className="flex-1 text-left whitespace-nowrap">{label}</span>
              )}
              {(sidebarOpen || window.innerWidth < 1024) && count !== undefined && count > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  activeSection === key ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-300"
                }`}>{count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {(sidebarOpen || window.innerWidth < 1024) && <span>Back to Site</span>}
          </button>
          <button onClick={() => logout()} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors group">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(sidebarOpen || window.innerWidth < 1024) && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-gray-900 text-base lg:text-lg capitalize tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {activeSection === "overview" ? "Dashboard Overview" : activeSection}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {messages.filter(m => m.status === 'new').length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white">
                  {initials(currentUser?.displayName || "A")}
                </div>
              )}
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">{currentUser?.displayName || "Admin"}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {/* ═══ OVERVIEW ═══ */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {dataLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
                  {adminStats.map(({ label, value, change, icon: Icon }) => (
                    <div key={label} className="group bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-gray-500">{label}</p>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                      <p className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</p>
                      <p className="text-xs text-gray-500 font-medium">{change}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                  <div className="p-6 border-b border-slate-50 bg-[#F8FAFC]">
                    <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Applications</h3>
                  </div>
                  {dataLoading ? <TableSkeleton rows={4} cols={3} /> : candidates.length === 0 ? (
                    <EmptyState icon={Users} title="No candidates yet" description="Candidates will appear here when they submit their CVs through the website." />
                  ) : (
                    <div className="p-2">
                      {candidates.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white transition-colors group">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                            {initials(c.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.jobTitle || c.position || c.role || "Candidate"} · {timeAgo(c.createdAt)}</p>
                          </div>
                          <span className={badge(c.status)}>{c.status}</span>
                          <button onClick={() => setSelectedCandidate(c)} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100" title="View Details">
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                  <div className="p-6 border-b border-slate-50 bg-[#F8FAFC]">
                    <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Contact Messages</h3>
                  </div>
                  {dataLoading ? <TableSkeleton rows={4} cols={3} /> : messages.length === 0 ? (
                    <EmptyState icon={MessageSquare} title="No messages yet" description="Messages from the contact form will appear here." />
                  ) : (
                    <div className="p-2">
                      {messages.slice(0, 5).map(m => (
                        <div key={m.id} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white transition-colors group">
                          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-xs font-bold flex-shrink-0">
                            {initials(m.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                            <p className="text-xs text-gray-500 truncate">{m.subject} · {timeAgo(m.createdAt)}</p>
                          </div>
                          <span className={badge(m.status)}>{m.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ CANDIDATES ═══ */}
          {activeSection === "candidates" && (
            <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-[#F8FAFC]">
                <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>All Candidates</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={candidateSearch}
                    onChange={e => setCandidateSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] w-56"
                  />
                </div>
              </div>
              {dataLoading ? <TableSkeleton rows={6} cols={7} /> : filteredCandidates.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={candidateSearch ? "No matching candidates" : "No candidates yet"}
                  description={candidateSearch ? "Try adjusting your search term." : "Candidates will appear here when they apply through the website."}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-y border-slate-200">
                      <tr>
                        {["Candidate", "Position", "Email", "Phone", "CV", "Status", "Actions"].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredCandidates.map(c => (
                        <tr key={c.id} className="hover:bg-white/80 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 text-xs font-bold">{initials(c.name)}</div>
                              <div>
                                <span className="font-semibold text-gray-900 text-sm block">{c.name}</span>
                                <span className="text-xs text-gray-500">{timeAgo(c.createdAt)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{c.jobTitle || c.position || c.role || "—"}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{c.email || "—"}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{c.phone || "—"}</td>
                          <td className="px-5 py-4">
                            {c.cvUrl ? (
                              <a href={c.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-amber-600 transition-colors">
                                <Download className="w-3.5 h-3.5" /> Download
                              </a>
                            ) : (
                              <span className="text-xs text-gray-500">No CV</span>
                            )}
                          </td>
                          <td className="px-5 py-4"><span className={badge(c.status)}>{c.status}</span></td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setSelectedCandidate(c)} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors" title="View Details">
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                              <button onClick={() => handleAcceptCandidate(c.id)} className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-green-100 flex items-center justify-center transition-colors" title="Accept">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                              <button onClick={() => handleRejectCandidate(c.id)} className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-red-100 flex items-center justify-center transition-colors" title="Reject">
                                <UserX className="w-3.5 h-3.5 text-rose-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ JOBS ═══ */}
          {activeSection === "jobs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Search jobs..." value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] w-56" />
                </div>
                <button onClick={() => { resetJobForm(); setShowJobModal(true); }}
                  className="flex items-center gap-2 bg-[#0F4C81] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0A3860] transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Add New Job
                </button>
              </div>
              <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-[#F8FAFC]">
                  <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Manage Jobs</h3>
                </div>
                {dataLoading ? <TableSkeleton rows={5} cols={6} /> : filteredJobs.length === 0 ? (
                  <EmptyState icon={Briefcase} title={jobSearch ? "No matching jobs" : "No jobs yet"} description={jobSearch ? "Try adjusting your search." : "Click 'Add New Job' to create your first job listing."} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white border-y border-slate-200">
                        <tr>
                          {["Job Title", "Company", "Location", "Type", "Status", "Actions"].map(h => (
                            <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredJobs.map(job => (
                          <tr key={job.id} className="hover:bg-white/80 transition-colors group">
                            <td className="px-5 py-4 font-semibold text-gray-900 text-sm">{job.title}</td>
                            <td className="px-5 py-4 text-sm text-gray-600">{job.company}</td>
                            <td className="px-5 py-4 text-sm text-gray-600">{job.location}</td>
                            <td className="px-5 py-4 text-sm text-gray-600">{job.type || "Full-time"}</td>
                            <td className="px-5 py-4">
                              <button onClick={() => handleToggleJobStatus(job)} className={badge(job.status)} title="Click to toggle">
                                {job.status}
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => handleEditJob(job)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center transition-colors" title="Edit">
                                  <Edit className="w-3.5 h-3.5 text-amber-600" />
                                </button>
                                <button onClick={() => handleDeleteJob(job.id)} className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-red-100 flex items-center justify-center transition-colors" title="Delete">
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Job Modal */}
              {showJobModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {editingJob ? "Edit Job" : "Add New Job"}
                      </h3>
                      <button onClick={resetJobForm} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        { key: "title", label: "Job Title *", placeholder: "Senior Software Engineer" },
                        { key: "company", label: "Company *", placeholder: "TechCorp Egypt" },
                        { key: "location", label: "Location *", placeholder: "Cairo" },
                        { key: "salary", label: "Salary Range", placeholder: "$2,000–$3,000" },
                        { key: "experience", label: "Experience Required", placeholder: "3–5 years" },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label className="text-sm font-semibold text-gray-600 block mb-1.5">{label}</label>
                          <input type="text" placeholder={placeholder} value={jobForm[key as keyof typeof jobForm]}
                            onChange={e => setJobForm(f => ({ ...f, [key]: e.target.value }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10" />
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-600 block mb-1.5">Type</label>
                          <select value={jobForm.type} onChange={e => setJobForm(f => ({ ...f, type: e.target.value }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            {["Full-time", "Part-time", "Contract", "Remote"].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600 block mb-1.5">Category</label>
                          <select value={jobForm.category} onChange={e => setJobForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            {["Technology", "Marketing", "HR", "Finance", "Design", "Sales", "Engineering", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-1.5">Description</label>
                        <textarea rows={3} placeholder="Job description..." value={jobForm.description}
                          onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] resize-none" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-1.5">Requirements</label>
                        <textarea rows={3} placeholder="Job requirements..." value={jobForm.requirements}
                          onChange={e => setJobForm(f => ({ ...f, requirements: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] resize-none" />
                      </div>
                    </div>
                    <div className="p-6 border-t border-slate-200 flex gap-3">
                      <button onClick={resetJobForm} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-gray-600 hover:bg-white transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleSaveJob} className="flex-1 py-3 rounded-xl bg-[#0F4C81] text-white text-sm font-semibold hover:bg-[#0A3860] transition-colors">
                        {editingJob ? "Update Job" : "Create Job"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ COMPANIES ═══ */}
          {activeSection === "companies" && (
            <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-[#F8FAFC]">
                <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Hiring Requests</h3>
              </div>
              {dataLoading ? <TableSkeleton rows={4} cols={6} /> : companies.length === 0 ? (
                <EmptyState icon={Building2} title="No company requests yet" description="Company hiring requests from the 'Hire Talent' page will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr>
                        {["Company", "Contact", "Job Title", "Positions", "Date", "Status", "Actions"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {companies.map(c => (
                        <tr key={c.id} className="hover:bg-white/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs">
                                {c.company ? c.company.split(" ")[0].slice(0, 2).toUpperCase() : c.name?.split(" ")[0].slice(0, 2).toUpperCase() || "??"}
                              </div>
                              <span className="font-semibold text-gray-900 text-sm">{c.company || c.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-600">{c.manager || "—"}</p>
                            <p className="text-xs text-gray-500">{c.email || "—"}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{c.jobTitle || "—"}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-900">{c.headcount || "—"}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                          <td className="px-5 py-4"><span className={badge(c.status)}>{c.status}</span></td>
                          <td className="px-5 py-4">
                            {c.status !== 'published' && (
                              <button onClick={() => handlePublishJobFromRequest(c)} className="bg-[#0F4C81] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#0A3860] transition-colors whitespace-nowrap">
                                Publish Job
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ MESSAGES ═══ */}
          {activeSection === "messages" && (
            <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-[#F8FAFC]">
                <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Contact Messages</h3>
              </div>
              {dataLoading ? <TableSkeleton rows={4} cols={4} /> : messages.length === 0 ? (
                <EmptyState icon={MessageSquare} title="No messages yet" description="Contact form submissions from the website will appear here." />
              ) : (
                <div className="divide-y divide-gray-50">
                  {messages.map(m => (
                    <div key={m.id} className="p-5 hover:bg-white/50 transition-colors flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                        {initials(m.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                          <span className={badge(m.status)}>{m.status}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-0.5">{m.subject}</p>
                        {m.message && <p className="text-sm text-gray-500 line-clamp-2 mb-1">{m.message}</p>}
                        <p className="text-xs text-gray-500">{m.email} · {timeAgo(m.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {m.status === 'new' && (
                          <button onClick={() => handleMarkMessageRead(m.id)} className="text-xs bg-[#0F4C81] text-white px-3 py-1.5 rounded-lg hover:bg-[#0A3860] transition-colors font-medium">Mark Read</button>
                        )}
                        <button onClick={() => handleDeleteMessage(m.id)} className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-red-100 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ CONSULTATIONS ═══ */}
          {activeSection === "consultations" && (
            <div className="bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-[#F8FAFC]">
                <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Consultation Requests</h3>
              </div>
              {dataLoading ? <TableSkeleton rows={4} cols={6} /> : consultations.length === 0 ? (
                <EmptyState icon={Calendar} title="No consultations yet" description="Consultation bookings from the website will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-y border-slate-200">
                      <tr>
                        {["Client", "Service", "Date & Time", "Type", "Status", "Actions"].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {consultations.map(c => (
                        <tr key={c.id} className="hover:bg-white/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 text-xs font-bold">{initials(c.name)}</div>
                              <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{c.service || "—"}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {c.date || "—"} {c.time && `at ${c.time}`}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{c.type || "Online"}</td>
                          <td className="px-5 py-4"><span className={badge(c.status)}>{c.status}</span></td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              {c.status === 'pending' && (
                                <>
                                  <button onClick={() => handleConfirmConsultation(c.id)} className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-green-100 flex items-center justify-center transition-colors" title="Confirm">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  </button>
                                  <button onClick={() => handleCancelConsultation(c.id)} className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-red-100 flex items-center justify-center transition-colors" title="Cancel">
                                    <X className="w-3.5 h-3.5 text-rose-600" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ CMS ═══ */}
          {activeSection === "cms" && (
            <CMSAdmin />
          )}

        </main>
      </div>

      {/* ═══ CANDIDATE DETAILS MODAL ═══ */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-100 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {initials(selectedCandidate.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {selectedCandidate.name}
                  </h3>
                  <p className="text-sm text-gray-500">Applied {timeAgo(selectedCandidate.createdAt)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Email</label>
                  <p className="text-sm font-medium text-gray-900">{selectedCandidate.email || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Phone</label>
                  <p className="text-sm font-medium text-gray-900">{selectedCandidate.phone || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Position / Job Title</label>
                  <p className="text-sm font-medium text-gray-900">{selectedCandidate.jobTitle || selectedCandidate.position || selectedCandidate.role || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Years of Experience</label>
                  <p className="text-sm font-medium text-gray-900">{selectedCandidate.years || "—"}</p>
                </div>
                {selectedCandidate.linkedin && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">LinkedIn Profile</label>
                    <a href={selectedCandidate.linkedin.startsWith('http') ? selectedCandidate.linkedin : `https://${selectedCandidate.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                      {selectedCandidate.linkedin}
                    </a>
                  </div>
                )}
                {selectedCandidate.cvUrl && (
                  <div className="sm:col-span-2 mt-2">
                    <a href={selectedCandidate.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                      <Download className="w-4 h-4" />
                      Download CV
                    </a>
                  </div>
                )}
              </div>

              {selectedCandidate.cover && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">Cover Letter / Message</label>
                  <div className="bg-slate-50 p-4 rounded-2xl text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                    {selectedCandidate.cover}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => { handleRejectCandidate(selectedCandidate.id); setSelectedCandidate(null); }}
                className="px-5 py-2.5 rounded-xl font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => { handleAcceptCandidate(selectedCandidate.id); setSelectedCandidate(null); }}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                Accept Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  );
}
