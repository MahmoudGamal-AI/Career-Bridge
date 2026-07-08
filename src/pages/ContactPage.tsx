import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone, Mail, MapPin, CheckCircle, Send,
  Linkedin, Facebook, Instagram, Music2,
} from "lucide-react";
import { toast } from "sonner";
import { addMessage } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

const CONTACT_SOCIAL = [
  { Icon: Linkedin, name: "LinkedIn" },
  { Icon: Facebook, name: "Facebook" },
  { Icon: Instagram, name: "Instagram" },
  { Icon: Music2, name: "TikTok" },
];

export default function ContactPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email address";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("يجب تسجيل الدخول لتتمكن من إرسال رسالة", { position: "top-center" });
      return;
    }
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await addMessage({
        ...form,
        userId: currentUser?.uid
      });
      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error submitting message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#0A2040] py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Get in Touch</h1>
        <p className="text-blue-200 max-w-lg mx-auto text-lg">We'd love to hear from you. Our team typically responds within 2 hours.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="space-y-5">
            {[
              { icon: Phone, label: "Phone", val: "+20 11 47081146", sub: "Sun–Thu, 9AM–6PM" },
              { icon: Mail, label: "Email", val: "careerbridge2001@gmail.com", sub: "We reply within 2 hours" },
              { icon: MapPin, label: "Office", val: "Maadi, Cairo, Egypt", sub: "Open to walk-ins by appointment" },
            ].map(({ icon: Icon, label, val, sub }) => (
              <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[#EBF4FF] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#0F4C81]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wider">{label}</p>
                  <p className="font-semibold text-gray-900 text-sm">{val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-4">Follow Us</p>
              <div className="flex gap-2.5">
                {CONTACT_SOCIAL.map(({ Icon, name }) => (
                  <a
                    key={name}
                    href="#"
                    aria-label={name}
                    className="w-10 h-10 rounded-xl bg-[#EBF4FF] flex items-center justify-center hover:bg-[#0F4C81] text-[#0F4C81] hover:text-white transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden h-44 relative bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop&auto=format"
                alt="Cairo, Egypt"
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-xl px-4 py-2 shadow-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold text-gray-900">Maadi, Cairo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Message Sent!</h3>
                <p className="text-gray-500 mb-6 max-w-sm">We've received your message and will get back to you within 2 hours during business hours.</p>
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
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); setErrors({}); }} 
                    className={`${currentUser ? "bg-white text-[#0F4C81] border border-[#0F4C81]" : "bg-[#0F4C81] text-white hover:bg-[#0A3860]"} font-semibold px-6 py-3 rounded-xl transition-colors`}
                  >
                    Send Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Send Us a Message</h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        placeholder="Ahmed Hassan"
                        value={form.name}
                        onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if (errors.name) setErrors(e2 => ({ ...e2, name: "" })); }}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${errors.name ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-[#0F4C81] focus:ring-[#0F4C81]/10"}`}
                      />
                      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        placeholder="ahmed@email.com"
                        value={form.email}
                        onChange={e => { setForm(f => ({ ...f, email: e.target.value })); if (errors.email) setErrors(e2 => ({ ...e2, email: "" })); }}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${errors.email ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-[#0F4C81] focus:ring-[#0F4C81]/10"}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Subject *</label>
                    <input
                      type="text"
                      placeholder="How can we help you?"
                      value={form.subject}
                      onChange={e => { setForm(f => ({ ...f, subject: e.target.value })); if (errors.subject) setErrors(e2 => ({ ...e2, subject: "" })); }}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 ${errors.subject ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-[#0F4C81] focus:ring-[#0F4C81]/10"}`}
                    />
                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Message *</label>
                    <textarea
                      rows={7}
                      placeholder="Write your message here..."
                      value={form.message}
                      onChange={e => { setForm(f => ({ ...f, message: e.target.value })); if (errors.message) setErrors(e2 => ({ ...e2, message: "" })); }}
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 resize-none ${errors.message ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-[#0F4C81] focus:ring-[#0F4C81]/10"}`}
                    />
                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#0F4C81] text-white font-semibold py-3.5 rounded-xl hover:bg-[#0A3860] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
