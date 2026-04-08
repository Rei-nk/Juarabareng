import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { 
  X, Heart, GraduationCap, Code, Palette, 
  TrendingUp, Loader2, Search, FileText, Filter 
} from 'lucide-react';

export default function MatchPage() {
  const navigate = useNavigate();

  // State Data User
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State UI (Match Animation)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  // State Search & Filter Server-Side
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); // 'All', 'Hacker', 'Hipster', 'Hustler'

  // Fitur Debounce: Menunggu user selesai mengetik (500ms) sebelum mengubah state pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Data dari Supabase setiap kali debouncedSearch atau roleFilter berubah
  useEffect(() => {
    let isMounted = true;

    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        if (!user) {
          if (isMounted) setLoading(false);
          return;
        }
        if (isMounted) setCurrentUser(user);

        // 1. Ambil daftar koneksi yang sudah ada (termasuk pending, accepted, rejected)
        const { data: existingConnections, error: connError } = await supabase
          .from('koneksi')
          .select('user_id_1, user_id_2')
          .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

        if (connError) throw connError;

        // 2. Buat daftar ID yang harus diabaikan (Diri sendiri + orang yang sudah di-swipe)
        const ignoredIds = [user.id]; 
        existingConnections.forEach(conn => {
          ignoredIds.push(conn.user_id_1 === user.id ? conn.user_id_2 : conn.user_id_1);
        });

        // 3. Bangun Query Supabase secara dinamis
        let query = supabase
          .from('profiles')
          .select('*')
          .not('id', 'in', `(${ignoredIds.join(',')})`);

        // Filter berdasarkan pencarian nama (Server-Side)
        if (debouncedSearch) {
          // Asumsi ada kolom full_name dan name. ilike mengabaikan huruf besar/kecil.
          query = query.or(`full_name.ilike.%${debouncedSearch}%,name.ilike.%${debouncedSearch}%`);
        }

        // Filter berdasarkan Role (Server-Side)
        if (roleFilter !== 'All') {
          query = query.ilike('role', `%${roleFilter}%`);
        }

        // Eksekusi Query
        const { data: profilesData, error: profError } = await query;

        if (profError) throw profError;
        
        if (isMounted) setProfiles(profilesData || []);
      } catch (error) {
        console.error('Error fetching profiles:', error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfiles();

    return () => { isMounted = false; };
  }, [debouncedSearch, roleFilter]); // <-- Akan memicu ulang setiap pencarian/filter berubah

  // Tampilkan profil teratas dari antrean
  const displayProfile = profiles[0];

  const removeProfileFromStack = (profileId) => {
    setProfiles(prev => prev.filter(p => p.id !== profileId));
  };

  const handlePass = () => {
    if (!displayProfile) return;
    removeProfileFromStack(displayProfile.id);
  };

  const handleConnect = async () => {
    const targetProfile = displayProfile;
    if (!currentUser || !targetProfile || showMatchAnimation) return;

    setShowMatchAnimation(true);

    try {
      const { data: existingConnection } = await supabase
        .from('koneksi')
        .select('id')
        .or(`and(user_id_1.eq.${currentUser.id},user_id_2.eq.${targetProfile.id}),and(user_id_1.eq.${targetProfile.id},user_id_2.eq.${currentUser.id})`)
        .single();

      if (!existingConnection) {
        const { error } = await supabase
          .from('koneksi')
          .insert([{
            user_id_1: currentUser.id,
            user_id_2: targetProfile.id,
            status: 'pending' 
          }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Gagal mengirim permintaan koneksi:", error.message);
    } finally {
      setTimeout(() => {
        setShowMatchAnimation(false);
        removeProfileFromStack(targetProfile.id);
      }, 1200);
    }
  };

  const getRoleIcon = (role = '') => {
    if (!role) return <TrendingUp size={32} className="text-amber-500" />;
    const r = role.toLowerCase();
    if (r.includes('hacker') || r.includes('developer')) return <Code size={32} className="text-blue-500" />;
    if (r.includes('hipster') || r.includes('design')) return <Palette size={32} className="text-pink-500" />;
    return <TrendingUp size={32} className="text-amber-500" />;
  };

  return (
    // Penyesuaian flex-col di mobile, flex-row di layar besar
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans">
      

      {/* Konten Utama */}
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-x-hidden pb-24 md:pb-8">
        
        {/* BAGIAN PENCARIAN & FILTER (Mobile Responsive) */}
        <div className="w-full max-w-xl mb-6 md:mb-10 flex flex-col sm:flex-row gap-3">
          {/* Kolom Cari */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Cari nama..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all outline-none font-medium text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Kolom Filter */}
          <div className="relative w-full sm:w-auto shrink-0">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-[160px] bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-8 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm transition-all outline-none font-bold text-slate-700 appearance-none cursor-pointer"
            >
              <option value="All">Semua Role</option>
              <option value="Hacker">Hacker (Dev)</option>
              <option value="Hipster">Hipster (UI/UX)</option>
              <option value="Hustler">Hustler (Bisnis)</option>
            </select>
          </div>
        </div>

        {/* CONTAINER KARTU MATCH */}
        <div className="w-full max-w-sm md:max-w-xl flex-1 flex flex-col relative justify-center">
          
          {/* Animasi Match */}
          {showMatchAnimation && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-[2.5rem] md:rounded-[3rem]">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-black text-xl md:text-2xl animate-bounce shadow-2xl flex items-center gap-2">
                <Heart className="fill-white" /> TERHUBUNG!
              </div>
            </div>
          )}

          {/* Status Loading & Empty */}
          {loading ? (
            <div className="flex flex-col items-center justify-center text-center gap-2 flex-1">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-500 font-bold text-sm mt-2">Mencari Partner...</p>
            </div>
          ) : displayProfile ? (
            <>
              {/* KARTU PROFIL UTAMA */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[450px] md:min-h-[500px] relative transition-all duration-300">
                
                {/* Header/Banner Kartu */}
                <div className={`h-[140px] md:h-1/3 md:min-h-[160px] bg-gradient-to-br from-blue-500 to-indigo-600 relative flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  
                  {/* Avatar */}
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/10 z-10 absolute -bottom-10 md:-bottom-12 border-[3px] md:border-4 border-white overflow-hidden shrink-0">
                    {displayProfile.avatar_url || displayProfile.photo_url ? (
                      <img 
                        src={displayProfile.avatar_url || displayProfile.photo_url} 
                        alt={displayProfile.name || displayProfile.full_name || "User Photo"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getRoleIcon(displayProfile.role)
                    )}
                  </div>
                </div>

                {/* Konten Kartu */}
                <div className="pt-14 pb-6 px-6 md:px-8 flex flex-col flex-1 text-center">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight line-clamp-1">
                    {displayProfile.name || displayProfile.full_name || "Pengguna Anonim"}
                  </h2>
                  
                  <p className="text-blue-600 font-bold text-xs md:text-sm mb-3 mt-1 tracking-wide uppercase">
                    {displayProfile.role || "Innovator"}
                  </p>

                  <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs md:text-sm font-medium mb-4 md:mb-6">
                    <GraduationCap size={16} />
                    <span className="line-clamp-1">{displayProfile.university || displayProfile.univ || "Universitas Belum Diisi"}</span>
                  </div>

                  <div className="bg-slate-50 p-4 md:p-6 rounded-2xl mb-4 md:mb-6 flex-1 flex items-center justify-center border border-slate-100 italic">
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium line-clamp-4">
                      "{displayProfile.bio || 'Pengguna ini belum menuliskan bio apapun.'}"
                    </p>
                  </div>

                  <button 
                    onClick={() => navigate(`/profile/${displayProfile.id}`)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 md:py-3.5 px-6 rounded-xl md:rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md text-sm md:text-base"
                  >
                    <FileText size={18} />
                    Lihat CV Lengkap
                  </button>
                </div>
              </div>

              {/* TOMBOL AKSI SWIPE */}
              <div className="flex justify-center gap-4 md:gap-6 mt-6 md:mt-8 pb-4 z-10">
                <button 
                  onClick={handlePass}
                  disabled={showMatchAnimation}
                  className="w-14 h-14 md:w-16 md:h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 shadow-sm hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <X size={26} />
                </button>

                <button 
                  onClick={handleConnect}
                  disabled={showMatchAnimation}
                  className="w-14 h-14 md:w-16 md:h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 shadow-sm hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <Heart size={26} className="fill-current" />
                </button>
              </div>
            </>
          ) : (
            // State Jika Kartu Habis / Pencarian Tidak Ditemukan
            <div className="text-center p-8 md:p-10 flex-1 flex flex-col items-center justify-center bg-white rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Search size={30} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pencarian Kosong</h3>
              <p className="text-slate-500 text-sm font-medium">
                {searchTerm || roleFilter !== 'All' 
                  ? 'Tidak ada partner yang cocok dengan filter pencarianmu.' 
                  : 'Kamu sudah melihat semua profil yang tersedia saat ini. Kembali lagi nanti!'}
              </p>
              {(searchTerm || roleFilter !== 'All') && (
                <button 
                  onClick={() => { setSearchTerm(''); setRoleFilter('All'); }}
                  className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm hover:bg-blue-100 transition-colors"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}