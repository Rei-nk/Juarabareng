import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import CompetitionCard from '../components/Directory/CompetitionCard';
import { supabase } from '../api/supabase';
import { Search } from 'lucide-react';
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
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setCompetitions(data);
    setLoading(false);
  };

  // Perbaikan 1: Menutup kurung kurawal & kurung biasa pada fungsi filter dengan benar
  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          comp.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua Kategori" || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }); 

  // Perbaikan 2: Memastikan fungsi handler berada di luar blok render
  const handleShowDetail = (comp) => {
    setSelectedCompForDetail(comp); // Set lomba yang dipilih
  };

  const handleCloseDetail = () => {
    setSelectedCompForDetail(null); // Reset
  };

  // Perbaikan 3: Menggabungkan UI menjadi satu blok return yang utuh
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* activeTab="directory" supaya menu di sidebar nyala biru */}
      <Sidebar onLogout={onLogout} activeTab="directory" />

      <main className="flex-1 p-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header & Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Direktori Lomba</h1>
              <p className="text-slate-500">Katalog kompetisi resmi yang dikurasi oleh tim JuaraBareng.id.</p>
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Cari lomba..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Baris Filter & Kategori */}
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-100">
            <div className="text-sm font-semibold text-slate-600">
              Menampilkan <span className="text-blue-600">{filteredCompetitions.length}</span> Kompetisi
            </div>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold uppercase text-slate-700 outline-none cursor-pointer"
            >
              <option>Semua Kategori</option>
              <option>TECH / IT</option>
              <option>RISET AKADEMIK</option>
              <option>BUSINESS</option>
              <option>SOSIAL HUKUM</option>
            </select>
          </div>

          {/* Grid Lomba */}
          {loading ? (
            <div className="text-center py-20 text-slate-400">Memuat data...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitions.map((comp) => (
                <CompetitionCard 
                  key={comp.id} 
                  comp={comp} 
                  onShowDetail={handleShowDetail} // Props dioper dengan benar
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- RENDER MODAL JIKA ADA LOMBA YANG DIPILIH --- */}
      {selectedCompForDetail && (
        <CompetitionDetailModal 
          comp={selectedCompForDetail} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
}