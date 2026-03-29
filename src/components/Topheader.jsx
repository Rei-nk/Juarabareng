import React from 'react';
import { Search, Bell, ArrowLeft, ArrowRight } from 'lucide-react';

export default function TopHeader() {
  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex gap-3 text-slate-400">
          <ArrowLeft size={20} className="cursor-pointer hover:text-slate-800 transition-colors" />
          <ArrowRight size={20} className="opacity-30 cursor-not-allowed" />
        </div>
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari postingan, lomba, profil mahasiswa..." 
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl pl-11 pr-4 py-2.5 outline-none focus:border-blue-400 focus:bg-white transition-all font-medium"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-700 transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
