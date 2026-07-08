import {
  Briefcase, Phone, Mail, MapPin, Upload,
  Linkedin, Facebook, Instagram, Music2,
} from "lucide-react";
import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  { Icon: Linkedin, name: "LinkedIn" },
  { Icon: Facebook, name: "Facebook" },
  { Icon: Instagram, name: "Instagram" },
  { Icon: Music2, name: "TikTok" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0A2040] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Career<span className="text-[#F59E0B]">Bridge</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Connecting exceptional talent with outstanding companies across Egypt and the Middle East.
            </p>
            <div className="flex gap-2.5">
              {SOCIAL_LINKS.map(({ Icon, name }) => (
                <a
                  key={name}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-[#F59E0B] transition-colors"
                  aria-label={name}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {(["home", "services", "jobs", "about", "contact"]).map(p => (
                <li key={p}>
                  <Link to={p === "home" ? "/" : `/${p}`} className="text-gray-400 hover:text-[#F59E0B] text-sm capitalize transition-colors">
                    {p}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/admin" className="text-gray-500 hover:text-gray-300 text-xs transition-colors mt-2 block">
                  Admin Dashboard ↗
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5">
              {["CV Writing", "LinkedIn Optimization", "Career Coaching", "Mock Interview", "Recruitment", "HR Consultation"].map(s => (
                <li key={s}>
                  <Link to="/services" className="text-gray-400 hover:text-[#F59E0B] text-sm transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                +20 11 47081146
              </li>
              <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                careerbridge2001@gmail.com
              </li>
              <li className="flex items-center gap-2.5 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                Maadi, Cairo, Egypt
              </li>
            </ul>
            <div className="flex gap-2">
              <Link to="/upload-cv" className="text-xs font-semibold text-white border border-white/20 px-3 py-2 rounded-lg hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors">
                Upload CV
              </Link>
              <Link to="/hire-talent" className="text-xs font-semibold bg-[#F59E0B] text-white px-3 py-2 rounded-lg hover:bg-amber-500 transition-colors">
                Hire Talent
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Career Bridge. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

