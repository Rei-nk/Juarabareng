import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Tambahkan ini untuk navigasi
import { 
  Search, FileText, Trophy, Users, BookOpen, 
  Loader2, Plus, X, UploadCloud, ChevronLeft 
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { supabase } from '../api/supabase';

export default function BankIdePage() {
  const navigate = useNavigate(); // Hook untuk tombol back
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Mohon lampirkan file PDF proposal Anda!");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = pdfFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('proposals')
        .getPublicUrl(fileName);

      const teamArray = uploadForm.teamMembers
        .split(',')
        .map(name => name.trim())
        .filter(name => name !== '');

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

      alert("Ide berhasil dipublikasikan!");
      setShowUploadModal(false);
      setPdfFile(null);
      setUploadForm({ title: '', category: 'Teknologi / AI', summary: '', achievements: '', teamMembers: '' });
      fetchIdeas();
    } catch (error) {
      alert("Gagal: " + error.message);
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 relative">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section dengan Tombol Back Manual */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl flex items-start gap-4">
              {/* TOMBOL BACK MANUAL */}
              <button 
                onClick={() => navigate(-1)} 
                className="mt-1 p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>

              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Bank Ide & Karya Juara</h1>
                <p className="text-slate-500 font-medium">
                  Gudang referensi proposal pemenang kompetisi nasional. Cari inspirasi dari riset teknologi hingga sosial.
                </p>
              </div>
            </div>
            
            {/* Search & Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Cari ide..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm font-medium"
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

          {/* List Data Section */}
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredIdeas.map((ide) => (
                <div key={ide.id} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="px-3 py-1 bg-rose-50 text-rose-600 font-black text-[10px] rounded-lg border border-rose-100 uppercase tracking-wider">PDF</div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{ide.category}</span>
                  </div>
                  <h3 className="text-xl font-black text-blue-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">{ide.title}</h3>
                  <p className="text-slate-600 font-medium text-sm mb-6 leading-relaxed flex-1 line-clamp-3">{ide.summary}</p>
                  
                  <div className="space-y-3 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
                    <div className="flex items-start gap-3">
                      <Trophy className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                      <div><span className="block font-bold text-slate-700">Pencapaian:</span><span className="text-slate-600">{ide.achievements}</span></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="text-blue-500 shrink-0 mt-0.5" size={18} />
                      <div><span className="block font-bold text-slate-700">Tim:</span><span className="text-slate-600">{ide.team_members?.join(', ')}</span></div>
                    </div>
                  </div>

                  <a href={ide.pdf_url} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                    <FileText size={18} /> Baca Rincian Proposal
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Upload Ide */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur z-10">
              <h2 className="text-xl font-black text-slate-900">Bagikan Karya/Proposal</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-2 text-slate-400 hover:text-rose-500 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 md:p-8 space-y-6">
              {/* ... Isi form tetap sama ... */}
              <div className="space-y-4">
                 <input 
                  required type="text" placeholder="Judul Proposal"
                  value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <select 
                  value={uploadForm.category} onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                </select>
                <textarea 
                  required rows="3" placeholder="Ringkasan Ide"
                  value={uploadForm.summary} onChange={(e) => setUploadForm({...uploadForm, summary: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                ></textarea>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-600">{pdfFile ? pdfFile.name : "Klik untuk upload PDF Proposal"}</p>
                  </div>
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files[0])} />
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-6 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl">Batal</button>
                <button type="submit" disabled={isUploading} className="px-8 py-3 font-bold text-white bg-blue-600 rounded-xl shadow-lg">
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