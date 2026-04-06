import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Target, Search, Users, BookOpen, 
  User, LogOut, MessageSquare, Bell, Menu, X 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../api/supabase';
// PASTIKAN IMPORT INI BENAR
import myLogo from '../assets/logo-bawah.png';

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State untuk mobile toggle & data
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoadingProfile(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { count } = await supabase
          .from('mentoring_requests')
          .select('*', { count: 'exact', head: true })
          .eq('mentor_id', user.id)
          .eq('status', 'pending');

        setUnreadCount(count || 0);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) setUserProfile(profileData);
      } catch (error) {
        console.error("Error sidebar:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchSidebarData();
  }, []);

  // Tutup sidebar otomatis saat pindah halaman (khusus mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
    <>
      {/* MOBILE HEADER (Hanya muncul di layar HP) */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={myLogo} alt="Logo" className="h-7 w-auto" />
          <span className="font-bold text-sm tracking-tighter uppercase text-slate-900">
            JUARA<span className="text-blue-600">BARENG</span>
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* OVERLAY (Background gelap saat menu mobile buka) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR CORE */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* LOGO SECTION (Desktop) */}
        <div className="p-6 border-b border-slate-100 hidden lg:flex items-center justify-between h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={myLogo} alt="Logo" className="h-9 w-auto object-contain" />
            <span className="font-extrabold text-xl tracking-tighter text-slate-900 uppercase">
              JUARA<span className="text-blue-600">BARENG</span>
            </span>
          </div>
          <button 
            onClick={() => navigate('/notifications')} 
            className={`relative p-2 rounded-xl transition-all ${
              location.pathname === '/notifications' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />}
          </button>
        </div>

        {/* MENU ITEMS */}
        <nav className="flex-1 p-4 space-y-1.5 mt-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={index} 
                onClick={() => navigate(item.path)}
                className={`group flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                <span className={`text-sm flex-1 ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
                {item.badge && (
                  <span className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* PROFILE & LOGOUT */}
        <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50">
          <div 
            onClick={() => navigate('/profile')} 
            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all hover:bg-white border border-transparent hover:border-slate-200 group ${
              location.pathname === '/profile' ? 'bg-white border-slate-200 ring-1 ring-slate-100' : ''
            }`}
          >
            {loadingProfile ? (
              <>
                <div className="w-10 h-10 bg-slate-200 animate-pulse rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 animate-pulse w-full overflow-hidden">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-2 bg-slate-200 rounded w-3/4" />
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 overflow-hidden">
                  {userProfile?.avatar_url || userProfile?.photo_url ? (
                    <img src={userProfile.avatar_url || userProfile.photo_url} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    (userProfile?.name || userProfile?.full_name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-bold text-sm text-slate-900 truncate">{userProfile?.name || userProfile?.full_name || 'Pengguna'}</p>
                  <p className="text-[10px] text-slate-400 font-black truncate uppercase tracking-wider">{userProfile?.major || userProfile?.role || 'MEMBER'}</p>
                </div>
              </>
            )}
          </div>
          
          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 mt-4 text-slate-400 hover:text-rose-600 text-xs w-full p-2.5 rounded-xl hover:bg-rose-50 transition-all font-black uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Keluar Sesi
          </button>
        </div>
      </aside>
    </>
  );
}