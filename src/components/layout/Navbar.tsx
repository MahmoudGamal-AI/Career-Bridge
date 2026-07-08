import { useState, useEffect } from "react";
import {
  Briefcase, Menu, X, Upload, UserPlus, LogIn
} from "lucide-react";

import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../../lib/constants';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, userRole, loginWithGoogle, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/98 backdrop-blur-md shadow-md shadow-blue-900/5" : "bg-white/90 backdrop-blur-sm"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C81] flex items-center justify-center shadow-sm group-hover:bg-[#F59E0B] transition-colors">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-[#0F4C81] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Career<span className="text-[#F59E0B]">Bridge</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, page }) => {
            const path = page === 'home' ? '/' : `/${page}`;
            return (
              <NavLink
                key={page}
                to={path}
                className={({ isActive }) => `text-sm font-medium transition-colors relative after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:bg-[#0F4C81] after:transition-all ${
                  isActive
                    ? "text-[#0F4C81] after:w-full"
                    : "text-gray-600 hover:text-[#0F4C81] after:w-0 hover:after:w-full"
                }`}
              >
                {label}
              </NavLink>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/upload-cv"
            className="text-sm font-semibold text-[#0F4C81] border border-[#0F4C81]/30 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Upload CV
          </Link>
          <Link
            to="/hire-talent"
            className="text-sm font-semibold bg-[#0F4C81] text-white px-4 py-2 rounded-xl hover:bg-[#0A3860] transition-colors shadow-sm shadow-blue-900/20"
          >
            Hire Talent
          </Link>
          {currentUser ? (
            <div className="flex items-center gap-2 ml-4 border-l border-slate-200 pl-4">
              <Link to="/dashboard" className="text-sm font-semibold text-gray-700 hover:text-[#0F4C81] px-4 py-2 transition-colors">
                Track Applications
              </Link>
              <button onClick={logout} className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center ml-4 border-l border-slate-200 pl-4">
              <button onClick={() => loginWithGoogle('candidate')} className="group flex items-center gap-2 text-sm font-semibold bg-[#F8FAFC] text-[#0F4C81] border-2 border-[#0F4C81]/10 px-5 py-2.5 rounded-xl hover:bg-[#0F4C81] hover:border-[#0F4C81] hover:text-white transition-all shadow-sm">
                <LogIn className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                Sign In
              </button>
            </div>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3 shadow-lg">
          {NAV_LINKS.map(({ label, page }) => {
            const path = page === 'home' ? '/' : `/${page}`;
            return (
              <Link
                key={page}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`text-left text-sm font-medium py-1.5 ${location.pathname === path ? "text-[#0F4C81]" : "text-gray-600"}`}
              >
                {label}
              </Link>
            );
          })}
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
            <div className="flex gap-3">
              <Link to="/upload-cv" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm font-semibold text-[#0F4C81] border border-[#0F4C81]/30 py-2.5 rounded-xl">Upload CV</Link>
              <Link to="/hire-talent" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm font-semibold bg-[#0F4C81] text-white py-2.5 rounded-xl">Hire Talent</Link>
            </div>
            {currentUser ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="w-full text-center text-sm font-semibold text-gray-700 border border-gray-200 py-2.5 rounded-xl">Track Applications</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-sm font-semibold text-red-600 bg-red-50 py-2.5 rounded-xl">Log out</button>
              </>
            ) : (
              <button onClick={() => { loginWithGoogle('candidate'); setMobileOpen(false); }} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#0F4C81] bg-blue-50 border border-blue-100 py-2.5 rounded-xl">
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

