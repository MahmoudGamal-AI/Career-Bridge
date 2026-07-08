import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, MapPin, Clock, DollarSign,
  Search, Filter, ChevronDown, ChevronUp
} from "lucide-react";

import { getJobs } from '../lib/db';

export default function JobsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const firestoreJobs = await getJobs();
        setJobs(firestoreJobs);
      } catch (error) {
        console.error("Failed to fetch jobs from Firestore", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Dynamic filter options from actual data
  const locations = ["All", ...new Set(jobs.map(j => j.location).filter(Boolean))];
  const categories = ["All", ...new Set(jobs.map(j => j.category).filter(Boolean))];
  const types = ["All", ...new Set(jobs.map(j => j.type).filter(Boolean))];

  const filtered = jobs.filter(job => {
    const q = search.toLowerCase();
    return (
      (q === "" || job.title?.toLowerCase().includes(q) || job.company?.toLowerCase().includes(q)) &&
      (location === "All" || job.location === location) &&
      (category === "All" || job.category === category) &&
      (type === "All" || job.type === type)
    );
  });

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#0A2040] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <span className="inline-block text-[#F59E0B] font-semibold text-xs uppercase tracking-widest mb-3">Find Your Next Role</span>
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Browse Jobs</h1>
          <p className="text-blue-200 mb-8">Discover hundreds of opportunities across Egypt and the MENA region.</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search job title or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 text-sm focus:outline-none shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-20">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Filter className="w-4 h-4 text-[#0F4C81]" /> Filters
              </h3>

              {[
                { label: "Location", options: locations, value: location, setter: setLocation, name: "loc" },
                { label: "Category", options: categories, value: category, setter: setCategory, name: "cat" },
                { label: "Employment Type", options: types, value: type, setter: setType, name: "typ" },
              ].map(({ label, options, value, setter, name }) => (
                <div key={name} className="mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
                  {options.map(opt => (
                    <label key={opt} className="flex items-center gap-2 mb-2 cursor-pointer group">
                      <input
                        type="radio"
                        name={name}
                        checked={value === opt}
                        onChange={() => setter(opt)}
                        className="accent-[#0F4C81] w-4 h-4"
                      />
                      <span className={`text-sm transition-colors ${value === opt ? "text-[#0F4C81] font-medium" : "text-gray-600 group-hover:text-gray-900"}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-5">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{filtered.length}</span> jobs found
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="flex gap-4">
                        <div className="h-3 bg-gray-200 rounded w-20" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                      </div>
                    </div>
                    <div className="w-24 h-10 bg-gray-200 rounded-xl flex-shrink-0 self-center" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(job => (
                  <div
                    key={job.id}
                    className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-blue-100 transition-all flex flex-col gap-4 cursor-pointer"
                    onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#EBF4FF] flex items-center justify-center font-bold text-[#0F4C81] text-sm flex-shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {job.logo || job.company?.split(" ")[0]?.slice(0, 2)?.toUpperCase() || "??"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{job.title}</h3>
                          <span className="text-xs bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-medium">{job.type || "Full-time"}</span>
                        </div>
                        <p className="text-gray-500 text-sm mb-3">{job.company}</p>
                        <div className="flex flex-wrap gap-4">
                          {job.location && <span className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin className="w-3.5 h-3.5 text-[#0F4C81]" />{job.location}</span>}
                          {job.salary && <span className="flex items-center gap-1.5 text-xs text-gray-500"><DollarSign className="w-3.5 h-3.5 text-[#F59E0B]" />{job.salary}</span>}
                          {job.experience && <span className="flex items-center gap-1.5 text-xs text-gray-500"><Clock className="w-3.5 h-3.5 text-gray-400" />{job.experience}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/upload-cv?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`);
                          }}
                          className="bg-[#0F4C81] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#F59E0B] transition-colors"
                        >
                          Apply Now
                        </button>
                        <button className="p-2 text-gray-400 hover:text-[#0F4C81] transition-colors">
                          {expandedJobId === job.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    {expandedJobId === job.id && (
                      <div className="pt-4 mt-2 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                        {job.description && (
                          <div className="mb-4">
                            <h4 className="font-bold text-gray-900 mb-2">Job Description</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{job.description}</p>
                          </div>
                        )}
                        {job.requirements && (
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Requirements</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{job.requirements}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {!loading && filtered.length === 0 && (
                  <div className="text-center py-20">
                    {jobs.length === 0 ? (
                      <>
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="font-bold text-gray-900 text-lg mb-2">No jobs available yet</p>
                        <p className="text-gray-500">New openings will be posted here soon. Upload your CV to be notified.</p>
                      </>
                    ) : (
                      <>
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium text-gray-500">No jobs found. Try adjusting your filters.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
