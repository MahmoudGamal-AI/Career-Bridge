import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, CheckCircle, Send,
} from "lucide-react";
import { toast } from "sonner";
import { addCompanyRequest, uploadCV } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

export default function HireTalentPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ company: "", manager: "", email: "", phone: "", jobTitle: "", headcount: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.company.trim()) errs.company = "Company name is required";
    if (!form.manager.trim()) errs.manager = "Manager name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.jobTitle.trim()) errs.jobTitle = "Job title is required";
    if (!form.description.trim()) errs.description = "Job description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("يجب تسجيل الدخول لتتمكن من إرسال طلب توظيف", { position: "top-center" });
      return;
    }
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      let jdUrl = "";
      if (file) {
        try {
          jdUrl = await uploadCV(file);
        } catch (error) {
          console.warn("Skipping file upload due to config issue", error);
        }
      }
      await addCompanyRequest({
        ...form,
        userId: currentUser?.uid,
        jdUrl,
        fileName: file?.name || ""
      });
      setSubmitted(true);
      toast.success("Hiring request submitted successfully!");
    } catch (error) {
      console.error("Error submitting company request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-16 min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Request Received!</h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Thank you{form.company ? `, ${form.company}` : ""}! Our recruitment team will contact you within 24 hours to discuss your hiring needs in detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {currentUser && (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#F59E0B] text-white font-semibold px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors"
              >
                Track Applications
              </button>
            )}
            <button
              onClick={() => { setSubmitted(false); setForm({ company: "", manager: "", email: "", phone: "", jobTitle: "", headcount: "", description: "" }); setFile(null); }}
              className={`${currentUser ? "bg-white text-[#F59E0B] border border-[#F59E0B]" : "bg-[#F59E0B] text-white hover:bg-amber-600"} font-semibold px-6 py-3 rounded-xl transition-colors`}
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-[#F8FAFC] min-h-screen">
      <div className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] py-16 text-center text-white mb-10">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Hire the Right Talent</h1>
        <p className="text-amber-100">Submit your hiring request and our team will find the perfect candidates for you.</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Hiring Request Form</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "company", label: "Company Name *", placeholder: "TechCorp Egypt" },
              { key: "manager", label: "HR Manager Name *", placeholder: "Sara Ali" },
              { key: "email", label: "Email Address *", placeholder: "hr@techcorp.eg" },
              { key: "phone", label: "Phone Number *", placeholder: "+20 100 000 0000" },
              { key: "jobTitle", label: "Job Title *", placeholder: "Senior Software Engineer" },
              { key: "headcount", label: "Number of Positions", placeholder: "3" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); if (errors[key]) setErrors(e2 => ({ ...e2, [key]: "" })); }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${errors[key] ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-[#F59E0B] focus:ring-[#F59E0B]/15"}`}
                />
                {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Job Description *</label>
            <textarea
              rows={4}
              placeholder="Describe the role, responsibilities, required skills, and company culture..."
              value={form.description}
              onChange={e => { setForm(f => ({ ...f, description: e.target.value })); if (errors.description) setErrors(e2 => ({ ...e2, description: "" })); }}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none transition-colors ${errors.description ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-[#F59E0B] focus:ring-[#F59E0B]/15"}`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Upload Job Description <span className="font-normal text-gray-400">(Optional)</span></label>
            <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${file ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-[#F59E0B] hover:bg-amber-50/50"}`}>
              <Upload className={`w-5 h-5 flex-shrink-0 ${file ? "text-green-500" : "text-gray-400"}`} />
              <span className={`text-sm ${file ? "text-gray-900 font-medium" : "text-gray-500"}`}>{file ? file.name : "Upload PDF or DOCX"}</span>
              <input type="file" className="hidden" accept=".pdf,.docx" onChange={e => { 
                const f = e.target.files?.[0];
                if (f) {
                  if (f.type === "application/pdf" || f.name.endsWith(".docx")) {
                    setFile(f);
                  } else {
                    toast.error("Please upload a PDF or DOCX file");
                    e.target.value = "";
                  }
                }
              }} />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-[#F59E0B] hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : <><Send className="w-5 h-5" /> Submit Hiring Request</>}
          </button>
        </form>
      </div>
    </div>
  );
}
