import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, MoreVertical, Phone, Video, 
  Smile, Paperclip, CheckCheck, MessageSquare,
  User, Loader2, AlertCircle
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
      }
    };
    fetchUser();
  }, []);

  // 2. Ambil Daftar Koneksi & Last Message
  const fetchConnections = async (userId) => {
    try {
      setIsLoading(true);
      setError(null);

      // Ambil koneksi yang statusnya 'accepted'
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

      // Ambil ID Teman (yang bukan ID saya)
      const friendIds = konData.map(k => k.user_id_1 === userId ? k.user_id_2 : k.user_id_1);

      // Ambil Profil Teman-teman tersebut
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .in('id', friendIds);

      if (profError) throw profError;

      // Ambil Last Message secara paralel
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
            role: p.role || 'Member',
            avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${p.full_name || 'U'}&background=random`,
            lastMessage: lastMsgData ? lastMsgData.pesan : 'Belum ada pesan',
            time: lastMsgData ? lastMsgData.created_at : '',
            isOnline: true 
          };
        })
      );

      // Urutkan: yang ada chat terbaru di paling atas
      setConnections(formattedConnections.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)));
    } catch (err) {
      console.error('Fetch Connections Error:', err.message);
      setError("Gagal memuat daftar teman. Pastikan tabel 'koneksi' dan 'profiles' tersedia.");
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
        
        // Update bubble chat jika room terbuka
        if (activeChat && (
          (newMsg.sender_id === activeChat.id && newMsg.receiver_id === currentUser.id) ||
          (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeChat.id)
        )) {
          setMessages((prev) => [...prev, newMsg]);
        }

        // Update preview di sidebar kiri
        setConnections(prev => prev.map(conn => {
          if (conn.id === newMsg.sender_id || conn.id === newMsg.receiver_id) {
            return { ...conn, lastMessage: newMsg.pesan, time: newMsg.created_at };
          }
          return conn;
        }).sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [currentUser, activeChat]);

  // Auto-scroll kebawah
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

    if (error) {
      console.error("Gagal kirim:", error.message);
      alert('Pesan gagal terkirim.');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col p-4 md:p-6 h-screen">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Koneksi & Pesan</h1>
            <p className="text-slate-500 font-medium mt-1">Bangun tim hebat melalui komunikasi intens.</p>
          </div>
          {!isLoading && !error && (
            <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 flex items-center gap-2">
              <User size={16} />
              {connections.length} Teman
            </div>
          )}
        </div>

        {/* Chat Interface Container */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex overflow-hidden mb-4">
          
          {/* SIDERBAR (KIRI) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-white">
            <div className="p-5 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari teman..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-10 gap-3 text-slate-400">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                  <p className="text-sm font-medium">Memuat koneksi...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-red-500 gap-2">
                  <AlertCircle size={24} />
                  <p className="text-xs font-semibold">{error}</p>
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center p-10 text-slate-400 text-sm italic">
                  Belum ada teman yang dikonfirmasi.
                </div>
              ) : (
                connections
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setActiveChat(user)}
                      className={`w-full flex items-center gap-4 p-4 rounded-[1.8rem] transition-all duration-200 ${
                        activeChat?.id === user.id 
                          ? 'bg-indigo-50 border-indigo-100 shadow-sm ring-1 ring-indigo-100' 
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt={user.name} />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-slate-800 truncate text-sm">{user.name}</h3>
                          <span className="text-[10px] text-slate-400 font-medium">{formatTime(user.time)}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{user.lastMessage}</p>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* CHAT WINDOW (KANAN) */}
          <div className="flex-1 flex flex-col bg-[#FDFDFF] relative">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="h-20 px-6 bg-white border-b border-slate-50 flex justify-between items-center z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={activeChat.avatar} className="w-11 h-11 rounded-full object-cover shadow-sm border border-slate-100" alt="" />
                    <div>
                      <h2 className="font-bold text-slate-900 leading-none">{activeChat.name}</h2>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 inline-block">{activeChat.role}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"><Phone size={20} /></button>
                    <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"><Video size={20} /></button>
                    <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"><MoreVertical size={20} /></button>
                  </div>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                      <p className="text-sm font-medium bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm"> 👋 Sapa teman barumu untuk memulai kolaborasi!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUser?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            isMe 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                          }`}>
                            {msg.pesan}
                            <div className={`text-[10px] mt-2 font-bold flex items-center gap-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {formatTime(msg.created_at)}
                              {isMe && <CheckCheck size={14} />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-5 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                    <button type="button" className="p-2.5 text-slate-400 hover:text-indigo-500 transition-colors"><Paperclip size={20} /></button>
                    <input 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 outline-none text-slate-700"
                      placeholder="Tulis ide hebatmu..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <button type="button" className="p-2 text-slate-400 hover:text-amber-500 transition-colors"><Smile size={20} /></button>
                    <button 
                      type="submit" 
                      disabled={!messageInput.trim()}
                      className="p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50 disabled:bg-slate-300 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border-4 border-white">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Ruang Kolaborasi</h3>
                <p className="text-slate-500 max-w-xs mt-3 font-medium leading-relaxed">
                  Pilih salah satu koneksi dari daftar teman di samping untuk mulai berdiskusi dan membangun project bersama.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}