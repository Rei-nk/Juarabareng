import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare, Clock, Send, CornerDownRight } from 'lucide-react'; // Pastikan lucide-react terpasall
import { supabase } from '../../api/supabase';

export default function PostCard({ post }) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [post.id]);

  const fetchLikes = async () => {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);
    if (!error) setLikesCount(count || 0);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    if (!error) setComments(data || []);
  };

  const handleLike = async () => {
    if (isLiked) return;
    const { error } = await supabase.from('likes').insert([{ post_id: post.id }]);
    if (!error) {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('comments')
      .insert([{ 
        post_id: post.id, 
        content: commentText,
        author_name: "User Testing",
        parent_id: replyTo ? replyTo.id : null 
      }])
      .select();

    if (!error) {
      setComments([...comments, data[0]]);
      setCommentText("");
      setReplyTo(null); 
    }
    setIsSubmitting(false);
  };

  const formatTimeAgo = (date) => "Baru saja";

  const mainComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-6 transition hover:border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center font-bold text-xl text-white uppercase">
          {post.author_avatar_letter || '?'}
        </div>
        <div>
          <p className="font-bold text-slate-950">{post.author_name || 'Anonim'}</p>
          <p className="text-sm text-slate-500">{post.author_university}</p>
        </div>
      </div>

      {/* Konten Teks */}
      <div className="mt-5 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* --- FITUR MEDIA: TAMPILAN GAMBAR --- */}
      {post.image_url && (
        <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full h-auto max-h-[450px] object-cover hover:scale-[1.01] transition-transform duration-500 cursor-pointer"
            onClick={() => window.open(post.image_url, '_blank')}
          />
        </div>
      )}

      {/* Tags Section */}
      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags?.map(tag => (
          <span key={tag} className="text-blue-600 font-medium text-sm">#{tag}</span>
        ))}
        {post.dicari_tags?.map(tag => (
          <span key={tag} className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-100 uppercase">
            DICARI: {tag}
          </span>
        ))}
      </div>

      {/* Buttons Interaksi */}
      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-6">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-2 text-sm font-semibold transition ${isLiked ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
        >
          <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-blue-600' : ''}`} /> 
          {likesCount}
        </button>
        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          <MessageSquare className="w-5 h-5" /> 
          {comments.length}
        </button>
      </div>

      {/* Komentar & Balasan */}
      {showComments && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-300">
          <div className="space-y-6 ml-2 border-l-2 border-slate-100 pl-4">
            {mainComments.length === 0 && <p className="text-xs text-slate-400 italic">Belum ada komentar.</p>}
            
            {mainComments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Komentar Utama */}
                <div className="relative group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900">{comment.author_name}</span>
                    <span className="text-[10px] text-slate-400">• {formatTimeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl rounded-tl-none inline-block">
                    {comment.content}
                  </p>
                  <div className="mt-1">
                    <button 
                      onClick={() => { setReplyTo(comment); setCommentText(`@${comment.author_name} `); }}
                      className="text-[11px] font-bold text-blue-600 hover:underline uppercase tracking-tight"
                    >
                      Balas
                    </button>
                  </div>
                </div>

                {/* List Balasan */}
                {getReplies(comment.id).map(reply => (
                  <div key={reply.id} className="flex gap-2 ml-4">
                    <CornerDownRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-xs text-slate-900">{reply.author_name}</span>
                        <span className="text-[9px] text-slate-400">{formatTimeAgo(reply.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-600 bg-blue-50/50 p-2 px-3 rounded-xl border border-blue-50/50 inline-block">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Input Box Sticky */}
          <div className="mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-inner">
            {replyTo && (
              <div className="flex justify-between items-center mb-2 px-2 py-1 bg-blue-100 rounded-lg animate-in slide-in-from-bottom-1">
                <span className="text-[10px] text-blue-700 font-bold uppercase">Membalas {replyTo.author_name}</span>
                <button onClick={() => { setReplyTo(null); setCommentText(""); }} className="text-blue-700 font-bold">×</button>
              </div>
            )}
            <div className="flex gap-2">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyTo ? "Tulis balasan..." : "Tulis komentar..."}
                className="flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              />
              <button 
                onClick={handleSendComment} 
                disabled={isSubmitting || !commentText.trim()} 
                className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition disabled:opacity-30"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}