import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, DollarSign, Clock, Briefcase, ArrowLeft,
  Bookmark, Gift, FileText, AlertCircle
} from 'lucide-react';
import { getJobById } from '../lib/db';
import { useSavedJobs } from '../hooks/useSavedJobs';
import { usePageMeta } from '../hooks/usePageMeta';

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useSavedJobs();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  usePageMeta(
    job ? `${job.title} at ${job.company || 'Career Bridge'} | Career Bridge` : 'Job Details | Career Bridge',
    job?.description ? String(job.description).slice(0, 155) : undefined
  );

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getJobById(id)
      .then(setJob)
      .catch((err) => console.error('Failed to load job', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-6 py-16 animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="pt-16 min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6 py-20">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-[#F59E0B]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Job Not Found</h1>
          <p className="text-gray-500 mb-8">This job may have been removed or the link is incorrect.</p>
          <Link to="/jobs" className="inline-flex items-center gap-2 bg-[#0F4C81] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A3860] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = job.status === 'closed';
  const logoInitials = job.logo || job.company?.split(' ')[0]?.slice(0, 2)?.toUpperCase() || '??';

  return (
    <div className="pt-16 min-h-screen bg-[#F8FAFC]">
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#0A2040] py-12">
        <div className="max-w-3xl mx-auto px-6">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center font-bold text-[#0F4C81] text-lg flex-shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {logoInitials}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{job.title}</h1>
                {isClosed ? (
                  <span className="text-xs bg-rose-500/20 text-rose-200 border border-rose-300/30 px-3 py-1 rounded-full font-semibold">Closed</span>
                ) : (
                  <span className="text-xs bg-green-500/20 text-green-200 border border-green-300/30 px-3 py-1 rounded-full font-semibold">{job.type || 'Full-time'}</span>
                )}
              </div>
              <p className="text-blue-200">{job.company}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-wrap gap-5 pb-6 border-b border-gray-100 mb-6">
            {job.location && (
              <span className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-[#0F4C81]" />{job.location}</span>
            )}
            {job.salary && (
              <span className="flex items-center gap-2 text-sm text-gray-600"><DollarSign className="w-4 h-4 text-[#F59E0B]" />{job.salary}</span>
            )}
            {job.experience && (
              <span className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4 text-gray-400" />{job.experience}</span>
            )}
            {job.category && (
              <span className="flex items-center gap-2 text-sm text-gray-600"><Briefcase className="w-4 h-4 text-gray-400" />{job.category}</span>
            )}
          </div>

          {job.description && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Job Description</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{job.description}</p>
            </div>
          )}

          {job.requirements && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <FileText className="w-5 h-5 text-[#0F4C81]" /> Requirements
              </h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{job.requirements}</p>
            </div>
          )}

          {job.benefits && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Gift className="w-5 h-5 text-[#F59E0B]" /> Benefits
              </h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{job.benefits}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate(`/upload-cv?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title || '')}`)}
              disabled={isClosed}
              className="flex-1 bg-[#0F4C81] text-white font-bold py-3.5 rounded-xl hover:bg-[#0A3860] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClosed ? 'This position is closed' : 'Apply Now'}
            </button>
            <button
              onClick={() => toggleSaved(job.id)}
              className={`flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-xl border transition-colors ${
                isSaved(job.id)
                  ? 'bg-amber-50 border-amber-200 text-[#F59E0B]'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-amber-200 hover:text-[#F59E0B]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved(job.id) ? 'fill-[#F59E0B]' : ''}`} />
              {isSaved(job.id) ? 'Saved' : 'Save Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
