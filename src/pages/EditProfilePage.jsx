import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Palette, ImagePlus, X, Trophy, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../api/supabase'; 

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    title: '',
    university: '',
    location: '',
    bio: '',
    github_link: '',
    skills: '', 
    banner_color: '#2563EB',
    portfolio_urls: [],
    achievements: [] // STATE BARU UNTUK PENCAPAIAN
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/'); return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setFormData({
            full_name: data.full_name || '',
            username: data.username || '',
            title: data.title || '',
            university: data.university || '',
            location: data.location || '',
            bio: data.bio || '',
            github_link: data.github_link || '',
            skills: data.skills ? data.skills.join(', ') : '',
            banner_color: data.banner_color || '#2563EB',
            portfolio_urls: data.portfolio_urls || [],
            achievements: data.achievements || [] // MUAT DATA PENCAPAIAN
          });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FUNGSI GALERI PORTOFOLIO ---
  const handleUploadPortfolio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImg(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, portfolio_urls: [...prev.portfolio_urls, publicUrl] }));
    } catch (err) {
      alert('Gagal mengunggah gambar: ' + err.message);
    } finally {
      setIsUploadingImg(false);
    }
  };

  const handleRemovePortfolio = (indexToRemove) => {
    setFormData(prev => ({
      ...prev, portfolio_urls: prev.portfolio_urls.filter((_, index) => index !== indexToRemove)
    }));
  };

  // --- FUNGSI PENCAPAIAN (BARU) ---
  const handleAddAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { title: '', description: '' }]
    }));
  };

  const handleAchievementChange = (index, field, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index][field] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const handleRemoveAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };
  // --------------------------------

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill !== '');

      // Pastikan achievement tidak ada yang kosong melompong sebelum disave
      const cleanedAchievements = formData.achievements.filter(
        ach => ach.title.trim() !== '' || ach.description.trim() !== ''
      );

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, 
          full_name: formData.full_name,
          username: formData.username,
          title: formData.title,
          university: formData.university,
          location: formData.location,
          bio: formData.bio,
          github_link: formData.github_link,
          skills: skillsArray,
          banner_color: formData.banner_color,
          portfolio_urls: formData.portfolio_urls,
          achievements: cleanedAchievements, // SIMPAN PENCAPAIAN
          updated_at: new Date()
        });

      if (error) throw error;
      alert('Profil berhasil diperbarui!');
      navigate('/profile'); 

    } catch (err) {
      alert('Gagal menyimpan profil: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 pb-24">
      <div className="max-w-2xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/profile')} className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black">Edit Profil</h1>
        </div>

        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Role / Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Universitas</label>
              <input type="text" name="university" value={formData.university} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi (Kota)</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Bio Singkat</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Skills (Pisahkan dengan koma)</label>
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Link Portofolio / GitHub</label>
            <input type="url" name="github_link" value={formData.github_link} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>

          {/* --- UI PENCAPAIAN & KOMPETISI (BARU) --- */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Trophy size={18} className="text-blue-500" />
                Pencapaian & Kompetisi
              </label>
              <button type="button" onClick={handleAddAchievement} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={16} /> Tambah
              </button>
            </div>

            <div className="space-y-4">
              {formData.achievements.map((ach, index) => (
                <div key={index} className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                  <div className="flex-1 space-y-3">
                    <input 
                      type="text" 
                      placeholder="Contoh: Juara 1 UI/UX Design Nasional" 
                      value={ach.title} 
                      onChange={(e) => handleAchievementChange(index, 'title', e.target.value)} 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Contoh: Diselenggarakan oleh Universitas X, Tahun 2023" 
                      value={ach.description} 
                      onChange={(e) => handleAchievementChange(index, 'description', e.target.value)} 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <button type="button" onClick={() => handleRemoveAchievement(index)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {formData.achievements.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">
                  Belum ada pencapaian yang ditambahkan.
                </div>
              )}
            </div>
          </div>
          {/* ---------------------------------------- */}

          {/* Galeri Portofolio */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <ImagePlus size={18} className="text-blue-500" /> Galeri Karya
            </label>
            <div className="flex flex-wrap gap-4">
              {formData.portfolio_urls.map((url, index) => (
                <div key={index} className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden group">
                  <img src={url} alt={`portfolio-${index}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemovePortfolio(index)} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"><X size={14} /></button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50">
                {isUploadingImg ? <Loader2 size={24} className="animate-spin" /> : <><ImagePlus size={24} className="mb-1" /><span className="text-[10px] font-bold">Tambah</span></>}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadPortfolio} disabled={isUploadingImg} />
              </label>
            </div>
          </div>

          {/* Tema Banner */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
              <Palette size={18} className="text-blue-500" /> Pilih Tema Banner Profil
            </label>
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-fit">
              {[{ name: 'Biru', color: '#2563EB' }, { name: 'Hijau', color: '#10B981' }, { name: 'Merah', color: '#EF4444' }, { name: 'Oranye', color: '#F97316' }, { name: 'Ungu', color: '#8B5CF6' }, { name: 'Gelap', color: '#0F172A' }].map((theme) => (
                <button key={theme.name} type="button" title={theme.name} onClick={() => setFormData({ ...formData, banner_color: theme.color })} style={{ backgroundColor: theme.color }} className={`w-12 h-12 rounded-full border-4 shadow-sm transition-transform hover:scale-110 active:scale-95 ${formData.banner_color === theme.color ? 'border-blue-500 shadow-blue-500/30 scale-110' : 'border-white'}`} />
              ))}
              <div className="w-px h-8 bg-slate-200 mx-1"></div>
              <div className="relative group w-12 h-12 flex items-center justify-center cursor-pointer" title="Pilih warna bebas">
                <input type="color" value={formData.banner_color} onChange={(e) => setFormData({ ...formData, banner_color: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`w-12 h-12 rounded-full border-4 shadow-sm flex items-center justify-center bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 transition-transform group-hover:scale-110 ${!['#2563EB', '#10B981', '#EF4444', '#F97316', '#8B5CF6', '#0F172A'].includes(formData.banner_color) ? 'border-blue-500 scale-110' : 'border-white'}`}><span className="text-white text-lg font-black drop-shadow-md">+</span></div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-4 flex justify-end">
            <button type="submit" disabled={isLoading} className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}