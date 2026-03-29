import React, { useState, useEffect } from 'react';
// Pastikan path import ini benar sesuai folder kamu
import Sidebar from '../components/layout/Sidebar'; 
import CreatePostForm from '../components/Feed/CreatePostForm';
import PostCard from '../components/Feed/PostCard';
import { supabase } from '../api/supabase';

export default function FeedPage({ onLogout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Definisikan fungsi DULU
  const fetchRealPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (e) {
      console.error('EROR NYATA saat mengambil data:', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Panggil fungsi di dalam useEffect SETELAH fungsinya dibuat
  useEffect(() => {
    fetchRealPosts();
  }, []); // Array kosong agar tidak looping

  return (
    // Struktur Flex agar Sidebar ada di kiri dan Konten di kanan
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar tetap di kiri */}
      <Sidebar onLogout={onLogout} activeTab="feed" />

      {/* Area Utama */}
      <main className="flex-1">
        {/* Opsional: Jika ada Topheader, taruh di sini */}
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            {/* Kirim fetchRealPosts ke Form agar setelah posting data otomatis refresh */}
            <CreatePostForm onPostCreated={fetchRealPosts} />
            
            <div className="mt-8 space-y-4">
              {loading ? (
                <div className="text-center py-10">Memuat postingan...</div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}