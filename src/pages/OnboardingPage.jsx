import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; // SESUAIKAN PATH INI

export default function OnboardingPage({ onFinish }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ university: '', major: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      // 1. Ambil session user yang sedang login
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Sesi login habis, silakan login ulang.");
      }

      // 2. Simpan ke tabel profiles
      // PASTIKAN: nama kolom di database adalah 'university' dan 'major'
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          university: formData.university,
          major: formData.major,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

      // 3. Jika berhasil, jalankan fungsi onFinish (biasanya redirect ke home)
      onFinish();
    } catch (err) {
      console.error("Detail Error:", err);
      alert("Gagal menyimpan data: " + (err.message || "Cek koneksi/database"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-black mb-2 text-slate-800">Sedikit lagi! 🎓</h2>
        <p className="text-slate-500 text-sm mb-6 font-medium">Lengkapi data kampusmu agar teman-teman bisa mengenalmu.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Asal Kampus</label>
            <input 
              type="text" 
              placeholder="Contoh: Universitas Indonesia" 
              required 
              className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              value={formData.university} 
              onChange={e => setFormData({...formData, university: e.target.value})} 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Jurusan / Prodi</label>
            <input 
              type="text" 
              placeholder="Contoh: Teknik Informatika" 
              required 
              className="w-full p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              value={formData.major} 
              onChange={e => setFormData({...formData, major: e.target.value})} 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Selesai & Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}