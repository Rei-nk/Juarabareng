import React, { useState, useEffect } from 'react';
import { Star, Clock, BookOpen, ShieldCheck, Search, Loader2 } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { supabase } from '../api/supabase';

export default function MentoringPage() {
  const [mentors, setMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(null); // Menyimpan ID mentor yang sedang di-booking

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      // Mengambil data user yang status is_mentor-nya TRUE
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Kamu harus login untuk melakukan booking!");
        return;
      }

      if (user.id === mentorId) {
        alert("Kamu tidak bisa booking dirimu sendiri 😅");
        return;
      }

      // Masukkan data ke tabel mentoring_requests
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

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-black text-slate-900 mb-2">Mentoring Hub</h1>
              <p className="text-slate-500 font-medium max-w-xl">
                Temukan mentor ahli yang siap membimbing timmu meraih juara. Booking sesi eksklusif sekarang!
              </p>
            </div>
            <div className="relative z-10 flex gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 py-2 w-full md:w-64">
                <Search className="text-slate-400 w-5 h-5 mr-2" />
                <input 
                  type="text" 
                  placeholder="Cari mentor / skill..." 
                  className="bg-transparent border-none outline-none text-sm w-full font-medium"
                />
              </div>
            </div>
          </div>

          {/* List Mentor */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-slate-500 font-bold animate-pulse">Mencari Mentor Terbaik...</p>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100">
              <p className="text-slate-500 font-bold mb-2">Belum ada mentor yang tersedia saat ini.</p>
              <p className="text-sm text-slate-400">Coba ubah status akunmu menjadi mentor di database untuk testing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => {
                // Siapkan fallback nama agar tidak error
                const mentorName = mentor.full_name || mentor.name || 'Mentor Anonim';
                
                return (
                  <div key={mentor.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col h-full">
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        
                        {/* FOTO PROFIL (PERBAIKAN DISINI) */}
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-inner overflow-hidden shrink-0">
                          {mentor.avatar_url || mentor.photo_url ? (
                            <img 
                              src={mentor.avatar_url || mentor.photo_url} 
                              alt={mentorName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // Fallback inisial jika tidak ada foto
                            mentorName.charAt(0).toUpperCase()
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-1">
                            {mentorName}
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                          </h3>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                            {mentor.university || mentor.univ || 'Universitas'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg flex items-center gap-1 text-sm font-bold border border-amber-100">
                        <Star className="w-4 h-4 fill-amber-500" />
                        {mentor.mentor_rating || '5.0'}
                      </div>
                    </div>

                    {/* Spesialisasi */}
                    <div className="mb-4 space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase">Spesialisasi</p>
                      <div className="flex flex-wrap gap-2">
                        {mentor.mentor_specialties && mentor.mentor_specialties.length > 0 ? (
                          mentor.mentor_specialties.map((skill, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">UI/UX Design</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Prestasi Tersorot</p>
                        <p className="text-sm font-medium text-slate-700 flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          {mentor.mentor_achievements || 'Juara 1 Gemastik UX Design 2023'}
                        </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Clock className="w-4 h-4" />
                        4 Sesi Tersedia
                      </div>
                      <button 
                        onClick={() => handleBooking(mentor.id)}
                        disabled={isBooking === mentor.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
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