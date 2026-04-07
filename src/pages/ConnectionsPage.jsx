import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, ArrowLeft, MessageSquare, // Ditambahkan ArrowLeft
  Loader2
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { supabase } from '../api/supabase'; 

export default function ConnectionsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  // 1. Ambil Data User Login
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (user) {
          setCurrentUser(user);
          fetchConnections(user.id);
        }
      } catch (err) {
        console.error("Gagal inisialisasi user:", err.message);
        setError("Gagal memuat profil pengguna.");
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 2. Ambil Daftar Koneksi & Last Message
  const fetchConnections = async (userId) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: konData, error: konError } = await supabase
        .from('koneksi')
        .select('user_id_1, user_id_2, status')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .eq('status', 'accepted');

      if (konError) throw konError;

      if (!konData || konData.length === 0) {
        setConnections([]);
        return;
      }

      const friendIds = konData.map(k => k.user_id_1 === userId ? k.user_id_2 : k.user_id_1);

      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url') 
        .in('id', friendIds);

      if (profError) throw profError;

      const formattedConnections = await Promise.all(
        profiles.map(async (p) => {
          const { data: lastMsgData } = await supabase
            .from('pesan_chat')
            .select('pesan, created_at')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${p.id}),and(sender_id.eq.${p.id},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(); 

          return {
            id: p.id,
            name: p.full_name || 'User Tanpa Nama',
            role: 'Member', 
            avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${p.full_name || 'U'}&background=random`,
            lastMessage: lastMsgData ? lastMsgData.pesan : 'Belum ada pesan',
            time: lastMsgData ? lastMsgData.created_at : '',
          };
        })
      );

      setConnections(formattedConnections.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)));
    } catch (err) {
      console.error('Fetch Connections Error:', err.message);
      setError("Gagal memuat daftar teman. Pastikan database sudah dikonfigurasi.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Ambil Riwayat Chat
  useEffect(() => {
    if (!activeChat || !currentUser) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('pesan_chat')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeChat.id}),and(sender_id.eq.${activeChat.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) console.error("Gagal ambil pesan:", error.message);
      else setMessages(data || []);
    };

    fetchMessages();
  }, [activeChat, currentUser]);

  // 4. Sinkronisasi Realtime
  useEffect(() => {
    if (!currentUser) return;

    const chatChannel = supabase
      .channel('chat_realtime_main')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pesan_chat' }, (payload) => {
        const newMsg = payload.new;
        
        if (activeChat && (
          (newMsg.sender_id === activeChat.id && newMsg.receiver_id === currentUser.id) ||
          (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeChat.id)
        )) {
          setMessages((prev) => [...prev, newMsg]);
        }

        fetchConnections(currentUser.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [currentUser, activeChat]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !currentUser) return;

    const text = messageInput;
    setMessageInput('');

    const { error } = await supabase
      .from('pesan_chat')
      .insert([{ 
        sender_id: currentUser.id, 
        receiver_id: activeChat.id, 
        pesan: text 
      }]);

    if (error) alert('Pesan gagal terkirim.');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 md:p-6 h-full overflow-hidden">
        <div className="mb-6 hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Koneksi & Pesan</h1>
            <p className="text-slate-500 font-medium mt-1">Bangun tim hebat melalui komunikasi intens.</p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-200 shadow-sm flex overflow-hidden">
          
          {/* SIDERBAR DAFTAR TEMAN (KIRI) */}
          {/* Disembunyikan di Mobile jika sedang membuka chat */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex-col bg-white ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-5 border-b border-slate-50">
              {/* Header Mobile Only */}
              <div className="md:hidden mb-4">
                <h1 className="text-2xl font-black text-slate-900">Pesan</h1>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari teman..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : error ? (
                <div className="text-center p-6 text-red-500 text-xs font-bold">{error}</div>
              ) : connections.length === 0 ? (
                <div className="text-center p-10 text-slate-400 text-sm">Belum ada teman.</div>
              ) : (
                connections
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setActiveChat(user)}
                      className={`w-full flex items-center gap-4 p-4 rounded-[1.8rem] transition-all ${
                        activeChat?.id === user.id ? 'bg-indigo-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-slate-800 truncate text-sm">{user.name}</h3>
                          <span className="text-[10px] text-slate-400">{formatTime(user.time)}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.lastMessage}</p>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* CHAT WINDOW (KANAN) */}
          {/* Ditampilkan di Mobile HANYA jika ada activeChat */}
          <div className={`flex-1 flex-col bg-[#FDFDFF] relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
            {activeChat ? (
              <>
                <div className="h-20 px-4 md:px-6 bg-white border-b flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    {/* Tombol Back (Khusus Mobile) */}
                    <button 
                      className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full"
                      onClick={() => setActiveChat(null)}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    
                    <img src={activeChat.avatar} className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover" alt="" />
                    <div>
                      <h2 className="font-bold text-slate-900 leading-none">{activeChat.name}</h2>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 inline-block">Member</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/20">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm shadow-sm ${
                          isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                          {typeof msg.pesan === 'object' ? JSON.stringify(msg.pesan) : msg.pesan}
                          <div className={`text-[10px] mt-2 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 md:p-5 bg-white border-t flex items-center gap-2 md:gap-3">
                  <input 
                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Tulis pesan..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <button type="submit" className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare size={40} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Ruang Kolaborasi</h3>
                <p className="text-slate-500 mt-2 max-w-sm">Pilih teman dari daftar di sebelah kiri untuk mulai membangun project bersama.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}