import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import Sidebar from '../components/layout/Sidebar';
import { 
  X, Heart, GraduationCap, Code, Palette, 
  TrendingUp, Loader2, Search, FileText 
} from 'lucide-react';

export default function MatchPage() {
  const navigate = useNavigate();

  // State Data User & Navigasi
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State UI (Match Animation)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  // State Search 
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Data from Supabase on Load
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        // 1. Dapatkan user yang sedang login
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        if (!user) {
          setLoading(false);
          return;
        }
        setCurrentUser(user);

        // 2. Ambil daftar koneksi yang sudah ada (pending, accepted, rejected)
        const { data: existingConnections, error: connError } = await supabase
          .from('koneksi')
          .select('user_id_1, user_id_2')
          .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

        if (connError) throw connError;

        // 3. Buat daftar ID yang harus diabaikan (Diri sendiri + orang yang sudah terkoneksi)
        const ignoredIds = [user.id]; 
        existingConnections.forEach(conn => {
          ignoredIds.push(conn.user_id_1 === user.id ? conn.user_id_2 : conn.user_id_1);
        });

        // 4. Ambil profil, KECUALI yang ID-nya ada di daftar ignoredIds
        const { data: profilesData, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .not('id', 'in', `(${ignoredIds.join(',')})`);

        if (profError) throw profError;
        
        setProfiles(profilesData || []);
      } catch (error) {
        console.error('Error fetching profiles:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const currentProfile = profiles[currentIndex];

  // Filter profil berdasarkan kolom pencarian
  const filteredProfiles = profiles.filter(p => 
    (p.name || p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Ambil profil yang benar-benar sedang tampil di layar
  const displayProfile = searchTerm ? filteredProfiles[currentIndex] : currentProfile;

  const handlePass = () => {
    nextProfile();
  };

  const handleConnect = async () => {
    // PENTING: Gunakan displayProfile, bukan currentProfile agar search aman
    const targetProfile = displayProfile;
    
    if (!currentUser || !targetProfile) return;
    if (showMatchAnimation) return; // Cegah double click saat animasi berjalan

    setShowMatchAnimation(true);

    try {
      // SAFETY CHECK: Pastikan benar-benar belum ada koneksi di database (menghindari duplikasi)
      const { data: existingConnection } = await supabase
        .from('koneksi')
        .select('id')
        .or(`and(user_id_1.eq.${currentUser.id},user_id_2.eq.${targetProfile.id}),and(user_id_1.eq.${targetProfile.id},user_id_2.eq.${currentUser.id})`)
        .single();

      // Jika ternyata belum ada koneksi, lakukan Insert
      if (!existingConnection) {
        const { error } = await supabase
          .from('koneksi')
          .insert([
            {
              user_id_1: currentUser.id,
              user_id_2: targetProfile.id,
              status: 'pending' 
            }
          ]);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Gagal mengirim permintaan koneksi:", error.message);
    } finally {
      // Pindah ke profil berikutnya setelah animasi selesai (1.2 detik)
      setTimeout(() => {
        setShowMatchAnimation(false);
        nextProfile();
      }, 1200);
    }
  };

  const nextProfile = () => {
    if (searchTerm) {
      // Jika sedang mode pencarian
      if (currentIndex < filteredProfiles.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Hapus yang sudah di-pass/connect dari state utama
        setProfiles(prev => prev.filter(p => p.id !== displayProfile.id));
        setCurrentIndex(0);
      }
    } else {
      // Jika mode normal
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setProfiles([]); // Habis
      }
    }
  };

  // Helper untuk menentukan icon berdasarkan role jika foto tidak ada
  const getRoleIcon = (role = '') => {
    if (!role) return <TrendingUp size={40} className="text-amber-500" />;
    if (role.toLowerCase().includes('hacker')) return <Code size={40} className="text-blue-500" />;
    if (role.toLowerCase().includes('hipster')) return <Palette size={40} className="text-pink-500" />;
    return <TrendingUp size={40} className="text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <div className="flex flex-1">
        
        <Sidebar />

        <main className="flex-1 p-6 md:p-10 flex flex-col items-center">
          
          {/* SEARCH BAR */}
          <div className="w-full max-w-xl mb-10 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Cari nama partner..."
              className="w-full bg-white border border-slate-100 rounded-3xl py-4 pl-14 pr-6 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm transition-all outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentIndex(0); // Reset index jika user mengetik pencarian baru
              }}
            />
          </div>

          {/* MATCH CARD CONTAINER */}
          <div className="w-full max-w-xl flex-1 flex flex-col relative justify-center">
            
            {showMatchAnimation && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-[3rem]">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-black text-2xl animate-bounce shadow-2xl flex items-center gap-2">
                  <Heart className="fill-white" /> CONNECTED!
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 flex-1">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-slate-500 font-bold text-sm mt-2">Mencari Partner...</p>
              </div>
            ) : displayProfile ? (
              <>
                <div className="bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[500px] relative transition-all duration-300">
                  
                  <div className={`h-1/3 min-h-[160px] bg-gradient-to-br from-blue-500 to-indigo-600 relative flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/10 z-10 absolute -bottom-12 border-4 border-white overflow-hidden">
                      {displayProfile.avatar_url || displayProfile.photo_url ? (
                        <img 
                          src={displayProfile.avatar_url || displayProfile.photo_url} 
                          alt={displayProfile.name || "User Photo"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getRoleIcon(displayProfile.role)
                      )}
                    </div>
                  </div>

                  <div className="pt-16 pb-6 px-8 flex flex-col flex-1 text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {displayProfile.name || displayProfile.full_name || "Pengguna Tanpa Nama"}
                    </h2>
                    
                    <p className="text-blue-600 font-bold text-sm mb-4 mt-1 tracking-wide uppercase">
                      {displayProfile.role || "Innovator"}
                    </p>

                    <div className="flex items-center justify-center gap-1.5 text-slate-500 text-sm font-medium mb-6">
                      <GraduationCap size={16} />
                      <span>{displayProfile.university || displayProfile.univ || "Universitas Belum Diisi"}</span>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl mb-6 flex-1 flex items-center justify-center border border-slate-100 italic">
                      <p className="text-slate-700 text-base leading-relaxed font-medium">
                        "{displayProfile.bio || 'Pengguna ini belum menuliskan bio apapun.'}"
                      </p>
                    </div>

                    <button 
                      onClick={() => navigate(`/profile/${displayProfile.id}`)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md"
                    >
                      <FileText size={18} />
                      Lihat CV Lengkap
                    </button>
                  </div>
                </div>

                <div className="flex justify-center gap-6 mt-10 pb-6 z-10">
                  <button 
                    onClick={handlePass}
                    disabled={showMatchAnimation}
                    className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <X size={28} />
                  </button>

                  <button 
                    onClick={handleConnect}
                    disabled={showMatchAnimation}
                    className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-500 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Heart size={28} className="fill-current" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-10 flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <X size={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Habis!</h3>
                <p className="text-slate-500 text-sm">Tidak ada lagi profil baru yang tersedia.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}