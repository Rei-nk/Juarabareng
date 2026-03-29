import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';
import logoImage from '../assets/logo juara bareng.png'; // Catatan: Ubah '.png' ke '.svg' atau '.jpg' jika ekstensinya berbeda

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-50 rounded-full animate-spin border-t-blue-600" />
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
    <div className="min-h-screen bg-[#FDFDFF] overflow-hidden relative selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- DECORATIVE BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px] -z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-indigo-100/50 rounded-full blur-[100px] -z-0" />

      {/* --- NAVBAR --- */}
      <nav className="relative flex justify-between items-center p-6 md:p-8 max-w-7xl mx-auto z-10">
        
        {/* LOGO AREA */}
        <div className="flex items-center">
          <img 
            src={logoImage} 
            alt="Logo Juarabareng.id" 
            className="h-8 md:h-10 w-auto object-contain"
            onError={(e) => {
              // Fallback: Jika gambar tidak ditemukan, sembunyikan img dan tampilkan teks
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          {/* Teks Cadangan (Hanya muncul jika gambar gagal dimuat) */}
          <div className="hidden text-2xl md:text-3xl font-black text-blue-600 tracking-tighter italic">
            JUARABARENG.<span className="text-slate-900 font-bold">ID</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/login')} 
          className="bg-slate-900 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full font-black text-sm md:text-base hover:bg-blue-600 transition-all shadow-md"
        >
          Masuk
        </button>
      </nav>
      
      {/* --- HERO SECTION --- */}
      <main className="relative flex flex-col items-center justify-center text-center px-4 pt-16 pb-32 z-10 min-h-[80vh]">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 mb-8 shadow-sm">
          <Sparkles size={16} className="text-blue-500 animate-pulse" />
          <span className="text-[10px] md:text-xs font-black tracking-widest uppercase">
            Platform Kolaborasi #1 Mahasiswa
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight max-w-5xl">
          Bangun Tim <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Juaramu Disini.
          </span>
        </h1>
        
        <p className="text-slate-500 text-base md:text-xl mb-12 max-w-2xl leading-relaxed font-medium">
          Temukan partner mahasiswa dengan skill yang melengkapi idemu. Berhenti berjuang sendiri, mulai menang bersama-sama.
        </p>
        
        {/* Buttons Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/login')} 
            className="w-full sm:w-auto group flex justify-center items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-full font-black text-lg shadow-xl shadow-blue-600/20 hover:scale-105 hover:bg-blue-700 transition-all"
          >
            Mulai Sekarang
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate('/directory')} 
            className="w-full sm:w-auto flex justify-center items-center gap-3 bg-white text-slate-700 px-10 py-5 rounded-full font-black text-lg border-2 border-slate-100 shadow-sm hover:border-slate-300 transition-all"
          >
            Lihat Lomba <Trophy size={20} className="text-amber-500" />
          </button>
        </div>

        {/* Social Proof (Hiasan) */}
        <div className="mt-24 pt-10 border-t border-slate-100/60 w-full max-w-4xl flex flex-col items-center">
          <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">
            Dipercaya oleh Mahasiswa Dari
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="text-2xl font-black text-slate-800 tracking-tighter">UI.</div>
            <div className="text-2xl font-black text-slate-800 tracking-tighter">ITB.</div>
            <div className="text-2xl font-black text-slate-800 tracking-tighter">UGM.</div>
            <div className="text-2xl font-black text-slate-800 tracking-tighter">ITS.</div>
            <div className="text-2xl font-black text-slate-800 tracking-tighter">UB.</div>
          </div>
        </div>

      </main>
    </div>
  );
}