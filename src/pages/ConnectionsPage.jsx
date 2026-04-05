import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, MoreVertical, Phone, Video, 
  Smile, Paperclip, CheckCheck, MessageSquare
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
// Pastikan path import supabase di bawah ini sesuai dengan struktur folder kamu!
import { supabase } from '../api/supabase'; 

export default function ConnectionsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);

  // 1. Ambil data User yang sedang Login
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        fetchConnections(user.id);
      }
    };
    fetchUser();
  }, []);

  // 2. Ambil daftar teman (Koneksi yang 'accepted') & Pesan Terakhir
  const fetchConnections = async (userId) => {
    try {
      const { data: konData, error: konError } = await supabase
        .from('koneksi')
        .select('*')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .eq('status', 'accepted');

      if (konError) throw konError;

      const friendIds = konData.map(k => k.user_id_1 === userId ? k.user_id_2 : k.user_id_1);

      if (friendIds.length === 0) {
        setConnections([]);
        return;
      }

      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', friendIds);

      if (profError) throw profError;

      // Ambil pesan terakhir untuk setiap teman secara dinamis
      const formattedConnections = await Promise.all(
        profiles.map(async (p) => {
          const { data: lastMsgData } = await supabase
            .from('pesan_chat')
            .select('pesan, created_at')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${p.id}),and(sender_id.eq.${p.id},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(); // maybeSingle mencegah error jika tidak ada pesan sama sekali

          return {
            id: p.id,
            name: p.full_name || 'User',
            role: p.role || 'Member',
            avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${p.full_name || 'U'}&background=random`,
            lastMessage: lastMsgData ? lastMsgData.pesan : 'Mulai obrolan...',
            time: lastMsgData ? lastMsgData.created_at : '',
            unread: 0, 
            isOnline: true 
          };
        })
      );

      // Urutkan kontak berdasarkan waktu chat terakhir (yang terbaru di atas)
      formattedConnections.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));

      setConnections(formattedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  // 3. Ambil Riwayat Chat saat memilih kontak
  useEffect(() => {
    if (!activeChat || !currentUser) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('pesan_chat')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();
  }, [activeChat, currentUser]);

  // 4. Sensor REALTIME untuk pesan baru dari lawan bicara
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('chat_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'pesan_chat' 
      }, (payload) => {
        const newMsg = payload.new;
        
        // Hanya tambahkan pesan dari Realtime JIKA pengirimnya BUKAN kita sendiri.
        // Karena pesan kita sendiri sudah ditambahkan secara instan via Optimistic UI di fungsi handleSendMessage.
        if (newMsg.sender_id !== currentUser.id && activeChat && (
          (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeChat.id) ||
          (newMsg.sender_id === activeChat.id && newMsg.receiver_id === currentUser.id)
        )) {
          setMessages((prev) => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentUser, activeChat]);

  // Auto-scroll ke pesan terbawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Fungsi Kirim Pesan dengan Optimistic UI
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !currentUser) return;

    const textToSend = messageInput;
    setMessageInput(''); // Kosongkan input seketika

    // --- OPTIMISTIC UI: Langsung render ke layar sebelum nunggu database ---
    const tempMessage = {
      id: crypto.randomUUID(), // ID sementara agar React key tidak error
      sender_id: currentUser.id,
      receiver_id: activeChat.id,
      pesan: textToSend,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMessage]);
    // ------------------------------------------------------------------------

    // Proses masuk ke Supabase berjalan di background
    const { error } = await supabase
      .from('pesan_chat')
      .insert([
        {
          sender_id: currentUser.id,
          receiver_id: activeChat.id,
          pesan: textToSend,
          is_read: false
        }
      ]);

    if (error) {
      console.error('Gagal mengirim pesan:', error);
      // Opsional: Tarik kembali pesan sementara jika ternyata gagal koneksi
      setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
      alert('Gagal mengirim pesan. Periksa koneksi internetmu.');
    } else {
      // Perbarui 'Last Message' di sidebar sebelah kiri secara lokal
      setConnections(prev => prev.map(conn => 
        conn.id === activeChat.id 
          ? { ...conn, lastMessage: textToSend, time: new Date().toISOString() } 
          : conn
      ).sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)));
    }
  };

  // Filter pencarian teman
  const filteredConnections = connections.filter(conn => 
    conn.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk memformat jam (contoh: 14:30)
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col p-4 md:p-6 h-screen">
        {/* Header Halaman */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900">Koneksi & Pesan</h1>
          <p className="text-slate-500 font-medium mt-1">Kelola jaringan dan diskusikan ide dengan rekan setim.</p>
        </div>

        {/* Layout Chat */}
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex overflow-hidden">
          
          {/* KIRI: DAFTAR KONTAK */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-white">
            <div className="p-5 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari koneksi..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {filteredConnections.length === 0 ? (
                 <p className="text-center text-sm text-slate-400 mt-10">
                   {searchTerm ? 'Kontak tidak ditemukan.' : 'Belum ada koneksi. Mulai cari teman di halaman Match!'}
                 </p>
              ) : (
                filteredConnections.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setActiveChat(user)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left ${
                      activeChat?.id === user.id ? 'bg-blue-50 border-blue-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="font-bold text-slate-800 truncate">{user.name}</h3>
                        <span className="text-[10px] text-slate-400 font-medium">{formatTime(user.time)}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{user.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* KANAN: RUANG OBROLAN */}
          <div className="flex-1 flex flex-col bg-[#F8FAFC] relative">
            {activeChat ? (
              <>
                {/* Header Obrolan */}
                <div className="h-20 px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={activeChat.avatar} alt={activeChat.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                    <div>
                      <h2 className="font-black text-slate-800 text-lg">{activeChat.name}</h2>
                      <p className="text-xs font-bold text-blue-600">{activeChat.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Phone size={20} /></button>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Video size={20} /></button>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><MoreVertical size={20} /></button>
                  </div>
                </div>

                {/* Area Pesan */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm mt-10">
                      Belum ada pesan. Sapa {activeChat.name} sekarang! 👋
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUser?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                            <div 
                              className={`p-4 rounded-2xl ${
                                isMe 
                                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-600/10' 
                                  : 'bg-white text-slate-700 rounded-tl-sm shadow-sm border border-slate-100'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.pesan}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span>{formatTime(msg.created_at)}</span>
                              {isMe && <CheckCheck size={14} className={msg.is_read ? "text-blue-500" : "text-slate-300"} />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Pesan */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                    <button type="button" className="p-3 text-slate-400 hover:text-blue-600 transition-colors shrink-0">
                      <Paperclip size={20} />
                    </button>
                    <textarea 
                      rows="1"
                      placeholder="Tulis pesan..." 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      className="flex-1 max-h-32 min-h-[44px] bg-transparent outline-none resize-none py-3 text-sm text-slate-700"
                    />
                    <button type="button" className="p-3 text-slate-400 hover:text-yellow-500 transition-colors shrink-0">
                      <Smile size={20} />
                    </button>
                    <button 
                      type="submit" 
                      disabled={!messageInput.trim()}
                      className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl shadow-md transition-all shrink-0"
                    >
                      <Send size={18} className="ml-0.5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* State Saat Belum Memilih Chat */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Mulai Percakapan</h3>
                <p className="text-slate-500 font-medium max-w-sm">Pilih kontak dari daftar di sebelah kiri untuk mulai mendiskusikan ide dan membangun tim juara!</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}