import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserCandidates,
  getUserMessages,
  getUserConsultations,
  getUserCompanyRequests,
} from "../lib/db";
import { FileText, MessageSquare, Briefcase, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

export default function DashboardPage() {
  const { currentUser, userRole } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    async function loadData() {
      try {
        const [cands, msgs, cons, comps] = await Promise.all([
          getUserCandidates(currentUser!.uid),
          getUserMessages(currentUser!.uid),
          getUserConsultations(currentUser!.uid),
          getUserCompanyRequests(currentUser!.uid),
        ]);
        setCandidates(cands);
        setMessages(msgs);
        setConsultations(cons);
        setCompanies(comps);
      } catch (err) {
        console.error("Error loading user dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="pt-32 text-center pb-20">
        <h2 className="text-2xl font-bold">Please log in to view your dashboard.</h2>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "confirmed":
      case "published":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
      case "new":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
      case "confirmed":
      case "published":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          My Dashboard
        </h1>
        <p className="text-gray-500 mt-2">View and track all your applications, requests, and messages.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-gray-200 rounded-3xl" />
          <div className="h-64 bg-gray-200 rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Candidates / Job Applications */}
          {candidates.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#0F4C81]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Job Applications</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <h3 className="font-bold text-lg text-gray-900">{c.jobTitle || "General Application"}</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">{new Date(c.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                      {getStatusIcon(c.status)}
                      {c.status.toUpperCase()}
                    </div>
                    {c.feedback && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
                        <span className="font-semibold block mb-1">Feedback:</span>
                        {c.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hiring Requests (Companies) */}
          {companies.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Hiring Requests</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <h3 className="font-bold text-lg text-gray-900">{c.jobTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">{c.company}</p>
                    <p className="text-sm text-gray-500 mb-4">{new Date(c.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                      {getStatusIcon(c.status)}
                      {c.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Consultations */}
          {consultations.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Consultations</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consultations.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <h3 className="font-bold text-lg text-gray-900">{c.service}</h3>
                    <p className="text-sm text-gray-600 mt-1">{c.date} at {c.time}</p>
                    <p className="text-sm text-gray-500 mb-4">{c.meeting === "online" ? "Online via Zoom" : "In-Person, Cairo"}</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                      {getStatusIcon(c.status)}
                      {c.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Messages</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {messages.map(m => (
                  <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <h3 className="font-bold text-lg text-gray-900">{m.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">{new Date(m.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(m.status)}`}>
                      {getStatusIcon(m.status)}
                      {m.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {candidates.length === 0 && companies.length === 0 && consultations.length === 0 && messages.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-500">When you apply for jobs or request services, they will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
