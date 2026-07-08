import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Save, Shield } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePageMeta } from '../hooks/usePageMeta';

export default function ProfilePage() {
  usePageMeta('My Profile | Career Bridge', 'Manage your Career Bridge profile information.');
  const { currentUser, userRole } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', photoURL: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    getDoc(doc(db, 'users', currentUser.uid))
      .then((snap) => {
        const data = snap.data() || {};
        setForm({
          name: (data.name as string) || currentUser.displayName || '',
          phone: (data.phone as string) || '',
          photoURL: (data.photoURL as string) || currentUser.photoURL || ''
        });
      })
      .catch((err) => {
        console.error('Failed to load profile', err);
        toast.error('Failed to load your profile');
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  // Route is protected; this is only a safety guard.
  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      // Only profile fields are written — the `role` field is never touched,
      // as required by the Firestore security rules for self-updates.
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: form.name.trim(),
        phone: form.phone.trim(),
        photoURL: form.photoURL.trim() || null
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initial = (form.name || currentUser.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="pt-16 min-h-screen bg-[#F8FAFC]">
      <div className="bg-gradient-to-br from-[#0F4C81] to-[#0A2040] py-14 text-center text-white mb-10">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Profile</h1>
        <p className="text-blue-200">Manage your personal information.</p>
      </div>

      <div className="max-w-xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-pulse space-y-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto" />
            <div className="h-10 bg-gray-200 rounded-xl" />
            <div className="h-10 bg-gray-200 rounded-xl" />
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="flex flex-col items-center mb-8">
              {form.photoURL ? (
                <img src={form.photoURL} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-50 mb-3" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#0F4C81] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-blue-50 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {initial}
                </div>
              )}
              <p className="text-sm text-gray-500">{currentUser.email}</p>
              {userRole && (
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-[#0F4C81] px-3 py-1 rounded-full capitalize">
                  <Shield className="w-3 h-3" /> {userRole}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+20 100 000 0000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Photo URL</label>
                <input
                  type="url"
                  value={form.photoURL}
                  onChange={(e) => setForm((f) => ({ ...f, photoURL: e.target.value }))}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F4C81] focus:ring-2 focus:ring-[#0F4C81]/10 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-8 w-full bg-[#0F4C81] hover:bg-[#0A3860] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
