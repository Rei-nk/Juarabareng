import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, MoreVertical, Phone, Video, 
  Smile, Paperclip, CheckCheck, MessageSquare,
  User, Loader2
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
  
  const messagesEndRef = useRef(null);

  // 1. Inisialisasi User
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

  // 2. Ambil Daftar Koneksi (Accepted) & Last Message
  const fetchConnections = async (userId) => {
    try {
      setIsLoading(true);
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
            name: p.full_name || 'User',
            role: p.role || 'Member',
            avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${p.full_name || 'U'}&background=random`,
            lastMessage: lastMsgData ? lastMsgData.pesan : 'Mulai obrolan...',
            time: lastMsgData ? lastMsgData.created_at : '',
            isOnline: true 
          };
        })
      );

      setConnections(formattedConnections.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
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

      if (!error) setMessages(data || []);
    };

    fetchMessages();
  }, [activeChat, currentUser]);

  // 4. REALTIME: Pesan Masuk & Koneksi Baru
  useEffect(() => {
    if (!currentUser) return;

    const chatChannel = supabase
      .channel('chat_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pesan_chat' }, (payload) => {
        const newMsg = payload.new;
        
        // Update pesan di layar jika sedang membuka chat ybs
        if (activeChat && (
          (newMsg.sender_id === activeChat.id && newMsg.receiver_id === currentUser.id) ||
          (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeChat.id)
        )) {
          setMessages((prev) => [...prev, newMsg]);
        }

        // Update list sebelah kiri (Last Message & Sorting)
        setConnections(prev => prev.map(conn => {
          if (conn.id === newMsg.sender_id || conn.id === newMsg.receiver_id) {
            return { ...conn, lastMessage: newMsg.pesan, time: newMsg.created_at };
          }
          return conn;
        }).sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)));
      })
      .subscribe();

    const connectionChannel = supabase
      .channel('conn_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'koneksi' }, (payload) => {
        if (payload.new.status === 'accepted') fetchConnections(currentUser.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(connectionChannel);
    };
  }, [currentUser, activeChat]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Kirim Pesan
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !currentUser) return;

    const text = messageInput;
    setMessageInput('');

    const { error } = await supabase
      .from('pesan_chat')
      .insert([{ sender_id: currentUser.id, receiver_id: activeChat.id, pesan: text }]);

    if (error) alert('Gagal mengirim pesan');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col p-4 md:p-6 h-screen">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Koneksi & Pesan</h1>
            <p className="text-slate-500 font-medium">Chat real-time dengan jaringan kolaborasimu.</p>
          </div>
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200">
            {connections.length} Koneksi
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex overflow-hidden mb-4">
          
          {/* SIDERBAR CHAT (KIRI) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" placeholder="Cari teman..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : connections.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                <button
                  key={user.id}
                  onClick={() => setActiveChat(user)}
                  className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all ${
                    activeChat?.id === user.id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-800 truncate text-sm">{user.name}</h3>
                      <span className="text-[10px] text-slate-400">{formatTime(user.time)}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AREA CHAT (KANAN) */}
          <div className="flex-1 flex flex-col bg-[#FDFDFF]">
            {activeChat ? (
              <>
                <div className="h-20 px-6 bg-white border-b border-slate-50 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={activeChat.avatar} className="w-11 h-11 rounded-full object-cover shadow-sm" alt="" />
                    <div>
                      <h2 className="font-bold text-slate-900 leading-none">{activeChat.name}</h2>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{activeChat.role}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl"><Phone size={20} /></button>
                    <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl"><MoreVertical size={20} /></button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm text-sm ${
                          isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                          {msg.pesan}
                          <div className={`text-[10px] mt-2 font-medium ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-5 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                    <button type="button" className="p-2 text-slate-400 hover:text-indigo-500"><Paperclip size={20} /></button>
                    <input 
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
                      placeholder="Ketik pesan sesuatu..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <button 
                      type="submit" disabled={!messageInput.trim()}
                      className="p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-md"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Ruang Kolaborasi</h3>
                <p className="text-slate-500 max-w-xs mt-2">Pilih salah satu koneksi untuk mulai berdiskusi secara real-time.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}