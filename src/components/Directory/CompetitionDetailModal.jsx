import React from 'react';
import { X, Calendar, Trophy, Users, GraduationCap, MapPin, Tag, CircleDollarSign } from 'lucide-react';

export default function CompetitionDetailModal({ comp, onClose }) {
  if (!comp) return null; // Jangan render apa-apa jika tidak ada lomba yang dipilih

  // Contoh data detail yang lebih lengkap (nantinya diambil dari Supabase)
  // Anda bisa memperluas skema tabel 'competitions' di Supabase untuk menyimpan data ini
  const details = {
  description: comp.description || 'Deskripsi belum tersedia.',
  taskDeadlines: comp.task_deadlines || [],
  location: comp.location || 'Info lokasi belum tersedia.',
  // ... dan seterusnya untuk kolom lainnya
};

  const DetailSection = ({ icon: Icon, title, content }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={18} />
        <h4 className="font-bold text-slate-900">{title}</h4>
      </div>
      <div className="text-sm text-slate-600 pl-7">{content}</div>
    </div>
  );

  return (
    // Overlay Modal (Background Gelap Berkurang)
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      {/* Konten Modal */}
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-xl p-10 relative overflow-y-auto max-h-[90vh] animate-in slide-in-from-bottom-4" onClick={(e) => e.stopPropagation()}> {/* StopPropagation biar klik di dalam ga nutup modal */}
        {/* Tombol Tutup */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-rose-600 transition">
          <X size={24} />
        </button>

        {/* Header Modal */}
        <div className="mb-10">
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 mb-2 inline-block">
            {comp.category}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight mb-2">
            {comp.title}
          </h2>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <GraduationCap size={16} /> Oleh {comp.organizer}
          </p>
        </div>

        {/* Konten Detail - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          
          <DetailSection icon={Trophy} title="Deskripsi Lengkap" content={details.description} />
          
          <DetailSection 
            icon={CircleDollarSign} 
            title="Hadiah (Prize)" 
            content={
              <p className="font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl inline-block">{details.prize}</p>
            } 
          />

          {/* Timeline / Deadlines */}
          <DetailSection 
            icon={Calendar} 
            title="Deadline & Jadwal Lengkap" 
            content={
              <ul className="list-disc list-inside space-y-1">
                {details.taskDeadlines.map((item, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{item.task}</span>: {item.date}
                  </li>
                ))}
                <li>{details.schedule}</li>
              </ul>
            } 
          />

          <DetailSection icon={MapPin} title="Lokasi & Jadwal" content={details.location} />
          
          <DetailSection icon={Tag} title="Kategori Inti" content={details.kategoriLengkap.join(', ')} />

          <DetailSection icon={Users} title="Sponsor" content={details.sponsors.join(', ')} />
          
          <DetailSection icon={Info} title="Pengumuman & Lain-lain" content={details.announcement} />

        </div>

        {/* Footer Modal */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition">
            Tutup
          </button>
          <a href="#" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition">
            Buka Halaman Resmi
          </a>
        </div>

      </div>
    </div>
  );
}