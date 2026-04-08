import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../api/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State untuk menangani error gambar
  const [imgFailed, setImgFailed] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('university')
          .eq('id', data.session.user.id)
          .single();

        // PGRST116: Result contains 0 rows (User baru belum isi profile)
        if (profileError && profileError.code !== 'PGRST116') {
           throw profileError; 
        }

        if (profile?.university) {
          navigate('/feed');
        } else {
          navigate('/onboarding');
        }
      }

    } catch (error) {
      console.error("Login error:", error.message);
      
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Email atau password salah. Silakan periksa kembali.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Email Anda belum dikonfirmasi. Cek kotak masuk Anda.');
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-8 relative overflow-hidden font-sans">
      
      {/* Dekorasi Latar Belakang */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="bg-white max-w-md w-full p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative z-10">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-slate-800 mb-6 flex items-center gap-2 text-sm font-bold transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {/* HEADER SECTION */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative group mx-auto">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-2xl group-hover:opacity-30 transition-opacity"></div>
              
              {!imgFailed ? (
                <img 
                  src="/src/assets/logo.png"
                  alt="Logo Aplikasi" 
                  className="relative w-16 h-16 object-cover rounded-2xl shadow-lg shadow-blue-500/20 -rotate-6 group-hover:rotate-0 transition-transform duration-300" 
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div className="relative w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center text-white -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                  <ShieldCheck size={32} />
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">Selamat Datang 👋</h2>
          <p className="text-slate-500 text-sm font-medium">Masuk untuk melanjutkan dan mencari tim juaramu.</p>
        </div>

        {/* Pesan Error */}
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium mb-6 flex items-start gap-3 border border-red-100">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Alamat Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email" 
                required
                placeholder="nama@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
              <button type="button" className="text-[10px] md:text-xs font-bold text-blue-600 hover:underline hover:text-blue-700 transition-colors">
                Lupa Sandi?
              </button>
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={`w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${showPassword ? 'tracking-normal' : 'tracking-widest'}`}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 bg-slate-900 text-white px-6 py-3.5 md:py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md shadow-slate-200 active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm font-medium text-slate-500">
            Belum punya akun?{' '}
            <button onClick={() => navigate('/register')} className="text-blue-600 font-bold hover:underline hover:text-blue-700 transition-colors">
              Daftar Gratis
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}