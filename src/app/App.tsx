import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/common/ScrollToTop';
import ProtectedRoute from '../components/common/ProtectedRoute';
import HomePage from '../pages/HomePage';
import ServicesPage from '../pages/ServicesPage';
import JobsPage from '../pages/JobsPage';
import JobDetailsPage from '../pages/JobDetailsPage';
import AboutPage from '../pages/AboutPage';
import UploadCVPage from '../pages/UploadCVPage';
import HireTalentPage from '../pages/HireTalentPage';
import ConsultationPage from '../pages/ConsultationPage';
import ContactPage from '../pages/ContactPage';
import AdminDashboard from '../pages/AdminDashboard';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import { useAuth } from '../contexts/AuthContext';

function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0F4C81]/20 border-t-[#0F4C81] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isAdminRoute ? 'bg-slate-950' : 'bg-[#F8FAFC]'}`}>
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/upload-cv" element={<UploadCVPage />} />
            <Route path="/hire-talent" element={<HireTalentPage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
            />

            {/* /admin renders its own dedicated login screen for non-admins,
                so it intentionally stays outside ProtectedRoute. */}
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            {/* Catch-all: proper 404 page instead of a silent redirect */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
