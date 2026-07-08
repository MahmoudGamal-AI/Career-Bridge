import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Upload, CheckCircle, Send,
} from "lucide-react";
import { toast } from "sonner";
import { addCandidate, uploadCV } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

export default function UploadCVPage() {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJobId = searchParams.get('jobId') || "";
  const initialJobTitle = searchParams.get('jobTitle') || "";

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: "", email: "", phone: "", position: "", years: "", linkedin: "", cover: "",
    jobId: initialJobId,
    jobTitle: initialJobTitle
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!file) errs.file = "Please upload your CV";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === "application/pdf" || f.name.endsWith(".docx"))) {
      setFile(f);
      if (errors.file) setErrors(e2 => ({ ...e2, file: "" }));
    } else {
      toast.error("Please upload a PDF or DOCX file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("يجب تسجيل الدخول لتتمكن من التقديم على الوظيفة", { position: "top-center" });
      return;
    }
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      let cvUrl = "";
      try {
        cvUrl = await uploadCV(file!);
      } catch (uploadError) {
        console.warn("Storage upload failed, saving without file.", uploadError);
        toast.warning("CV file couldn't be uploaded, but your application was saved.");
      }
      await addCandidate({
        ...form,
        userId: currentUser?.uid,
        cvUrl,
        fileName: file!.name
      });
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-16 min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Application Submitted!</h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Thank you{form.name ? `, ${form.name}` : ""}! We've received your CV and will review your profile within 2 business days. We'll reach out when matching opportunities arise.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {currentUser && (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#0F4C81] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A3860] transition-colors"
              >
                Track Applications
              </button>
            )}
            <button
              onClick={() => { setSubmitted(false); setFile(null); setForm({ name: "", email: "", phone: "", position: "", years: "", linkedin: "", cover: "", jobId: initialJobId, jobTitle: initialJobTitle }); setErrors({}); }}
              className={`${currentUser ? "bg-white text-[#0F4C81] border border-[#0F4C81]" : "bg-[#0F4C81] text-white hover:bg-[#0A3860]"} font-semibold px-6 py-3 rounded-xl transition-colors`}
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
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#0A2040] py-16 text-center text-white mb-10">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {form.jobTitle ? `Apply for ${form.jobTitle}` : "Upload Your CV"}
        </h1>
        <p className="text-blue-200">
          {form.jobTitle ? "Submit your details below to apply for this position." : "Let our experts review your profile and connect you with the right opportunities."}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center mb-8 transition-all cursor-pointer ${
              dragging ? "border-[#0F4C81] bg-blue-50 scale-[1.01]" :
              file ? "border-green-400 bg-green-50" :
              errors.file ? "border-red-300 bg-red-50/50" :
              "border-gray-200 hover:border-[#0F4C81] hover:bg-blue-50/50"
            }`}
          >
            {file ? (
              <div>
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="font-bold text-gray-900 mb-0.5">{file.name}</p>
                <p className="text-sm text-gray-400 mb-3">{(file.size / 1024).toFixed(0)} KB</p>
                <button type="button" onClick={() => setFile(null)} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">Remove file</button>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-[#0F4C81] mx-auto mb-3" />
                <p className="font-bold text-gray-900 mb-1">Drag & drop your CV here</p>
                <p className="text-sm text-gray-400 mb-4">Supports PDF and DOCX, max 10MB</p>
                <label className="inline-block bg-[#0F4C81] text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer hover:bg-[#0A3860] transition-colors">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={e => { 
                      const f = e.target.files?.[0];
                      if (f) {
                        if (f.type === "application/pdf" || f.name.endsWith(".docx")) {
                          setFile(f);
                          if (errors.file) setErrors(e2 => ({ ...e2, file: "" }));
                        } else {
                          toast.error("Please upload a PDF or DOCX file");
                          e.target.value = "";
                        }
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
          {errors.file && <p className="text-xs text-red-500 -mt-6 mb-6">{errors.file}</p>}

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "name", label: "Full Name *", placeholder: "Ahmed Hassan", type: "text" },
              { key: "email", label: "Email Address *", placeholder: "ahmed@email.com", type: "email" },
              { key: "phone", label: "Phone Number *", placeholder: "+20 100 000 0000", type: "tel" },
              { key: "position", label: "Current Position", placeholder: "Software Engineer", type: "text" },
              { key: "years", label: "Years of Experience", placeholder: "5", type: "number" },
              { key: "linkedin", label: "LinkedIn Profile", placeholder: "linkedin.com/in/ahmed", type: "url" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); if (errors[key]) setErrors(e2 => ({ ...e2, [key]: "" })); }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${errors[key] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[#0F4C81] focus:ring-[#0F4C81]/10"}`}
                />
                {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Cover Letter <span className="font-normal text-gray-400">(Optional)</span></label>
            <textarea
              rows={4}
              placeholder="Tell us about yourself, your goals, and the type of role you're looking for..."
              value={form.cover}
              onChange={e => setForm(f => ({ ...f, cover: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10 resize-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-[#0F4C81] hover:bg-[#0A3860] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-900/15 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : <><Send className="w-5 h-5" /> Submit Application</>}
          </button>
        </form>
      </div>
    </div>
  );
}
