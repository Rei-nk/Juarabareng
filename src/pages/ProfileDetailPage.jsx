import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase'; // SESUAIKAN PATH INI
import Sidebar from '../components/layout/Sidebar';
import { 
  ArrowLeft, GraduationCap, MapPin, Mail, 
  Briefcase, Code, Palette, TrendingUp, Loader2, Award
} from 'lucide-react';

export default function ProfileDetailPage() {
  const { id } = useParams(); // Mengambil ID dari URL
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileDetail = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single(); // Mengambil 1 data spesifik

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile detail:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfileDetail();
  }, [id]);

  // Helper Icon
  const getRoleIcon = (role = '') => {
    if (!role) return <TrendingUp size={48} className="text-amber-500" />;
    if (role.toLowerCase().includes('hacker')) return <Code size={48} className="text-blue-500" />;
    if (role.toLowerCase().includes('hipster')) return <Palette size={48} className="text-pink-500" />;
    return <TrendingUp size={48} className="text-amber-500" />;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profil Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">Mungkin user ini sudah menghapus akunnya.</p>
          <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700">
            Kembali
          </button>
        </main>
      </div>
    );
  }

  const profileName = profile.name || profile.full_name || "Pengguna Tanpa Nama";

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* HEADER COVER */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <button 
            onClick={() => navigate(-1)} // Tombol kembali ke halaman sebelumnya
            className="absolute top-6 left-6 md:left-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-xl transition-all"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-10 pb-20 -mt-20 relative z-10">
          
          {/* INFO UTAMA KARTU */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-10 mb-8 border border-slate-100">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              
              {/* FOTO PROFIL BESAR */}
              <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-50 border-4 border-white shadow-lg rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                {profile.avatar_url || profile.photo_url ? (
                  <img 
                    src={profile.avatar_url || profile.photo_url} 
                    alt={profileName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getRoleIcon(profile.role)
                )}
              </div>

              {/* TEKS INFO */}
              <div className="flex-1 pt-2">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                  {profileName}
                </h1>
                <p className="text-blue-600 font-bold text-lg mb-4 tracking-wide uppercase">
                  {profile.role || "Innovator"}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-medium text-sm">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <GraduationCap size={16} className="text-slate-400" />
                    {profile.university || profile.univ || "Universitas Belum Diisi"}
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Award size={16} className="text-amber-500" />
                    {profile.angkatan || profile.batch || "Angkatan 202x"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DUA KOLOM: TENTANG & KEAHLIAN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* KOLOM KIRI (LEBIH LEBAR) */}
            <div className="md:col-span-2 space-y-8">
              {/* TENTANG SAYA */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="text-blue-500" /> Tentang Saya
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {profile.bio || "Pengguna ini belum menuliskan deskripsi panjang tentang dirinya."}
                </p>
              </div>

              {/* PENGALAMAN / PRESTASI */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="text-rose-500" /> Prestasi & Portofolio
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {profile.achievements || profile.portfolio || "Belum ada data prestasi atau portofolio yang diunggah."}
                </p>
              </div>
            </div>

            {/* KOLOM KANAN (SIDEBAR PROFIL) */}
            <div className="space-y-8">
              {/* SKILLS */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Keahlian (Skills)</h2>
                <div className="flex flex-wrap gap-2">
                  {/* Kalau di database ada kolom skills berupa array/teks, bisa dimap disini. Ini contoh dummy fallback */}
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">Figma</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">React JS</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">Public Speaking</span>
                </div>
              </div>

              {/* KONTAK / SOSMED */}
              <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-lg">
                <h2 className="text-lg font-bold mb-4">Mari Berjejaring</h2>
                <p className="text-slate-400 text-sm mb-6">Jika kamu merasa cocok dengan profil ini, jangan ragu untuk menghubungi!</p>
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2">
                  <Mail size={18} /> Chat Sekarang
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}