import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Video, MapPin } from "lucide-react";
import { toast } from "sonner";
import { addConsultation } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

export default function ConsultationPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "Career Coaching", date: "", time: "", meeting: "online" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const services = ["Career Coaching", "CV Review", "Mock Interview", "LinkedIn Optimization", "Interview Preparation"];
  const times = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.date) errs.date = "Please select a date";
    if (!form.time) errs.time = "Please select a time slot";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("يجب تسجيل الدخول لتتمكن من حجز استشارة", { position: "top-center" });
      return;
    }
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await addConsultation({
        ...form,
        userId: currentUser?.uid
      });
      setSubmitted(true);
      toast.success("Consultation booked successfully!");
    } catch (error) {
      console.error("Error booking consultation:", error);
      toast.error("Failed to book consultation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-16 min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-[#0F4C81]" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Consultation Booked!</h2>
          <p className="text-gray-500 mb-2">Your <strong className="text-gray-900">{form.service}</strong> session is confirmed.</p>
          {form.date && <p className="text-gray-500 mb-8">{form.date} at {form.time} — {form.meeting === "online" ? "Online via Zoom" : "In-person at our Cairo office"}.</p>}
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
              onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", service: "Career Coaching", date: "", time: "", meeting: "online" }); }} 
              className={`${currentUser ? "bg-white text-[#0F4C81] border border-[#0F4C81]" : "bg-[#0F4C81] text-white hover:bg-[#0A3860]"} font-semibold px-6 py-3 rounded-xl transition-colors`}
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-[#F8FAFC] min-h-screen">
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#0A2040] py-16 text-center text-white mb-10">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Book a Consultation</h1>
        <p className="text-blue-200">Schedule a session with one of our expert career advisors.</p>
      </div>

      <div className="max-w-xl mx-auto px-6 pb-20">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name *</label>
              <input
                type="text"
                placeholder="Ahmed Hassan"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(e2 => ({ ...e2, name: "" })); }}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${errors.name ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[#0F4C81] focus:ring-[#0F4C81]/10"}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email *</label>
                <input
                  type="email"
                  placeholder="ahmed@email.com"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(e2 => ({ ...e2, email: "" })); }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[#0F4C81] focus:ring-[#0F4C81]/10"}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone *</label>
                <input
                  type="tel"
                  placeholder="+20 100 000 0000"
                  value={form.phone}
                  onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); if (errors.phone) setErrors(e2 => ({ ...e2, phone: "" })); }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${errors.phone ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[#0F4C81] focus:ring-[#0F4C81]/10"}`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Service *</label>
              <select
                value={form.service}
                onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] bg-white"
              >
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Preferred Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => { setForm(f => ({ ...f, date: e.target.value })); if (errors.date) setErrors(e2 => ({ ...e2, date: "" })); }}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none bg-white transition-colors ${errors.date ? "border-red-300" : "border-gray-200 focus:border-[#0F4C81]"}`}
                />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Preferred Time *</label>
                <select
                  value={form.time}
                  onChange={e => { setForm(f => ({ ...f, time: e.target.value })); if (errors.time) setErrors(e2 => ({ ...e2, time: "" })); }}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none bg-white transition-colors ${errors.time ? "border-red-300" : "border-gray-200 focus:border-[#0F4C81]"}`}
                >
                  <option value="">Select time slot</option>
                  {times.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-3">Meeting Type</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${form.meeting === "online" ? "border-[#0F4C81] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="meeting" value="online" checked={form.meeting === "online"} onChange={() => setForm(f => ({ ...f, meeting: "online" }))} className="hidden" />
                  <Video className={`w-5 h-5 flex-shrink-0 ${form.meeting === "online" ? "text-[#0F4C81]" : "text-gray-400"}`} />
                  <span className={`text-sm font-medium ${form.meeting === "online" ? "text-[#0F4C81]" : "text-gray-600"}`}>Online (Zoom)</span>
                </label>
                <label className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${form.meeting === "offline" ? "border-[#0F4C81] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="meeting" value="offline" checked={form.meeting === "offline"} onChange={() => setForm(f => ({ ...f, meeting: "offline" }))} className="hidden" />
                  <MapPin className={`w-5 h-5 flex-shrink-0 ${form.meeting === "offline" ? "text-[#0F4C81]" : "text-gray-400"}`} />
                  <span className={`text-sm font-medium ${form.meeting === "offline" ? "text-[#0F4C81]" : "text-gray-600"}`}>In-Person, Cairo</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-[#0F4C81] hover:bg-[#0A3860] text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/15 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Booking..." : <><Calendar className="w-5 h-5" /> Book My Consultation</>}
          </button>
        </form>
      </div>
    </div>
  );
}
