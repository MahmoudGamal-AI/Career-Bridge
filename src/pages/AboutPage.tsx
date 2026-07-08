import {
  Target, Award, Users, Globe, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import taherImg from "../images/Taher Abdelhady.png";
import hassanImg from "../images/Hassan Gamil.png";
import mahmoudImg from "../images/mahmoud.png";

export default function AboutPage() {
  const navigate = useNavigate();
  const team = [
    { name: "Taher Abdelhady", role: "CEO & Founder", img: taherImg },
    { name: "Hassan Gamil", role: "Managing Director (MD)", img: hassanImg },
    { name: "Mahmoud Gamal", role: "AI Engineer", img: mahmoudImg },
  ];

  const values = [
    { icon: Target, title: "Purpose-Driven", desc: "Every service we offer is designed with one goal: to create real, lasting impact in people's careers." },
    { icon: Shield, title: "Trust & Integrity", desc: "We operate with full transparency and honesty, building long-term relationships with all our clients." },
    { icon: Award, title: "Excellence", desc: "We hold ourselves to the highest standards in everything we deliver — no exceptions." },
    { icon: Users, title: "People First", desc: "We believe that behind every CV is a human story, and we treat each one with the care it deserves." },
  ];

  return (
    <div className="pt-16">
      <style>{`
        .team-card-hover {
          perspective: 1200px;
        }
        .team-card-hover .team-image-container {
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-style: preserve-3d;
        }
        .team-card-hover:hover .team-image-container {
          transform: rotateY(8deg) rotateX(4deg) scale(1.02);
        }
        .team-card-hover:hover .team-image {
          transform: scale(1.1) translateZ(10px);
        }
        .shine-layer {
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg);
        }
        .team-card-hover:hover .shine-layer {
          animation: shine 0.8s ease-in-out forwards;
        }
        @keyframes shine {
          100% { left: 200%; }
        }
      `}</style>
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#0A2040] py-24 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-[#F59E0B]/10 blur-3xl" />
        </div>
        <span className="inline-block text-[#F59E0B] font-semibold text-xs uppercase tracking-widest mb-3 relative">Our Story</span>
        <h1 className="text-5xl font-bold mb-6 relative" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>About Career Bridge</h1>
        <p className="text-blue-200 max-w-2xl mx-auto text-lg leading-relaxed relative">
          Founded with a mission to bridge the gap between exceptional talent and outstanding opportunities across Egypt and the Middle East.
        </p>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-[#EBF4FF] to-[#DBEAFE] rounded-3xl p-10">
            <div className="w-14 h-14 rounded-2xl bg-[#0F4C81] flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Helping job seekers achieve their career goals while providing companies with fast, reliable, and efficient recruitment solutions. We exist to make every career transition smoother, every hire better, and every professional journey more fulfilling.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#FFF8E8] to-[#FEF3C7] rounded-3xl p-10">
            <div className="w-14 h-14 rounded-2xl bg-[#F59E0B] flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become one of the leading HR & Recruitment companies in Egypt and the Middle East — a trusted partner that organizations and individuals alike rely on to navigate every challenge in talent and career development.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#EBF4FF] flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-[#0F4C81]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Meet the Team</h2>
          <p className="text-gray-500 max-w-lg mx-auto">The experts behind Career Bridge — passionate, experienced, and dedicated to your success.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-5xl mx-auto">
          {team.map(({ name, role, img }) => (
            <div key={name} className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(15,76,129,0.3)] transition-all duration-500 team-card-hover cursor-pointer group">
              <div className="h-80 overflow-hidden bg-gray-100 relative team-image-container">
                <img src={img} alt={name} className="w-full h-full object-cover object-top team-image transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C81]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="shine-layer" />
              </div>
              <div className="p-6 relative bg-white transform transition-all duration-500 group-hover:-translate-y-3 group-hover:rounded-t-3xl">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0F4C81] transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{name}</h3>
                <p className="text-sm font-bold text-[#F59E0B] mt-1 uppercase tracking-wider">{role}</p>
                <div className="w-8 h-1 bg-[#F59E0B] mt-4 rounded-full opacity-0 group-hover:opacity-100 group-hover:w-16 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to Work With Us?</h2>
          <p className="text-gray-500 mb-8">Whether you're a job seeker or a company, we're here to help you succeed.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate("/upload-cv")} className="bg-[#0F4C81] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#0A3860] transition-colors shadow-sm">Upload Your CV</button>
            <button onClick={() => navigate("/contact")} className="bg-white border border-gray-200 text-gray-700 font-medium px-8 py-3 rounded-xl hover:border-[#0F4C81] hover:text-[#0F4C81] transition-colors">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  );
}
