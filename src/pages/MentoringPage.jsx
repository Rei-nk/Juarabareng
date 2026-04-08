import React, { useState, useEffect } from 'react';
import { Star, Clock, BookOpen, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { supabase } from '../api/supabase';

export default function MentoringPage() {
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_mentor', true);

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error('Gagal mengambil data mentor:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async (mentorId) => {
    try {
      setIsBooking(mentorId);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        alert("Kamu harus login untuk melakukan booking!");
        return;
      }

      if (user.id === mentorId) {
        alert("Kamu tidak bisa booking dirimu sendiri 😅");
        return;
      }

      const { error } = await supabase
        .from('mentoring_requests')
        .insert([
          {
            mentee_id: user.id,
            mentor_id: mentorId,
            status: 'pending',
            message: 'Halo kak, saya ingin mengajukan sesi mentoring.'
          }
        ]);

      if (error) throw error;
      
      alert('Berhasil! Permintaan mentoring telah dikirim ke mentor terkait.');
    } catch (error) {
      console.error('Error booking:', error.message);
      alert('Gagal melakukan booking. Pastikan database sudah di-update.');
    } finally {
      setIsBooking(null);
    }
  };

  // Filter pencarian (Nama & Skill)
  const filteredMentors = mentors.filter((mentor) => {
    const name = (mentor.full_name || mentor.name || '').toLowerCase();
    const skills = (mentor.mentor_specialties || []).join(' ').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return name.includes(query) || skills.includes(query);
  });

  return (
    // Struktur flex-col untuk Mobile, flex-row untuk Desktop
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      

      {/* Main Content dengan padding responsif & pb-24 untuk ruang navbar mobile */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-x-hidden pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          
          {/* Header Section (Responsif) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Mentoring Hub</h1>
              <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl">
                Temukan mentor ahli yang siap membimbing timmu meraih juara. Booking sesi eksklusif sekarang!
              </p>
            </div>
            
            <div className="w-full lg:w-auto shrink-0 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mentor atau skill..." 
                className="w-full lg:w-72 pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-slate-700 shadow-sm"
              />
            </div>
          </div>

          {/* List Mentor */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-slate-500 font-bold text-sm">Mencari Mentor Terbaik...</p>
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={30} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {searchQuery ? 'Pencarian Kosong' : 'Belum Ada Mentor'}
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-2">
                {searchQuery ? 'Tidak ada mentor yang cocok dengan kata kunci pencarianmu.' : 'Belum ada mentor yang tersedia saat ini.'}
              </p>
              {!searchQuery && (
                <p className="text-xs text-slate-400">Coba ubah status akunmu menjadi mentor di database untuk testing!</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredMentors.map((mentor) => {
                const mentorName = mentor.full_name || mentor.name || 'Mentor Anonim';
                const initial = mentorName ? mentorName.charAt(0).toUpperCase() : 'M';
                
                return (
                  <div key={mentor.id} className="bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col h-full">
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-inner overflow-hidden shrink-0">
                          {mentor.avatar_url || mentor.photo_url ? (
                            <img 
                              src={mentor.avatar_url || mentor.photo_url} 
                              alt={mentorName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initial
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-base md:text-lg text-slate-900 flex items-center gap-1">
                            <span className="line-clamp-1">{mentorName}</span>
                            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          </h3>
                          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider line-clamp-1 mt-0.5">
                            {mentor.university || mentor.univ || 'Universitas Dirahasiakan'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg flex items-center gap-1 text-xs md:text-sm font-bold border border-amber-100 shrink-0">
                        <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-amber-500" />
                        {mentor.mentor_rating || '5.0'}
                      </div>
                    </div>

                    {/* Spesialisasi */}
                    <div className="mb-4 space-y-2">
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Spesialisasi</p>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {mentor.mentor_specialties && mentor.mentor_specialties.length > 0 ? (
                          mentor.mentor_specialties.map((skill, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 px-2.5 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold border border-blue-100">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="bg-slate-50 text-slate-500 px-2.5 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold border border-slate-200">
                            Generalist
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Prestasi Tersorot</p>
                        <p className="text-xs md:text-sm font-medium text-slate-700 flex items-start gap-2">
                          <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{mentor.mentor_achievements || 'Mentor Tersertifikasi JuaraBareng'}</span>
                        </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-slate-500">
                        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Tersedia
                      </div>
                      <button 
                        onClick={() => handleBooking(mentor.id)}
                        disabled={isBooking === mentor.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-md shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isBooking === mentor.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Booking Jadwal'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}