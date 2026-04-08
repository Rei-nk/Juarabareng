import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import CompetitionCard from '../components/Directory/CompetitionCard';
import { supabase } from '../api/supabase';
import { Search, Loader2 } from 'lucide-react';
import CompetitionDetailModal from '../components/Directory/CompetitionDetailModal';

export default function DirectoryPage({ onLogout }) {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [selectedCompForDetail, setSelectedCompForDetail] = useState(null);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCompetitions(data || []);
    } catch (error) {
      console.error("Gagal memuat kompetisi:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter dengan Optional Chaining (?.) untuk mencegah crash jika data null
  const filteredCompetitions = competitions.filter(comp => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (comp.title?.toLowerCase().includes(searchLower)) || 
                          (comp.organizer?.toLowerCase().includes(searchLower));
    
    const matchesCategory = selectedCategory === "Semua Kategori" || comp.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }); 

  const handleShowDetail = (comp) => {
    setSelectedCompForDetail(comp);
  };

  const handleCloseDetail = () => {
    setSelectedCompForDetail(null);
  };

  return (
    // Struktur flex-col untuk Mobile, flex-row untuk Desktop
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      <Sidebar onLogout={onLogout} activeTab="directory" />

      {/* Main Content dengan padding responsif & pb-24 untuk ruang navbar mobile */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-x-hidden pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header & Search Bar (Responsive) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6 md:mb-10">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Direktori Lomba</h1>
              <p className="text-sm md:text-base text-slate-500 font-medium">Katalog kompetisi resmi yang dikurasi oleh tim JuaraBareng.id.</p>
            </div>

            <div className="relative w-full md:w-80 shrink-0 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Cari lomba atau penyelenggara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm text-sm font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Baris Filter & Kategori (Responsif menjadi kolom di layar sangat kecil) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-sm font-semibold text-slate-600">
              Menampilkan <span className="text-blue-600 font-bold">{filteredCompetitions.length}</span> Kompetisi
            </div>
            
            <div className="w-full sm:w-auto relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
              >
                <option>Semua Kategori</option>
                <option>TECH / IT</option>
                <option>RISET AKADEMIK</option>
                <option>BUSINESS</option>
                <option>SOSIAL HUKUM</option>
              </select>
              {/* Custom panah drop-down sederhana */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Grid Lomba */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-slate-500 font-bold text-sm">Memuat direktori lomba...</p>
            </div>
          ) : filteredCompetitions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredCompetitions.map((comp) => (
                <CompetitionCard 
                  key={comp.id} 
                  comp={comp} 
                  onShowDetail={handleShowDetail}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={30} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Lomba tidak ditemukan</h3>
              <p className="text-slate-500 text-sm font-medium">Coba gunakan kata kunci lain atau ubah filter kategorimu.</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL JIKA ADA LOMBA YANG DIPILIH */}
      {selectedCompForDetail && (
        <CompetitionDetailModal 
          comp={selectedCompForDetail} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
}