import React from 'react';
import { LayoutDashboard, Search, Bell, MessageSquare, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 p-8 hidden lg:flex flex-col">
        <div className="font-black text-2xl italic tracking-tighter text-blue-700 mb-12">
          JUARA<span className="text-amber-500">BARENG</span>
        </div>
        <nav className="flex-1 space-y-2">
          <div className="flex items-center gap-3 px-5 py-4 bg-blue-600 text-white rounded-[20px] font-bold shadow-xl shadow-blue-100 cursor-pointer">
            <LayoutDashboard size={20} /> Feed Kolaborasi
          </div>
          <div className="flex items-center gap-3 px-5 py-4 text-slate-400 hover:bg-slate-50 rounded-[20px] font-bold cursor-pointer">
            <Search size={20} /> Cari Partner
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <h2 className="text-xl font-black tracking-tight">Feed Utama</h2>
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"><Bell size={18}/></div>
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"><MessageSquare size={18}/></div>
          </div>
        </header>
        
        <div className="p-10 max-w-5xl mx-auto">
          <div className="bg-blue-600 rounded-[40px] p-12 text-white relative overflow-hidden mb-10 shadow-2xl shadow-blue-200">
            <div className="relative z-10 max-w-lg">
              <h1 className="text-4xl font-black mb-4">Selamat Datang di Ekosistem Juara! 🚀</h1>
              <p className="text-blue-100 font-medium leading-relaxed mb-8">Profilmu sudah terdaftar. Mulai jelajahi ribuan partner potensial dan menangkan kompetisi impianmu sekarang.</p>
            </div>
            <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12">
              <Sparkles size={400} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
