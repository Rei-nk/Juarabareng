import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, User, GraduationCap, Briefcase, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../api/supabase';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nama: '', kampus: '', minat: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: { 
          data: { 
            full_name: formData.nama, 
            university: formData.kampus, 
            major: formData.minat 
          } 
        }
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          throw new Error("Email ini sudah terdaftar. Silakan login saja!");
        }
        throw signUpError;
      }
      
      if (data.user && data.session === null) {
        setSuccessMsg("Pendaftaran berhasil! Silakan cek kotak masuk email kamu untuk konfirmasi sebelum login.");
      } else if (data.user) {
        // Jika auto-login berhasil, langsung arahkan ke halaman onboarding
        navigate('/onboarding'); 
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4 py-8 md:py-12">
      <div className="bg-white max-w-md w-full p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          {/* Tombol Back */}
          <button 
            onClick={() => navigate(-1)} 
            className="text-slate-400 hover:text-slate-800 mb-6 flex items-center gap-2 text-sm font-bold transition-colors w-fit"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">Buat Akun 🚀</h2>
          <p className="text-slate-500 text-sm font-medium mb-6">Bergabunglah dan mulai perjalanan juaramu hari ini!</p>
          
          {/* Pesan Error */}
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium mb-6 flex items-start gap-3 border border-red-100">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <div className="flex flex-col gap-1">
                <span>{errorMsg}</span>
                {errorMsg.includes("terdaftar") && (
                  <button onClick={() => navigate('/login')} className="text-red-700 font-bold underline text-left hover:text-red-800">
                    Masuk di sini
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pesan Sukses */}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-bold mb-6 border border-emerald-100 flex items-start gap-3">
              <div className="bg-emerald-100 p-1 rounded-full shrink-0">
                <Mail size={16} className="text-emerald-600" />
              </div>
              <p>{successMsg}</p>
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Nama Lengkap */}
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input type="text" name="nama" required value={formData.nama} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="Budi Santoso" />
              </div>
            </div>

            {/* Dua Kolom untuk Mobile & Desktop (Kampus & Minat) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Asal Kampus</label>
                <div className="relative group">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type="text" name="kampus" required value={formData.kampus} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                    placeholder="Contoh: UI / ITB" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Bidang Minat</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type="text" name="minat" required value={formData.minat} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                    placeholder="Contoh: UI/UX" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Kampus / Pribadi</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="email@contoh.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} minLength={6}
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                  placeholder="Minimal 6 karakter" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Tombol Submit */}
            <button type="submit" disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white px-6 py-3.5 md:py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-blue-200 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Sudah punya akun?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline hover:text-blue-700">
              Masuk di sini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}