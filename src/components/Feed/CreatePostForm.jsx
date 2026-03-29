import React, { useState, useRef } from 'react'; // Tambah useRef
import { LayoutGrid, Plus, Hash, UserPlus, X, Send } from 'lucide-react';
import { supabase } from '../../api/supabase';

export default function CreatePostForm({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  // --- STATE MEDIA ---
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // --- STATE TAGS ---
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDicari, setSelectedDicari] = useState([]);

  const tagOptions = ['Project', 'Lomba', 'Magang', 'Beasiswa', 'Workshop'];
  const dicariOptions = ['Developer', 'Designer', 'Writer', 'Hacker', 'Hipster'];

  const toggleSelection = (item, state, setState) => {
    if (state.includes(item)) {
      setState(state.filter(i => i !== item));
    } else {
      setState([...state, item]);
    }
  };

  // Fungsi Pilih Gambar
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Fungsi Upload ke Storage
  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-media') // Pastikan nama bucket di Supabase sama
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handlePosting = async () => {
    if (!content.trim() && !imageFile) return;
    setIsPosting(true);

    try {
      let uploadedImageUrl = null;

      // 1. Upload gambar jika ada
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
      }

      // 2. Insert ke tabel posts
      const { error } = await supabase
        .from('posts')
        .insert([{ 
          content: content,
          author_name: 'Rei', 
          author_university: 'INFORMATIKA',
          author_avatar_letter: 'R',
          tags: selectedTags, 
          dicari_tags: selectedDicari,
          image_url: uploadedImageUrl // Simpan URL gambar
        }])
        .select();

      if (error) throw error;

      // 3. Reset Form
      setContent('');
      setSelectedTags([]);
      setSelectedDicari([]);
      setImageFile(null);
      setImagePreview(null);
      setShowTagEditor(false);
      
      if (onPostCreated) onPostCreated(); 
    } catch (error) {
      console.error('EROR NYATA:', error.message);
      alert('Gagal posting: ' + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center font-bold text-xl text-white flex-shrink-0">R</div>
        <div className="flex-1">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Sedang cari tim? Atau mau share info lomba? Ketik di sini..." 
            className="w-full bg-slate-50 rounded-2xl p-4 text-slate-700 placeholder:text-slate-400 text-sm min-h-28 focus:ring-2 focus:ring-blue-100 outline-none resize-none border border-slate-100"
          />

          {/* Preview Gambar */}
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img src={imagePreview} alt="preview" className="max-h-52 rounded-2xl border border-slate-200 object-cover" />
              <button 
                onClick={() => {setImageFile(null); setImagePreview(null)}}
                className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 hover:bg-red-500 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tag Editor Section */}
      {showTagEditor && (
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pilih Tags</span>
            <button onClick={() => setShowTagEditor(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleSelection(tag, selectedTags, setSelectedTags)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    selectedTags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >#{tag}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold text-slate-400 w-full uppercase">Mencari:</span>
              {dicariOptions.map(role => (
                <button
                  key={role}
                  onClick={() => toggleSelection(role, selectedDicari, setSelectedDicari)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                    selectedDicari.includes(role) ? 'bg-amber-500 text-white' : 'bg-white text-amber-600 border border-amber-200'
                  }`}
                >{role}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
        <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
          {/* Input File Tersembunyi */}
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
          
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 hover:text-blue-600 p-2 -m-2 rounded-lg transition"
          >
            <LayoutGrid className="w-5 h-5 text-blue-500" /> Media
          </button>
          
          <button 
            onClick={() => setShowTagEditor(!showTagEditor)}
            className={`flex items-center gap-2 p-2 -m-2 rounded-lg transition ${showTagEditor ? 'text-amber-600' : 'hover:text-amber-600'}`}
          >
            <Plus className="w-5 h-5 text-amber-500" /> Add Tags
          </button>
        </div>

        <button 
          onClick={handlePosting}
          disabled={isPosting || (!content.trim() && !imageFile)}
          className="bg-blue-600 text-white font-bold px-7 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50"
        >
          {isPosting ? 'Uploading...' : 'Posting'}
        </button>
      </div>
    </div>
  );
}