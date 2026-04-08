import React, { useState } from 'react';
import { LayoutDashboard, Search, Bell, MessageSquare, Sparkles, Menu, X, User } from 'lucide-react';

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-8 flex flex-col transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex justify-between items-center mb-12">
          <div className="font-black text-2xl italic tracking-tighter text-blue-700">
            JUARA<span className="text-amber-500">BARENG</span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-slate-600"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="flex items-center gap-3 px-5 py-4 bg-blue-600 text-white rounded-[20px] font-bold shadow-xl shadow-blue-100 cursor-pointer">
            <LayoutDashboard size={20} /> Feed Kolaborasi
          </div>
          <div className="flex items-center gap-3 px-5 py-4 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors rounded-[20px] font-bold cursor-pointer">
            <Search size={20} /> Cari Partner
          </div>
        </nav>
      </aside>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger Button untuk Mobile */}
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-black tracking-tight hidden sm:block">Feed Utama</h2>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 hover:text-blue-600 transition-all">
               <Bell size={18}/>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 hover:text-blue-600 transition-all">
               <MessageSquare size={18}/>
             </div>
             {/* Placeholder Profil User */}
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 cursor-pointer ml-2 border-2 border-transparent hover:border-blue-300 transition-all">
               <User size={18} />
             </div>
          </div>
        </header>
        
        <div className="p-6 lg:p-10 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[30px] lg:rounded-[40px] p-8 lg:p-12 text-white relative overflow-hidden mb-10 shadow-2xl shadow-blue-200/50">
            <div className="relative z-10 max-w-lg">
              <h1 className="text-3xl lg:text-4xl font-black mb-4">Selamat Datang di Ekosistem Juara! 🚀</h1>
              <p className="text-blue-100/90 font-medium leading-relaxed mb-6 lg:mb-8 text-sm lg:text-base">
                Profilmu sudah terdaftar. Mulai jelajahi ribuan partner potensial dan menangkan kompetisi impianmu sekarang.
              </p>
            </div>
            <div className="absolute top-[-20%] right-[-10%] opacity-10 rotate-12 pointer-events-none">
              <Sparkles size={400} />
            </div>
          </div>
          
          {/* Tempat menaruh daftar Feed Kolaborasi nantinya */}
        </div>
      </main>
    </div>
  );
}