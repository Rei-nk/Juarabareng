import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldAlert, Eye, EyeOff, ShieldCheck } from 'lucide-react';

// --- CATATAN UNTUK LOKAL (VS CODE) ---
// 1. Pastikan Anda sudah mengaktifkan import supabase ini:
import { supabase } from '../api/supabase';

// 2. HAPUS tanda komentar (//) pada baris di bawah ini agar gambar terbaca oleh React:
// import logoApp from '../assets/logo.png';
const logoApp = ''; // 3. LALU HAPUS baris ini jika import di atas sudah kamu aktifkan
// ------------------------------------

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State baru untuk fitur intip password
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Melakukan login ke Supabase menggunakan email dan password asli
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        // 2. Cek apakah user sudah mengisi data profil (onboarding)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('university')
          .eq('id', data.session.user.id)
          .single();

        // Jika profileError ada dengan code 'PGRST116', berarti baris belum ada
        if (profile?.university) {
          navigate('/feed');
        } else {
          navigate('/onboarding');
        }
      }

    } catch (error) {
      console.error("Login error:", error.message);
      
      // Penanganan pesan error yang lebih user-friendly
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Email atau password salah. Silakan periksa kembali.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Email Anda belum dikonfirmasi. Pastikan pengaturan "Confirm Email" di Supabase sudah dimatikan.');
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFF] p-6 relative overflow-hidden">
      
      {/* Dekorasi Latar Belakang */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] -z-10" />

      {/* Tombol Kembali ke Landing */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 p-3 bg-white border-2 border-slate-100 rounded-full text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all z-10 shadow-sm"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="bg-white/80 backdrop-blur-xl max-w-md w-full p-10 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-white">
        
        {/* --- BAGIAN HEADER DENGAN LOGO KUSTOM MIRING --- */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative group mx-auto">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-2xl group-hover:opacity-30 transition-opacity"></div>
              
              <img 
                src="/src/assets/logo.png"
                alt="Logo Aplikasi" 
                className="relative w-16 h-16 object-cover rounded-2xl shadow-lg shadow-blue-500/20 -rotate-6 group-hover:rotate-0 transition-transform duration-300" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
              
              {/* Fallback Icon jika gambar gagal dimuat */}
              <div className="hidden relative w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 items-center justify-center text-white -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                <ShieldCheck size={32} />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Selamat Datang</h2>
          <p className="text-slate-500 font-medium text-sm">Masuk untuk mencari tim juaramu.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3">
            <div className="shrink-0 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Alamat Email</label>
            <input 
              type="email" 
              required
              placeholder="nama@email.com" 
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-500 focus:bg-white font-bold text-slate-700 transition-all" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          {/* --- BAGIAN INPUT PASSWORD (DENGAN IKON MATA) --- */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
              <button type="button" className="text-[10px] font-bold text-blue-600">Lupa Sandi?</button>
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••" 
                className="w-full p-4 pr-12 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-500 focus:bg-white font-bold text-slate-700 transition-all tracking-widest" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 transition-colors"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 mt-4 flex justify-center items-center gap-3 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Memproses...</span>
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-sm font-bold text-slate-400">
            Belum punya akun?{' '}
            <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline">
              Daftar Gratis
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}