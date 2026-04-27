import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';

// Path sudah diperbaiki: Mundur satu folder ke 'src', lalu masuk ke 'assets'
import logoImage from '../assets/logo.png'; 

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk menangani fallback logo
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    // Memberikan efek loading singkat untuk kesan aplikasi premium
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 0.8 detik
    return () => clearTimeout(timer);
  }, []);

  // --- LOADING SCREEN ---
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-600 shadow-sm" />
          <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={24} />
        </div>
        <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">
          Memuat Arena...
        </p>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative font-sans selection:bg-blue-200 selection:text-blue-900">
      
      {/* --- DECORATIVE BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/60 rounded-full blur-[120px] -z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-indigo-100/60 rounded-full blur-[120px] -z-0 pointer-events-none" />

      {/* --- NAVBAR --- */}
      <nav className="relative flex justify-between items-center p-6 md:px-12 md:py-8 max-w-7xl mx-auto z-10">
        
        {/* LOGO AREA */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          {!imgFailed ? (
            <img 
              src={logoImage} 
              alt="Logo Juarabareng.id" 
              className="h-8 md:h-10 w-auto object-contain hover:scale-105 transition-transform"
              onError={() => setImgFailed(true)} 
            />
          ) : (
            // Teks Cadangan (Hanya muncul jika gambar gagal dimuat)
            <div className="text-xl md:text-2xl font-black text-blue-600 tracking-tighter italic flex items-center gap-2">
              <Trophy size={24} className="text-amber-500" />
              <span>JUARABARENG.<span className="text-slate-900 font-bold">ID</span></span>
            </div>
          )}
        </div>
        
        {/* NAV ACTION BUTTONS */}
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => navigate('/login')} 
            className="hidden sm:block text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            Masuk
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="bg-slate-900 text-white px-5 py-2.5 md:px-7 md:py-3 rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-md active:scale-[0.98]"
          >
            Daftar Gratis
          </button>
        </div>
      </nav>
      
      {/* --- HERO SECTION --- */}
      <main className="relative flex flex-col items-center justify-center text-center px-6 pt-12 pb-32 z-10 min-h-[75vh]">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 text-blue-600 mb-8 shadow-sm backdrop-blur-sm">
          <Sparkles size={16} className="text-blue-500 animate-pulse" />
          <span className="text-[10px] md:text-xs font-black tracking-widest uppercase">
            Platform Kolaborasi #1 Mahasiswa
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight max-w-5xl">
          Bangun Tim <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Juaramu Disini.
          </span>
        </h1>
        
        <p className="text-slate-500 text-sm md:text-lg lg:text-xl mb-10 max-w-2xl leading-relaxed font-medium">
          Temukan partner mahasiswa dengan skill yang melengkapi idemu. Berhenti berjuang sendiri, mulai menang bersama-sama.
        </p>
        
        <BackendTest />
        
        {/* Buttons Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/register')} 
            className="w-full sm:w-auto group flex justify-center items-center gap-3 bg-blue-600 text-white px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black text-base md:text-lg shadow-lg shadow-blue-600/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-[0.98]"
          >
            Mulai Sekarang
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate('/directory')} 
            className="w-full sm:w-auto flex justify-center items-center gap-3 bg-white text-slate-700 px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black text-base md:text-lg border border-slate-200 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all active:scale-[0.98]"
          >
            Lihat Lomba <Trophy size={20} className="text-amber-500" />
          </button>
        </div>

        {/* Social Proof */}
        <div className="mt-20 pt-10 border-t border-slate-200/60 w-full max-w-4xl flex flex-col items-center">
          <p className="text-[10px] md:text-xs font-black text-slate-400 mb-6 uppercase tracking-widest">
            Dipercaya oleh Mahasiswa Dari
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">UI.</div>
            <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">ITB.</div>
            <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">UGM.</div>
            <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">ITS.</div>
            <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">UB.</div>
          </div>
        </div>

      </main>
    </div>
  );
}n>
    </div>
  );
}