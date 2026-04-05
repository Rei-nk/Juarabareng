import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase'; 
import Sidebar from '../components/layout/Sidebar';
import { 
  ArrowLeft, GraduationCap, Mail, 
  Briefcase, Code, Palette, TrendingUp, Loader2, Award
} from 'lucide-react';

export default function ProfileDetailPage() {
  const { id } = useParams(); 
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
          .single(); 

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

  const getRoleIcon = (role = '') => {
    const r = role?.toLowerCase() || '';
    if (r.includes('hacker')) return <Code size={48} className="text-blue-500" />;
    if (r.includes('hipster')) return <Palette size={48} className="text-pink-500" />;
    return <TrendingUp size={48} className="text-amber-500" />;
  };

  // Helper untuk render konten yang mungkin berupa Object/JSON (Pencegah Layar Putih)
  const renderSafeContent = (content, fallback) => {
    if (!content) return fallback;
    if (typeof content === 'object') {
      // Jika object punya property title/description, pakai itu. Jika tidak, stringify.
      return content.description || content.title || JSON.stringify(content);
    }
    return content;
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
          <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
            Kembali
          </button>
        </main>
      </div>
    );
  }

  const profileName = profile.full_name || profile.name || "Pengguna Tanpa Nama";

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 md:left-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-xl transition-all"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-10 pb-20 -mt-20 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-10 mb-8 border border-slate-100">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-50 border-4 border-white shadow-lg rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  getRoleIcon(profile.role)
                )}
              </div>

              <div className="flex-1 pt-2">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{profileName}</h1>
                <p className="text-blue-600 font-bold text-lg mb-4 tracking-wide uppercase">{profile.role || "Innovator"}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-medium text-sm">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <GraduationCap size={16} className="text-slate-400" />
                    {profile.university || "Universitas Belum Diisi"}
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Award size={16} className="text-amber-500" />
                    {profile.angkatan || "202x"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="text-blue-500" /> Tentang Saya
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {renderSafeContent(profile.bio, "Pengguna ini belum menuliskan deskripsi diri.")}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="text-rose-500" /> Prestasi & Portofolio
                </h2>
                <div className="text-slate-600 leading-relaxed">
                  {/* Handle khusus jika data berupa array list */}
                  {Array.isArray(profile.achievements) ? (
                    <ul className="list-disc ml-5 space-y-2">
                      {profile.achievements.map((item, i) => (
                        <li key={i}>{typeof item === 'object' ? (item.title || item.name) : item}</li>
                      ))}
                    </ul>
                  ) : (
                    renderSafeContent(profile.achievements, "Belum ada data prestasi.")
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Keahlian (Skills)</h2>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs italic">Belum ada skill ditambahkan</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-lg">
                <h2 className="text-lg font-bold mb-4">Mari Berjejaring</h2>
                <p className="text-slate-400 text-sm mb-6">Jika kamu merasa cocok dengan profil ini, jangan ragu untuk menghubungi!</p>
                <button 
                  onClick={() => navigate('/connections')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
                >
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