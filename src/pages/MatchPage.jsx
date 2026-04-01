import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // TAMBAHKAN IMPORT INI
import { supabase } from '../api/supabase'; // SESUAIKAN PATH INI
import Sidebar from '../components/layout/Sidebar';
import { 
  X, Heart, GraduationCap, Code, Palette, 
  TrendingUp, Loader2, Search, FileText // TAMBAHKAN FileText
} from 'lucide-react';

export default function MatchPage() {
  const navigate = useNavigate(); // INISIALISASI NAVIGATE

  // State Data User & Navigasi
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State UI (Match Animation)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  // State Search (Hanya untuk Tampilan Sesuai Gambar)
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Data from Supabase on Load
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) throw error;
        
        console.log("Data profiles dari Supabase:", data); 
        setProfiles(data || []);
      } catch (error) {
        console.error('Error fetching profiles:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const currentProfile = profiles[currentIndex];

  const handlePass = () => {
    nextProfile();
  };

  const handleConnect = () => {
    setShowMatchAnimation(true);
    setTimeout(() => {
      setShowMatchAnimation(false);
      nextProfile();
    }, 1200);
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setProfiles([]); // Habis
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

      {/* MAIN LAYOUT (Sidebar + Content) */}
      <div className="flex flex-1">
        
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT AREA (KONTEN MATCH) */}
        <main className="flex-1 p-6 md:p-10 flex flex-col items-center">
          
          {/* A. SEARCH BAR */}
          <div className="w-full max-w-xl mb-10 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Cari nama partner..."
              className="w-full bg-white border border-slate-100 rounded-3xl py-4 pl-14 pr-6 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* B. MATCH CARD CONTAINER */}
          <div className="w-full max-w-xl flex-1 flex flex-col relative justify-center">
            
            {/* Animasi Match Overlay */}
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
            ) : currentProfile ? (
              <>
                {/* --- KARTU PROFIL --- */}
                <div className="bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[500px] relative transition-all duration-300">
                  
                  {/* Header Kartu (Gradient) */}
                  <div className={`h-1/3 min-h-[160px] bg-gradient-to-br from-blue-500 to-indigo-600 relative flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    {/* AVATAR */}
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/10 z-10 absolute -bottom-12 border-4 border-white overflow-hidden">
                      {currentProfile.avatar_url || currentProfile.photo_url ? (
                        <img 
                          src={currentProfile.avatar_url || currentProfile.photo_url} 
                          alt={currentProfile.name || "User Photo"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getRoleIcon(currentProfile.role)
                      )}
                    </div>
                  </div>

                  {/* Info User */}
                  <div className="pt-16 pb-6 px-8 flex flex-col flex-1 text-center">
                    
                    {/* NAMA USER */}
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {currentProfile.name || currentProfile.full_name || "Pengguna Tanpa Nama"}
                    </h2>
                    
                    {/* ROLE */}
                    <p className="text-blue-600 font-bold text-sm mb-4 mt-1 tracking-wide uppercase">
                      {currentProfile.role || "Innovator"}
                    </p>

                    {/* UNIVERSITAS */}
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 text-sm font-medium mb-6">
                      <GraduationCap size={16} />
                      <span>{currentProfile.university || currentProfile.univ || "Universitas Belum Diisi"}</span>
                    </div>

                    {/* BIO */}
                    <div className="bg-slate-50 p-6 rounded-2xl mb-6 flex-1 flex items-center justify-center border border-slate-100 italic">
                      <p className="text-slate-700 text-base leading-relaxed font-medium">
                        "{currentProfile.bio || 'Pengguna ini belum menuliskan bio apapun.'}"
                      </p>
                    </div>

                    {/* --- TOMBOL LIHAT CV LENGKAP --- */}
                    <button 
                      onClick={() => navigate(`/profile/${currentProfile.id}`)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md"
                    >
                      <FileText size={18} />
                      Lihat CV Lengkap
                    </button>

                  </div>
                </div>

                {/* --- TOMBOL AKSI (PASS & CONNECT) --- */}
                <div className="flex justify-center gap-6 mt-10 pb-6 z-10">
                  <button 
                    onClick={handlePass}
                    className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all active:scale-95"
                  >
                    <X size={28} />
                  </button>

                  <button 
                    onClick={handleConnect}
                    className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-500 hover:shadow-lg transition-all active:scale-95"
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
                <p className="text-slate-500 text-sm">Tidak ada lagi profil di sekitarmu.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}