import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HomePage from '../pages/HomePage';
import ServicesPage from '../pages/ServicesPage';
import JobsPage from '../pages/JobsPage';
import AboutPage from '../pages/AboutPage';
import UploadCVPage from '../pages/UploadCVPage';
import HireTalentPage from '../pages/HireTalentPage';
import ConsultationPage from '../pages/ConsultationPage';
import ContactPage from '../pages/ContactPage';
import AdminDashboard from '../pages/AdminDashboard';
import DashboardPage from '../pages/DashboardPage';
import { useAuth } from '../contexts/AuthContext';

function AppContent() {
  const { userRole, loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (loading) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isAdminRoute ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/upload-cv" element={<UploadCVPage />} />
            <Route path="/hire-talent" element={<HireTalentPage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={userRole ? <DashboardPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/admin" 
              element={<AdminDashboard />} 
            />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
