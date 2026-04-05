import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Target, 
  Search, 
  Users, 
  BookOpen, 
  User, 
  LogOut,
  MessageSquare,
  Bell 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../api/supabase';
import myLogo from '../assets/logo-bawah.png';

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State untuk notifikasi dan profil
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoadingProfile(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Ambil Notifikasi Mentoring
        const { count, error: notifError } = await supabase
          .from('mentoring_requests')
          .select('*', { count: 'exact', head: true })
          .eq('mentor_id', user.id)
          .eq('status', 'pending');

        if (!notifError) setUnreadCount(count || 0);

        // 2. Ambil Data Profil User yang Sedang Login
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData) {
          setUserProfile(profileData);
        }

      } catch (error) {
        console.error("Gagal mengambil data sidebar:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchSidebarData();
  }, []);

  // Data menu navigasi
  const menuItems = [
    { id: 'feed', icon: LayoutGrid, label: 'Feed Kolaborasi', path: '/feed' },
    { id: 'directory', icon: Target, label: 'Direktori Lomba', path: '/directory' },
    { id: 'match', icon: Search, label: 'Cari Tim (Match)', path: '/match' },
    { id: 'connections', icon: MessageSquare, label: 'Koneksi', path: '/connections' },
    { id: 'mentoring', icon: Users, label: 'Mentoring Hub', path: '/mentoring' },
    { id: 'ideas', icon: BookOpen, label: 'Bank Ide Juara', path: '/bank-ide' }, 
    { id: 'profile', icon: User, label: 'Profilku (CV)', badge: '1 Bar', path: '/profile' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-20">
      
      {/* Area Header (Logo + Tombol Notifikasi) */}
      
      <div className="sidebar">
        {/* 2. Gunakan variabel hasil import sebagai src */}
        <img src={myLogo} alt="Logo" className="w-10 h-10" />
      </div>
      
      <div className="p-6 border-b border-slate-100 flex items-center justify-between h-20">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <img 
            src="/src/assets/logo juara bareng.png" 
            alt="Logo Juarabareng.id" 
            className="h-9 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="hidden font-extrabold text-xl tracking-tighter text-slate-900 uppercase">
            JUARA<span className="text-blue-600">BARENG</span>
          </span>
        </div>

        {/* Tombol Lonceng Notifikasi */}
        <button 
          onClick={() => navigate('/notifications')}
          className={`relative p-2 rounded-xl transition-all ${
            location.pathname === '/notifications' 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'
          }`}
          title="Notifikasi"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Navigasi Menu */}
      <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <div 
              key={index} 
              onClick={() => navigate(item.path)}
              className={`group flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
              <span className={`text-sm flex-1 ${isActive ? 'font-bold' : 'font-semibold'}`}>
                {item.label}
              </span>
              {item.badge && (
                <span className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Profil User di bagian bawah (Dinamis) */}
      <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
        <div 
          onClick={() => navigate('/profile')}
          className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-white border border-transparent hover:border-slate-200 group ${
            location.pathname === '/profile' ? 'bg-white border-slate-200 ring-1 ring-slate-100' : ''
          }`}
        >
          {loadingProfile ? (
            // State Loading (Skeleton)
            <>
              <div className="w-10 h-10 bg-slate-200 animate-pulse rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-2 animate-pulse w-full overflow-hidden">
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-2 bg-slate-200 rounded w-3/4"></div>
              </div>
            </>
          ) : (
            // State Data Tersedia
            <>
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                {userProfile?.avatar_url || userProfile?.photo_url ? (
                  <img 
                    src={userProfile.avatar_url || userProfile.photo_url} 
                    alt="Profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Mengambil huruf pertama dari nama jika foto tidak ada
                  (userProfile?.name || userProfile?.full_name || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="font-bold text-sm text-slate-900 truncate">
                  {userProfile?.name || userProfile?.full_name || 'Pengguna'}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black truncate">
                  {/* Gunakan major, role, atau jurusan, sesuaikan dengan database-mu */}
                  {userProfile?.major || userProfile?.role || 'MEMBER'}
                </p>
              </div>
            </>
          )}
        </div>
        
        <button 
          onClick={onLogout} 
          className="flex items-center gap-2 mt-4 text-slate-400 hover:text-rose-600 text-xs w-full p-2.5 rounded-xl hover:bg-rose-50 transition-all font-black uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Keluar Sesi
        </button>
      </div>
    </aside>
  );
}