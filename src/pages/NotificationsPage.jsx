import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { supabase } from '../api/supabase';

export default function NotificationsPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Ambil data request di mana user ini adalah mentornya, 
      // DAN ambil juga data profil si mentee (id, university, full_name)
      const { data, error } = await supabase
        .from('mentoring_requests')
        .select(`
          *,
          mentee:mentee_id ( id, university, full_name )
        `)
        .eq('mentor_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Gagal mengambil notifikasi:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from('mentoring_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      
      // Update UI lokal tanpa perlu fetch ulang
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
    } catch (error) {
      alert('Gagal memproses permintaan.');
    }
  };

  // Filter hanya yang statusnya pending untuk notifikasi aktif
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const historyRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
              <Bell className="text-blue-600" size={32} />
              Pusat Notifikasi
            </h1>
            <p className="text-slate-500 font-medium">
              Kelola permintaan mentoring dan aktivitas akun Anda di sini.
            </p>
          </div>

          {isLoading ? (
             <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : (
            <div className="space-y-6">
              {/* Seksi Permintaan Baru */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Permintaan Mentoring Baru ({pendingRequests.length})</h2>
                
                {pendingRequests.length === 0 ? (
                  <p className="text-slate-400 text-center py-6 font-medium">Tidak ada permintaan mentoring baru.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-blue-100 bg-blue-50/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                            <User className="text-slate-500" />
                          </div>
                          <div>
                            {/* Menampilkan nama pengguna yang request */}
                            <p className="font-bold text-slate-900">
                              {req.mentee?.full_name || 'Seseorang'} mengajukan sesi mentoring!
                            </p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                              {req.mentee?.university || 'Mahasiswa'}
                            </p>
                            {req.message && <p className="text-sm text-slate-600 mt-1 italic">"{req.message}"</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleAction(req.id, 'rejected')} className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors font-bold flex items-center gap-2 text-sm">
                            <XCircle size={18} /> Tolak
                          </button>
                          <button onClick={() => handleAction(req.id, 'accepted')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-bold flex items-center gap-2 text-sm shadow-md">
                            <CheckCircle size={18} /> Terima
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seksi Riwayat (Opsional agar tidak kosong) */}
              {historyRequests.length > 0 && (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 opacity-70">
                  <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Riwayat Notifikasi</h2>
                  <div className="space-y-3">
                    {historyRequests.map(req => (
                      <div key={req.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 text-sm">
                        {/* Menampilkan nama pengguna di riwayat */}
                        <span className="font-medium text-slate-600 truncate mr-4">
                          Permintaan dari <span className="font-bold">{req.mentee?.full_name || 'Pengguna Tidak Dikenal'}</span>
                        </span>
                        <span className={`shrink-0 font-bold uppercase text-[10px] px-2 py-1 rounded-md ${req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}