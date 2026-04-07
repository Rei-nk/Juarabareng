import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Loader2, User, Users } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { supabase } from '../api/supabase';

export default function NotificationsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Inisialisasi User & Ambil Data Awal
  useEffect(() => {
    let isMounted = true; // Mencegah state update jika komponen keburu di-unmount

    const initData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user && isMounted) {
          setCurrentUser(user);
          await fetchConnectionRequests(user.id);
        }
      } catch (error) {
        console.error('Gagal mengambil sesi user:', error.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    initData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fungsi Ambil Data dari Supabase
  const fetchConnectionRequests = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('koneksi')
        // Pastikan relasi database sudah dikonfigurasi (foreign key dari user_id_1 ke tabel profiles)
        .select('*, pengirim:user_id_1 ( id, full_name )') 
        .eq('user_id_2', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnectionRequests(data || []);
    } catch (error) {
      console.error('Error mengambil koneksi:', error.message);
    }
  };

  // 3. SENSOR REALTIME
  useEffect(() => {
    if (!currentUser) return;

    const koneksiChannel = supabase
      .channel('realtime_koneksi')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'koneksi',
        // Opsional: Filter di level Supabase (hanya bekerja jika disetting di database)
        // filter: `user_id_2=eq.${currentUser.id}` 
      }, (payload) => {
        // Cek jika baris baru ditujukan untuk user ini dan statusnya pending
        if (payload.new.user_id_2 === currentUser.id && payload.new.status === 'pending') {
          // Fetch ulang untuk mendapatkan data join relasi 'pengirim'
          fetchConnectionRequests(currentUser.id);
        }
      }).subscribe();

    // Bersihkan listener saat user pindah halaman / komponen unmount
    return () => {
      supabase.removeChannel(koneksiChannel);
    };
  }, [currentUser]);

  // 4. Handle Aksi (Terima / Tolak)
  const handleConnectionAction = async (connectionId, newStatus) => {
    // Optimistic UI update: Sembunyikan dari UI terlebih dahulu agar terasa cepat
    const previousRequests = [...connectionRequests];
    setConnectionRequests(prev => prev.filter(req => req.id !== connectionId));

    try {
      const { error } = await supabase
        .from('koneksi')
        .update({ status: newStatus })
        .eq('id', connectionId);

      if (error) throw error;
      
    } catch (error) {
      // Rollback jika terjadi error di database
      console.error(`Gagal memproses status ${newStatus}:`, error.message);
      setConnectionRequests(previousRequests);
      alert('Gagal memproses permintaan. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
              <Bell className="text-blue-600" size={32} />
              Pusat Notifikasi
            </h1>
            <p className="text-slate-500 font-medium">
              Kelola permintaan koneksi baru Anda di sini.
            </p>
          </div>

          {isLoading ? (
             <div className="flex items-center justify-center py-10">
               <Loader2 className="animate-spin text-blue-600" size={32} />
             </div>
          ) : (
            <div className="space-y-6">
              
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <Users size={20} className="text-blue-500" /> 
                  Permintaan Koneksi ({connectionRequests.length})
                </h2>
                
                {connectionRequests.length === 0 ? (
                   <p className="text-slate-400 text-center py-6 font-medium">Belum ada permintaan koneksi baru.</p>
                ) : (
                  <div className="space-y-4">
                    {connectionRequests.map(req => (
                      <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-base">
                              {req.pengirim?.full_name || 'Seseorang'} ingin terhubung!
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">
                              Terima untuk mulai berdiskusi dan memperluas jaringan.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
                          <button 
                            onClick={() => handleConnectionAction(req.id, 'rejected')} 
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-bold flex items-center gap-2 text-sm"
                            aria-label="Abaikan koneksi"
                          >
                            <XCircle size={18} /> Abaikan
                          </button>
                          <button 
                            onClick={() => handleConnectionAction(req.id, 'accepted')} 
                            className="px-4 py-2 bg-slate-800 hover:bg-black text-white rounded-xl transition-colors font-bold flex items-center gap-2 text-sm shadow-md"
                            aria-label="Terima koneksi"
                          >
                            <CheckCircle size={18} /> Terima
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}