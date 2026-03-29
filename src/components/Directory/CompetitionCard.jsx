import React, { useState } from 'react';
import { 
  Calendar, Users, GraduationCap, ChevronRight, 
  MapPin, Trophy, Star, ChevronDown, ChevronUp 
} from 'lucide-react';

export default function CompetitionCard({ comp }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Style kategori dinamis
  const getCategoryStyles = (category) => {
    switch (category?.toUpperCase()) {
      case 'TECH / IT': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'RISET AKADEMIK': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'BUSINESS': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div 
      className={`bg-white rounded-[2rem] transition-all duration-500 border-2 overflow-hidden shadow-sm
        ${isExpanded 
          ? 'col-span-full border-blue-500 shadow-blue-100 shadow-xl' 
          : 'border-transparent hover:border-blue-400 hover:shadow-md'
        }`}
    >
      <div className="p-8">
        {/* HEADER AREA */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getCategoryStyles(comp.category)}`}>
              {comp.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">
            <Calendar size={12} className="stroke-[3px]" />
            <span className="text-[10px] font-black uppercase">DL: {comp.deadline}</span>
          </div>
        </div>

        {/* TITLE & ORGANIZER */}
        <div className={`${isExpanded ? 'flex flex-col md:flex-row justify-between items-start md:items-center' : ''} mb-6`}>
          <div>
            <h3 className={`font-bold text-slate-900 leading-tight transition-all ${isExpanded ? 'text-3xl mb-2' : 'text-xl mb-1'}`}>
              {comp.title}
            </h3>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <GraduationCap size={16} className="text-slate-400" />
              <span>Oleh {comp.organizer}</span>
            </div>
          </div>
          
          {!isExpanded && (
            <div className="mt-6 flex justify-between items-center pt-5 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold">
                <Users size={14} />
                {comp.team_size}
              </div>
              <button 
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:gap-2 transition-all"
              >
                Lihat Detail <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* EXPANDED CONTENT AREA */}
        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <hr className="my-8 border-slate-100" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Kolom Kiri: Deskripsi & Hadiah */}
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-3">
                    <Star size={18} className="text-amber-500" /> Deskripsi Lomba
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {comp.description || "Kompetisi bergengsi ini mencari inovasi terbaik dari mahasiswa di seluruh Indonesia. Peserta diharapkan dapat memberikan solusi nyata yang aplikatif."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total Hadiah</p>
                    <p className="text-lg font-black text-blue-600">{comp.prize || "Rp 25.000.000"}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Lokasi</p>
                    <p className="text-sm font-bold text-slate-700">{comp.location || "Online / Jakarta"}</p>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Timeline & Info Lain */}
              <div className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} /> Timeline Tugas
                </h4>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">Pendaftaran</p>
                      <p className="text-slate-500 text-xs">S/D {comp.deadline}</p>
                    </div>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">Finalis & Juara</p>
                      <p className="text-slate-500 text-xs">Desember 2026</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <button 
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600"
              >
                <ChevronUp size={18} /> Ciutkan Tampilan
              </button>

              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition">
                  Website Resmi
                </button>
                <button className="flex-1 md:flex-none px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 transition">
                  Bergabung Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}