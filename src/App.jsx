import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Routes, Route, Navigate } from 'react-router-dom';
// Pastikan path supabase ini sesuai dengan strukturmu
import { supabase } from './api/supabase'; 

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

// 👇 1. IMPORT DUA HALAMAN BARU DI SINI 👇
import NotificationsPage from './pages/NotificationsPage';
import MentoringPage from './pages/MentoringPage'; // Kita siapkan import untuk halaman Mentoring

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

  return (
    <Routes>
      {/* --- RUTE PUBLIK --- */}
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to={hasProfile ? "/feed" : "/onboarding"} replace />} />
      <Route path="/login" element={!session ? <LoginPage /> : <Navigate to={hasProfile ? "/feed" : "/onboarding"} replace />} />
      <Route path="/register" element={!session ? <RegisterPage /> : <Navigate to="/onboarding" replace />} />

      {/* --- RUTE TERPROTEKSI (Harus Login & Punya Profil) --- */}
      <Route 
        path="/feed" 
        element={session ? (hasProfile ? <FeedPage onLogout={handleLogout} /> : <Navigate to="/onboarding" replace />) : <Navigate to="/login" replace />} 
      />
      
      <Route 
        path="/directory" 
        element={session ? (hasProfile ? <DirectoryPage onLogout={handleLogout} /> : <Navigate to="/onboarding" replace />) : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/match" 
        element={session ? (hasProfile ? <MatchPage onLogout={handleLogout} /> : <Navigate to="/onboarding" replace />) : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/connections" 
        element={session ? (hasProfile ? <ConnectionsPage onLogout={handleLogout} /> : <Navigate to="/onboarding" replace />) : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/edit-profile" 
        element={<EditProfilePage />} 
      />

      <Route 
        path="/profile" 
        element={session ? (hasProfile ? <ProfilePage onLogout={handleLogout} /> : <Navigate to="/onboarding" replace />) : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/bank-ide" 
        element={session ? (hasProfile ? <BankIdePage /> : <Navigate to="/onboarding" replace />) : <Navigate to="/login" replace />} 
      />

      {/* 👇 2. RUTE NOTIFIKASI & MENTORING DITAMBAHKAN DI SINI 👇 */}
      <Route 
        path="/notifications" 
        element={session ? (hasProfile ? <NotificationsPage /> : <Navigate to="/onboarding" replace />) : <Navigate to="/login" replace />} 
      />

      <Route 
        path="/mentoring" 
        element={session ? (hasProfile ? <MentoringPage /> : <Navigate to="/onboarding" replace />) : <Navigate to="/login" replace />} 
      />

      {/* --- RUTE ONBOARDING (Harus Login TAPI Belum Punya Profil) --- */}
      <Route 
        path="/onboarding" 
        element={session ? (!hasProfile ? <OnboardingPage onFinish={() => setHasProfile(true)} /> : <Navigate to="/feed" replace />) : <Navigate to="/login" replace />} 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}