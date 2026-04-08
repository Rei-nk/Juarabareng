import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './api/supabase'; 

// --- IMPORTS LAYOUT & PAGES ---
import DashboardLayout from './components/layout/DashboardLayout'; // Pastikan path ini sesuai!

import BankIdePage from './pages/BankIdePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import FeedPage from './pages/FeedPage';
import DirectoryPage from './pages/DirectoryPage';
import MatchPage from './pages/MatchPage';
import ConnectionsPage from './pages/ConnectionsPage'; 
import ProfilePage from './pages/ProfilePage'; 
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import MentoringPage from './pages/MentoringPage';
import ProfileDetailPage from './pages/ProfileDetailPage'; 

export default function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) checkUserProfile(initialSession.user.id);
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        checkUserProfile(currentSession.user.id);
      } else {
        setHasProfile(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('university')
        .eq('id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      setHasProfile(!!data?.university);
    } catch (err) {
      console.error("Error cek profil:", err);
      setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-50 rounded-full animate-spin border-t-blue-600" />
          <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={24} />
        </div>
        <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">
          Memuat Arena...
        </p>
      </div>
    );
  }

  // 👇 HELPER COMPONENT: Agar kode routing tidak berulang-ulang
  // Komponen ini otomatis mengecek login, mengecek profil, dan membungkus halaman dengan DashboardLayout
  const ProtectedRoute = ({ children }) => {
    if (!session) return <Navigate to="/login" replace />;
    if (!hasProfile) return <Navigate to="/onboarding" replace />;
    
    return (
      <DashboardLayout onLogout={handleLogout}>
        {children}
      </DashboardLayout>
    );
  };

  return (
    <Routes>
      {/* --- RUTE PUBLIK --- */}
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to={hasProfile ? "/feed" : "/onboarding"} replace />} />
      <Route path="/login" element={!session ? <LoginPage /> : <Navigate to={hasProfile ? "/feed" : "/onboarding"} replace />} />
      <Route path="/register" element={!session ? <RegisterPage /> : <Navigate to="/onboarding" replace />} />

      {/* --- RUTE ONBOARDING (Khusus: Harus Login tapi Belum Punya Profil. TIDAK pakai Sidebar) --- */}
      <Route 
        path="/onboarding" 
        element={session ? (!hasProfile ? <OnboardingPage onFinish={() => setHasProfile(true)} /> : <Navigate to="/feed" replace />) : <Navigate to="/login" replace />} 
      />

      {/* --- RUTE TERPROTEKSI (Pakai DashboardLayout / Sidebar) --- */}
      <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/directory" element={<ProtectedRoute><DirectoryPage /></ProtectedRoute>} />
      <Route path="/match" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/:id" element={<ProtectedRoute><ProfileDetailPage /></ProtectedRoute>} />
      <Route path="/bank-ide" element={<ProtectedRoute><BankIdePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/mentoring" element={<ProtectedRoute><MentoringPage /></ProtectedRoute>} />

      {/* Rute Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}