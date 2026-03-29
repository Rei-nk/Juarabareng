import React, { useState, useEffect } from 'react';
import { Search, FileText, Trophy, Users, BookOpen, Loader2, Plus, X, UploadCloud } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topheader from '../components/Topheader';
import { supabase } from '../api/supabase';

export default function BankIdePage() {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- State untuk Modal Upload ---
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Teknologi / AI',
    summary: '',
    achievements: '',
    teamMembers: ''
  });

  const categories = [
    "Teknologi / AI", 
    "Sosial & Bisnis Komunitas", 
    "Lingkungan", 
    "Kesehatan Daerah",
    "Edukasi",
    "Agrikultur / Pangan"
  ];

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_ide')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Gagal mengambil data ide:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fungsi Upload Data & File ke Supabase ---
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Mohon lampirkan file PDF proposal Anda!");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Buat nama file unik & Upload ke Bucket 'proposals'
      const fileExt = pdfFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;

      // 2. Ambil URL Publik dari file PDF yang baru diunggah
      const { data: { publicUrl } } = supabase.storage
        .from('proposals')
        .getPublicUrl(fileName);

      // 3. Rapikan input anggota tim menjadi array
      const teamArray = uploadForm.teamMembers
        .split(',')
        .map(name => name.trim())
        .filter(name => name !== '');

      // 4. Simpan semua data teks + URL PDF ke tabel 'bank_ide'
      const { error: dbError } = await supabase
        .from('bank_ide')
        .insert([{
          title: uploadForm.title,
          category: uploadForm.category,
          summary: uploadForm.summary,
          achievements: uploadForm.achievements,
          team_members: teamArray,
          pdf_url: publicUrl
        }]);

      if (dbError) throw dbError;

      alert("Ide berhasil dipublikasikan ke Bank Ide!");
      
      // Reset form dan tutup modal
      setShowUploadModal(false);
      setPdfFile(null);
      setUploadForm({ title: '', category: 'Teknologi / AI', summary: '', achievements: '', teamMembers: '' });
      
      // Muat ulang daftar ide
      fetchIdeas();

    } catch (error) {
      console.error('Upload error:', error.message);
      alert("Gagal mengunggah ide: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredIdeas = ideas.filter(ide => 
    ide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ide.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topheader />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 relative">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header, Search & Tombol Tambah */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Bank Ide & Karya Juara</h1>
                <p className="text-slate-500 font-medium">
                  Gudang referensi proposal pemenang kompetisi nasional. Cari inspirasi dari riset teknologi, sosial, hingga kesehatan modern.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative w-full sm:w-72 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Cari ide..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium"
                  />
                </div>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shrink-0"
                >
                  <Plus size={20} />
                  <span>Bagikan Karya</span>
                </button>
              </div>
            </div>

            {/* List Data */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold">Memuat bank ide...</p>
              </div>
            ) : filteredIdeas.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-1">Belum ada ide ditemukan</h3>
                <p className="text-slate-500 mb-6">Jadilah yang pertama membagikan karya Anda di sini!</p>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Upload Ide Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredIdeas.map((ide) => (
                  <div key={ide.id} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow group">
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-3 py-1 bg-rose-50 text-rose-600 font-black text-[10px] rounded-lg border border-rose-100 uppercase tracking-wider">
                        PDF
                      </div>
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        {ide.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-blue-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                      {ide.title}
                    </h3>
                    <p className="text-slate-600 font-medium text-sm mb-6 leading-relaxed flex-1 line-clamp-3">
                      {ide.summary}
                    </p>

                    <div className="space-y-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-start gap-3 text-sm">
                        <Trophy className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                        <div>
                          <span className="block font-bold text-slate-700 mb-0.5">Pencapaian:</span>
                          <span className="text-slate-600 leading-tight">{ide.achievements}</span>
                        </div>
                      </div>
                      <div className="w-full h-px bg-slate-200"></div>
                      <div className="flex items-start gap-3 text-sm">
                        <Users className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <div>
                          <span className="block font-bold text-slate-700 mb-0.5">Tim Pengusul:</span>
                          <span className="text-slate-600 leading-tight">
                            {ide.team_members?.join(', ') || 'Anonim'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <a 
                      href={ide.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      <FileText size={18} className="group-hover/btn:scale-110 transition-transform" />
                      Baca Rincian Proposal
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- MODAL UPLOAD IDE --- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-slate-200">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur z-10">
              <h2 className="text-xl font-black text-slate-900">Bagikan Karya/Proposal</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                disabled={isUploading}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 md:p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Judul Karya/Proposal <span className="text-rose-500">*</span></label>
                  <input 
                    required type="text" 
                    placeholder="Contoh: Sistem Deteksi Penyakit Padi..."
                    value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Kategori <span className="text-rose-500">*</span></label>
                  <select 
                    value={uploadForm.category} onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Anggota Tim <span className="text-slate-400 font-normal">(Pisahkan dengan koma)</span></label>
                  <input 
                    required type="text" 
                    placeholder="Contoh: Budi, Siti, Ujang"
                    value={uploadForm.teamMembers} onChange={(e) => setUploadForm({...uploadForm, teamMembers: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Pencapaian <span className="text-slate-400 font-normal">(Opsional)</span></label>
                <input 
                  type="text" 
                  placeholder="Contoh: Juara 1 Gemastik 2024 / Top 10 PKM..."
                  value={uploadForm.achievements} onChange={(e) => setUploadForm({...uploadForm, achievements: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Garis Besar/Ringkasan Ide <span className="text-rose-500">*</span></label>
                <textarea 
                  required rows="3"
                  placeholder="Ceritakan secara singkat apa masalah yang diselesaikan dan solusi yang ditawarkan..."
                  value={uploadForm.summary} onChange={(e) => setUploadForm({...uploadForm, summary: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>

              {/* Input File PDF Khusus */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">File Proposal (Wajib PDF) <span className="text-rose-500">*</span></label>
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${pdfFile ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    {pdfFile ? (
                      <>
                        <FileText className="w-8 h-8 text-blue-500 mb-2" />
                        <p className="text-sm font-bold text-blue-700 line-clamp-1">{pdfFile.name}</p>
                        <p className="text-xs text-blue-500 mt-1">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm font-bold text-slate-600"><span className="text-blue-600">Klik untuk upload</span> atau drag & drop</p>
                        <p className="text-xs text-slate-500 mt-1">Hanya mendukung format .PDF</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={(e) => setPdfFile(e.target.files[0])} 
                    required
                  />
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  disabled={isUploading}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="px-8 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center min-w-[140px]"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publikasikan"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}