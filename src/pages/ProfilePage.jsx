import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Edit3, Share2, MapPin, GraduationCap, Link as LinkIcon, 
  FileText, Trophy, Plus, Award, Code, Zap, Sparkles, User, Bell, Search, Menu, MessageSquare,
  Loader2, LogOut, Image, CheckCircle, X, Star, BookOpen, Users
} from 'lucide-react';

// 👇 Import Layout baru, HAPUS import Sidebar yang lama
import DashboardLayout from '../components/layout/DashboardLayout';
import Topheader from '../components/Topheader';
import { supabase } from '../api/supabase';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [connectionCount, setConnectionCount] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // --- STATE UNTUK MENTOR ---
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentorForm, setMentorForm] = useState({
    specialties: '',
    achievements: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/'); 
        return;
      }

      // 1. Ambil Data Profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // 2. Ambil Jumlah Koneksi (Cepat karena hanya hitung baris)
      const { count, error: countError } = await supabase
        .from('koneksi')
        .select('*', { count: 'exact', head: true })
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .eq('status', 'accepted');

      if (!countError && count !== null) {
        setConnectionCount(count);
      }

    } catch (error) {
      console.error('Error fetching data:', error.message);
      setErrorMsg('Gagal memuat data profil. Silakan muat ulang halaman.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  // --- FUNGSI UNGGAH AVATAR ---
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Pengguna tidak ditemukan.");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      alert('Foto profil berhasil diperbarui!');
      fetchUserData(); 

    } catch (err) {
      console.error('Gagal mengunggah foto profil:', err.message);
      setErrorMsg('Gagal mengunggah foto profil: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI DAFTAR MENTOR ---
  const handleRegisterMentor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const specialtiesArray = mentorForm.specialties
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

      const { error } = await supabase
        .from('profiles')
        .update({
          is_mentor: true,
          mentor_specialties: specialtiesArray,
          mentor_achievements: mentorForm.achievements,
          mentor_rating: 5.0
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Selamat! Kamu sekarang resmi menjadi Mentor di JuaraBareng!');
      setShowMentorModal(false);
      fetchUserData(); 
    } catch (error) {
      alert('Gagal mendaftar jadi mentor. Coba lagi nanti.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 👇 STATE 1: LOADING (Dibungkus Layout)
  if (isLoading && !profile) {
    return (
      <DashboardLayout onLogout={handleLogout}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold">Memuat profilmu...</p>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = profile?.full_name || 'Pengguna Juara';
  const username = profile?.username || fullName.split(' ')[0].toLowerCase();
  const title = profile?.title || 'Mahasiswa'; 
  const university = profile?.university || 'Belum diatur';
  const location = profile?.location || 'Indonesia';
  const bio = profile?.bio || '';
  const skills = profile?.skills || []; 
  const initial = fullName.charAt(0).toUpperCase();
  const bannerColor = profile?.banner_color || '#2563EB';

  // 👇 STATE 2: BERHASIL (Dibungkus Layout)
  return (
    <DashboardLayout onLogout={handleLogout}>
      
      {/* Jika komponen Topheader sudah diurus di dalam DashboardLayout, baris ini bisa kamu hapus nanti */}
      <Topheader userInitials={initial} />

      <div className="p-4 md:p-6 lg:p-8 pb-24 max-w-5xl mx-auto space-y-6">
        
        {errorMsg && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl font-bold border border-rose-100 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={fetchUserData} className="px-4 py-2 bg-white text-rose-600 rounded-xl text-sm border border-rose-200 hover:bg-rose-100">Coba Lagi</button>
          </div>
        )}

        {/* 1. HEADER PROFIL */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div style={{ backgroundColor: bannerColor }} className="h-48 md:h-64 relative overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-white/10 to-white/30 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-30 translate-y-1/2"></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
          
          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end -mt-16 md:-mt-20 mb-6 gap-4">
              
              {/* Avatar Interaktif */}
              <div className="relative inline-block w-fit">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-[6px] border-white bg-slate-100 flex items-center justify-center text-5xl font-black text-slate-400 shadow-xl overflow-hidden relative group">
                  
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initial
                  )}
                  
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                    <Camera className="text-white mb-1" size={24} />
                    <span className="text-white text-xs font-bold">Ubah Foto</span>
                  </label>
                  <input 
                    id="avatar-upload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 bg-green-500 border-4 border-white rounded-full shadow-sm" title="Online"></div>
              </div>
              
              {/* Tombol Aksi */}
              <div className="flex gap-2 md:gap-3">
                <button className="px-4 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm">
                  <Share2 size={18} />
                  <span className="hidden sm:inline">Bagikan</span>
                </button>
                <button onClick={() => navigate('/edit-profile')} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                  <Edit3 size={18} />
                  <span>Edit Profil</span>
                </button>
              </div>
            </div>

            {/* Detail Teks yang Telah Dirapikan */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{fullName}</h1>
                
                <div className="flex flex-wrap gap-2">
                  {/* Badge Kolaborasi */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-100/80 text-yellow-700 text-xs font-black uppercase tracking-wider border border-yellow-200 w-fit">
                    <Sparkles size={14} className="text-yellow-500" />
                    Open to Collaborate
                  </span>

                  {/* Badge Mentor */}
                  {profile?.is_mentor && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200 w-fit">
                      <CheckCircle size={14} className="text-blue-600" />
                      Mentor Terverifikasi
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-slate-500 font-medium text-lg mb-5">@{username} • {title}</p>
              
              {/* Bar Info: Koneksi & Detail Geografis */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Badge Koneksi */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                    <Users size={18} />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-lg font-black text-slate-800">{connectionCount}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Koneksi</span>
                  </div>
                </div>

                {/* Badge Lokasi & Edukasi */}
                <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-600 bg-slate-50 p-3.5 px-5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500" />
                    {location}
                  </div>
                  <div className="w-px h-4 bg-slate-200 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-blue-500" />
                    {university}
                  </div>
                  {profile?.github_link && (
                    <>
                      <div className="w-px h-4 bg-slate-200 hidden md:block"></div>
                      <div className="flex items-center gap-2">
                        <LinkIcon size={16} className="text-blue-500" />
                        <a href={profile.github_link} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Portofolio</a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. GRID KONTEN UTAMA (CV & SKILL) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* TENTANG SAYA */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400 group-hover:w-3 transition-all duration-300"></div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <FileText className="text-blue-600" />
                  Tentang Saya
                </h2>
              </div>
              
              {bio ? (
                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{bio}</p>
              ) : (
                <>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    Belum ada bio. Tambahkan bio agar orang lebih mengenalmu dan mudah diajak berkolaborasi dalam tim!
                  </p>
                  <button onClick={() => navigate('/edit-profile')} className="mt-4 px-4 py-2 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl font-bold hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm w-full justify-center">
                    <Plus size={16} /> Tambahkan Bio Singkat
                  </button>
                </>
              )}
            </div>

            {/* GALERI PORTOFOLIO */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Image className="text-blue-600" />
                  Galeri Hasil Karya
                </h2>
              </div>
              
              {profile?.portfolio_urls && profile.portfolio_urls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {profile.portfolio_urls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-2xl overflow-hidden group/item relative border border-slate-100 bg-slate-50">
                      <img src={url} alt={`Karya ${index + 1}`} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover/item:bg-slate-900/10 transition-colors duration-300"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium mb-4">Belum ada karya yang diunggah.</p>
                  <button onClick={() => navigate('/edit-profile')} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:text-blue-600 hover:border-blue-300 transition-colors text-sm">
                    Mulai Pamerkan Karyamu
                  </button>
                </div>
              )}
            </div>

            {/* PENCAPAIAN & KOMPETISI */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="text-blue-600" />
                  Pencapaian & Kompetisi
                </h2>
                <button onClick={() => navigate('/edit-profile')} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {profile?.achievements && profile.achievements.length > 0 ? (
                  profile.achievements.map((ach, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="w-14 h-14 shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-600">
                        <Award size={24} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                          {ach.title}
                        </h3>
                        {ach.description && (
                          <p className="text-slate-500 font-medium text-sm mt-1">{ach.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div onClick={() => navigate('/edit-profile')} className="flex gap-4 group cursor-pointer border-2 border-dashed border-transparent hover:border-slate-200 p-2 -ml-2 rounded-2xl transition-all">
                    <div className="w-14 h-14 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 group-hover:scale-105 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all text-slate-400 group-hover:text-blue-500">
                      <Award size={24} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-black text-slate-400 text-lg group-hover:text-blue-600 transition-colors">Belum ada pencapaian</h3>
                      <p className="text-slate-400 font-medium text-sm mt-1">Klik di sini untuk menambahkan riwayat lomba!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* KOLOM KANAN */}
          <div className="space-y-6">
            
            {/* MENCARI TIM BANNER */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-blue-900/10 text-white relative overflow-hidden border border-slate-800">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-40"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-40"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 text-xs font-black uppercase tracking-wider mb-4">
                  <Zap size={14} /> Available
                </div>
                <h3 className="text-2xl font-black mb-2 leading-tight">Mencari Tim Juara!</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">
                  Buka status "Mencari Tim" agar mahasiswa lain bisa merekrutmu ke dalam tim mereka.
                </p>
                <button className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black rounded-2xl transition-transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2">
                  <Edit3 size={18} />
                  Buat Pengumuman
                </button>
              </div>
            </div>

            {/* SKILLS */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Zap className="text-yellow-500" />
                  Skills & Keahlian
                </h2>
                <button onClick={() => navigate('/edit-profile')} className="text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 p-2 rounded-lg">
                  <Edit3 size={16} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl text-sm font-bold shadow-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm italic font-medium">Belum ada skill yang ditambahkan.</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 3. SECTION MENTOR (PALING BAWAH) */}
        <div className="pt-4">
          {!profile?.is_mentor ? (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-6 md:p-8 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute -right-10 -bottom-10 opacity-20"><Trophy size={150} /></div>
              <div className="relative z-10 w-full md:w-auto flex-1">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Star className="text-amber-400 fill-amber-400" /> Punya Pengalaman Juara?</h2>
                <p className="text-blue-100 font-medium max-w-2xl">Bagikan ilmumu, bimbing tim lain, dan bangun reputasimu dengan menjadi Mentor di JuaraBareng. Bantu mahasiswa lain mencapai potensi maksimal mereka!</p>
              </div>
              <button 
                onClick={() => setShowMentorModal(true)}
                className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black shadow-md hover:scale-105 transition-transform shrink-0 whitespace-nowrap relative z-10 w-full md:w-auto"
              >
                Daftar Jadi Mentor
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Star className="text-amber-500 fill-amber-500" /> Profil Mentormu
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Spesialisasi Bimbingan</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.mentor_specialties && profile.mentor_specialties.length > 0 ? (
                      profile.mentor_specialties.map((skill, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-100">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Belum ada spesialisasi</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Prestasi Tersorot</h3>
                  <p className="text-slate-700 font-medium flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <BookOpen className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    {profile.mentor_achievements || 'Belum menulis prestasi.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* --- MODAL PENDAFTARAN MENTOR --- */}
      {/* Modal sengaja ditaruh di dalam Layout supaya posisinya tetap overlay di tengah layar */}
      {showMentorModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Trophy className="text-blue-600" /> Form Pendaftaran Mentor
              </h2>
              <button onClick={() => setShowMentorModal(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRegisterMentor} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Spesialisasi Kamu</label>
                <input 
                  type="text" 
                  required
                  placeholder="Misal: UI/UX Design, Presentasi Bisnis, Web Dev"
                  className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-slate-50 font-medium"
                  value={mentorForm.specialties}
                  onChange={(e) => setMentorForm({...mentorForm, specialties: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">*Pisahkan dengan koma jika lebih dari satu.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prestasi Tertinggi / Pengalaman</label>
                <textarea 
                  required
                  placeholder="Misal: Juara 1 Gemastik 2023 Divisi UX Design. Saya bisa membantu mereview proposal..."
                  className="w-full border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-slate-50 font-medium min-h-[100px]"
                  value={mentorForm.achievements}
                  onChange={(e) => setMentorForm({...mentorForm, achievements: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Ajukan Profil Mentor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}