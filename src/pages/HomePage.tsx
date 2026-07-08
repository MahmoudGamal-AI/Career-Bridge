import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import {
  Briefcase, Search, Building2, ArrowRight, TrendingUp, CheckCircle, User,
  MapPin, DollarSign, Clock, ChevronDown, ChevronUp, Upload, Star
} from "lucide-react";

import StatCounter from '../components/common/StatCounter';
import { getJobs, subscribeToCMS } from '../lib/db';
import { usePageMeta } from '../hooks/usePageMeta';

export default function HomePage() {
  usePageMeta("Career Bridge | Egypt's HR & Recruitment Platform", "Career Bridge helps job seekers build successful careers and enables companies to hire the right talent faster and smarter.");
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [jobSearch, setJobSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // CMS States
  const [stats, setStats] = useState<any[]>([]);
  const [servicesIndiv, setServicesIndiv] = useState<any[]>([]);
  const [servicesComp, setServicesComp] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // Fetch jobs from Firestore
  useEffect(() => {
    async function fetchJobs() {
      try {
        const firestoreJobs = await getJobs();
        setJobs(firestoreJobs);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setJobsLoading(false);
      }
    }
    fetchJobs();

    // Subscribe to CMS collections
    const unsubs = [
      subscribeToCMS('stats', setStats),
      subscribeToCMS('services_individuals', setServicesIndiv),
      subscribeToCMS('services_companies', setServicesComp),
      subscribeToCMS('steps', setSteps),
      subscribeToCMS('testimonials', setTestimonials),
      subscribeToCMS('faqs', setFaqs),
    ];
    return () => unsubs.forEach(unsub => unsub());
  }, []);

  const renderIcon = (name: string, props: any) => {
    const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
    return <IconComponent {...props} />;
  };

  const categories = ["All", ...new Set(jobs.map(j => j.category).filter(Boolean))];
  const filteredJobs = jobs.filter(job => {
    const q = jobSearch.toLowerCase();
    return (
      (job.title?.toLowerCase().includes(q) || job.company?.toLowerCase().includes(q)) &&
      (activeCategory === "All" || job.category === activeCategory)
    );
  });

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-screen bg-gradient-to-br from-[#0F4C81] via-[#1565A8] to-[#0A3860] flex items-center overflow-hidden">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-[#F59E0B]/10 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 w-full grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Egypt's #1 HR & Recruitment Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Build Your Career<br />
              <span className="text-[#F59E0B]">with Confidence.</span>
            </h1>

            <p className="text-blue-100/90 text-lg leading-relaxed mb-10 max-w-lg">
              Career Bridge helps job seekers build successful careers and enables companies to hire the right talent faster and smarter.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/upload-cv")}
                className="flex items-center gap-2 bg-[#F59E0B] hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/upload-cv")}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-all"
              >
                <Upload className="w-4 h-4" /> Upload Your CV
              </button>
              <button
                onClick={() => navigate("/hire-talent")}
                className="flex items-center gap-2 border border-white/30 hover:border-white/60 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-xl transition-all"
              >
                Hire Talent
              </button>
            </div>

            <div className="flex items-center gap-8 mt-12 pt-10 border-t border-white/15">
              {[["500+", "Happy Clients"], ["1,000+", "CVs Reviewed"], ["98%", "Success Rate"]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{n}</div>
                  <div className="text-blue-300 text-xs mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              <div className="w-[360px] h-[360px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-blue-900/50 bg-blue-900">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=720&h=720&fit=crop&auto=format"
                  alt="Professional team collaborating"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C81]/50 to-transparent" />
              </div>

              <div className="absolute -top-5 -left-12 bg-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">New Offer!</div>
                  <div className="text-sm font-bold text-gray-900">Software Engineer</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-10 bg-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">This Month</div>
                  <div className="text-sm font-bold text-gray-900">+42 Placements</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 20C480 40 240 5 0 30Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#F8FAFC] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map(({ value, suffix, label, iconName }) => (
              <div key={label} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#EBF4FF] flex items-center justify-center mx-auto mb-4">
                  {renderIcon(iconName, { className: "w-6 h-6 text-[#0F4C81]" })}
                </div>
                <div className="text-3xl font-extrabold text-[#0F4C81] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <StatCounter target={value || 0} suffix={suffix || ""} />
                </div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Preview ── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-[#F59E0B] font-semibold text-xs uppercase tracking-widest mb-3">What We Offer</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Services Tailored for You</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Whether you're launching your career or building your team, we have the right solution.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#EBF4FF] to-[#DBEAFE] rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#0F4C81] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>For Individuals</h3>
              </div>
              <div className="space-y-2.5">
                {servicesIndiv.slice(0, 4).map(({ iconName, title }) => (
                  <div key={title} className="flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    {renderIcon(iconName, { className: "w-5 h-5 text-[#0F4C81] flex-shrink-0" })}
                    <span className="text-sm font-medium text-gray-700 flex-1">{title}</span>
                    <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/services')}
                className="mt-6 w-full bg-[#0F4C81] text-white font-semibold py-3 rounded-xl hover:bg-[#0A3860] transition-colors flex items-center justify-center gap-2"
              >
                Explore All Services <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#FFF8E8] to-[#FEF3C7] rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>For Companies</h3>
              </div>
              <div className="space-y-2.5">
                {servicesComp.slice(0, 4).map(({ iconName, title }) => (
                  <div key={title} className="flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    {renderIcon(iconName, { className: "w-5 h-5 text-[#F59E0B] flex-shrink-0" })}
                    <span className="text-sm font-medium text-gray-700 flex-1">{title}</span>
                    <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/hire-talent')}
                className="mt-6 w-full bg-[#F59E0B] text-white font-semibold py-3 rounded-xl hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
              >
                Start Hiring <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-[#F59E0B] font-semibold text-xs uppercase tracking-widest mb-3">Process</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Six simple steps to your next great opportunity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <div
                key={step.id || i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F4C81] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 group-hover:bg-[#F59E0B] transition-colors shadow-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-block text-[#F59E0B] font-semibold text-xs uppercase tracking-widest mb-3">Opportunities</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Featured Jobs</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Discover top opportunities across Egypt and the Middle East.</p>
          </div>

          {jobsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-5 animate-pulse">
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs available yet</h3>
              <p className="text-gray-500 mb-6">New job openings will be posted here soon. Upload your CV to get matched when they're available.</p>
              <button onClick={() => navigate("/upload-cv")} className="bg-[#0F4C81] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A3860] transition-colors">
                Upload Your CV
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs or companies..."
                    value={jobSearch}
                    onChange={e => setJobSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10 text-sm"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        activeCategory === cat ? "bg-[#0F4C81] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredJobs.slice(0, 6).map(job => (
                  <div
                    key={job.id}
                    className="border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-blue-100 transition-all bg-white group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#EBF4FF] flex items-center justify-center font-bold text-[#0F4C81] text-sm flex-shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {job.logo || job.company?.split(" ")[0]?.slice(0, 2)?.toUpperCase() || "??"}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm leading-tight">{job.title}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">{job.company}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium flex-shrink-0">{job.type || "Full-time"}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {job.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-[#0F4C81]" /> {job.location}
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <DollarSign className="w-3.5 h-3.5 text-[#F59E0B]" /> {job.salary}
                        </div>
                      )}
                      {job.experience && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-gray-400" /> {job.experience}
                        </div>
                      )}
                      {job.category && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {job.category}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="flex-1 bg-white border border-[#0F4C81]/20 text-[#0F4C81] text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-50 transition-all"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/upload-cv?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title || '')}`)}
                        className="flex-1 bg-[#EBF4FF] group-hover:bg-[#0F4C81] text-[#0F4C81] group-hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No jobs found matching your search.</p>
                </div>
              )}

              {jobs.length > 6 && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => navigate('/jobs')}
                    className="inline-flex items-center gap-2 text-[#0F4C81] font-semibold hover:text-[#F59E0B] transition-colors"
                  >
                    View All Jobs <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-gradient-to-br from-[#0F4C81] to-[#0A2040] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-[#F59E0B] font-semibold text-xs uppercase tracking-widest mb-3">Testimonials</span>
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>What Our Clients Say</h2>
            <p className="text-blue-200 max-w-xl mx-auto">Real stories from real people whose careers and companies we've transformed.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={t.id || i}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F59E0B] flex items-center justify-center font-bold text-white text-xs flex-shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {t.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-blue-300 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-[#F59E0B] font-semibold text-xs uppercase tracking-widest mb-3">FAQ</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.id || i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-5 h-5 text-[#0F4C81] flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#0F4C81] to-[#1565A8] rounded-3xl p-12 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-1/3 translate-y-1/3 pointer-events-none" />
            <h2 className="text-3xl font-bold mb-4 relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to Take the Next Step?</h2>
            <p className="text-blue-100 mb-8 relative max-w-lg mx-auto">
              Join thousands of professionals who have accelerated their careers with Career Bridge.
            </p>
            <div className="flex flex-wrap gap-4 justify-center relative">
              <button
                onClick={() => navigate('/upload-cv')}
                className="bg-[#F59E0B] hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/30"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/consultation')}
                className="bg-white/10 border border-white/30 hover:bg-white/20 text-white font-medium px-8 py-3 rounded-xl transition-all"
              >
                Book Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
