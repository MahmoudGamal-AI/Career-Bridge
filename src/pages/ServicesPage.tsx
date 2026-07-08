import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { User, Building2, ArrowRight, Loader2 } from "lucide-react";

import { subscribeToCMS } from '../lib/db';

export default function ServicesPage() {
  const navigate = useNavigate();
  const [servicesIndiv, setServicesIndiv] = useState<any[]>([]);
  const [servicesComp, setServicesComp] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 2) setLoading(false);
    };

    const unsubs = [
      subscribeToCMS('services_individuals', (data) => {
        setServicesIndiv(data);
        checkLoaded();
      }),
      subscribeToCMS('services_companies', (data) => {
        setServicesComp(data);
        checkLoaded();
      }),
    ];

    // Fallback if collections are empty (onSnapshot might only fire once quickly or take time)
    const timeout = setTimeout(() => setLoading(false), 2000);

    return () => {
      unsubs.forEach(unsub => unsub());
      clearTimeout(timeout);
    };
  }, []);

  const renderIcon = (name: string, props: any) => {
    const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
    return <IconComponent {...props} />;
  };

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#0A2040] py-24 text-center text-white">
        <span className="inline-block text-[#F59E0B] font-semibold text-xs uppercase tracking-widest mb-3">Our Expertise</span>
        <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Our Services</h1>
        <p className="text-blue-200 max-w-xl mx-auto text-lg">Comprehensive solutions for individuals and companies at every stage of the career journey.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#0F4C81]" />
            <p>Loading services...</p>
          </div>
        ) : (
          <>
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-[#0F4C81] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>For Individuals</h2>
                  <p className="text-gray-500 text-sm">Accelerate your career growth with expert guidance</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesIndiv.map(({ iconName, title, desc, id }) => (
                  <div key={id || title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-blue-100 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[#EBF4FF] group-hover:bg-[#0F4C81] flex items-center justify-center mb-5 transition-colors">
                      {renderIcon(iconName, { className: "w-6 h-6 text-[#0F4C81] group-hover:text-white transition-colors" })}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{desc}</p>
                    <button
                      onClick={() => navigate('/consultation')}
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#0F4C81] hover:text-[#F59E0B] transition-colors"
                    >
                      Book a Session <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>For Companies</h2>
                  <p className="text-gray-500 text-sm">End-to-end hiring and HR solutions for modern teams</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesComp.map(({ iconName, title, desc, id }) => (
                  <div key={id || title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-amber-100 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8E8] group-hover:bg-[#F59E0B] flex items-center justify-center mb-5 transition-colors">
                      {renderIcon(iconName, { className: "w-6 h-6 text-[#F59E0B] group-hover:text-white transition-colors" })}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{desc}</p>
                    <button
                      onClick={() => navigate('/hire-talent')}
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#F59E0B] hover:text-[#0F4C81] transition-colors"
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
