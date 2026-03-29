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
        options: { data: { full_name: formData.nama, university: formData.kampus, major: formData.minat } }
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          throw new Error("Email ini sudah terdaftar. Silakan login saja!");
        }
        throw signUpError;
      }
      
      if (data.user && data.session === null) {
        setSuccessMsg("Pendaftaran berhasil! Silakan cek email kamu untuk konfirmasi sebelum login.");
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4 py-10">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
        
        {/* Tombol Back diperbaiki menggunakan navigate(-1) */}
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-800 mb-6 flex items-center gap-2 text-sm font-bold transition-colors">
          <ArrowLeft size={16} /> Kembali
        </button>
        
        <h2 className="text-3xl font-black text-[#0f172a] tracking-tight mb-2">Buat Akun 🚀</h2>
        
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div className="flex flex-col gap-1">
              <span>{errorMsg}</span>
              {errorMsg.includes("terdaftar") && (
                // Navigasi ke halaman login jika email sudah terdaftar
                <button onClick={() => navigate('/login')} className="text-red-700 font-bold underline text-left">
                  Masuk di sini
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold mb-6">{successMsg}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
            <input type="text" name="nama" required value={formData.nama} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Budi Santoso" />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Kampus / Pribadi</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@contoh.com" />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Kata Sandi</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} minLength={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Minimal 6 karakter" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full mt-4 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Sudah punya akun?{' '}
          {/* Navigasi ke halaman login */}
          <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline">
            Masuk
          </button>
        </div>
      </div>
    </div>
  );
}