import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage({ onFinish, supabase }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ university: '', major: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        university: formData.university,
        major: formData.major
      });
      if (error) throw error;
      onFinish();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-black mb-2">Sedikit lagi! 🎓</h2>
        <p className="text-slate-500 text-sm mb-6 font-medium">Lengkapi data kampusmu agar teman-teman bisa mengenalmu.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Asal Kampus" required className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
            value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} />
          <input type="text" placeholder="Jurusan" required className="w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
            value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} />
          <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2">
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Selesai & Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}