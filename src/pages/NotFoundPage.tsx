import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFoundPage() {
  usePageMeta('Page Not Found | Career Bridge');

  return (
    <div className="pt-16 min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6 py-20">
        <p className="text-7xl font-extrabold text-[#0F4C81] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-[#0F4C81] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0A3860] transition-colors">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link to="/jobs" className="inline-flex items-center justify-center gap-2 bg-white text-[#0F4C81] border border-[#0F4C81]/30 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            <Search className="w-4 h-4" /> Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
