import React from 'react';
// Pastikan path import Sidebar ini sesuai dengan struktur folder Anda
import Sidebar from '../components/layout/Sidebar'; 

export default function ConnectionsPage({ onLogout }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Panggil Sidebar di sini. 
        Karena kita sudah pakai useLocation di Sidebar.jsx, 
        kita tidak perlu lagi menulis activeTab="connections"
      */}
      <Sidebar onLogout={onLogout} />

      {/* Area Konten Utama Halaman Koneksi */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Koneksi Saya</h1>
            <p className="text-slate-500 mt-2">
              Kelola daftar teman dan rekan kolaborasi Anda di sini.
            </p>
          </header>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Belum ada koneksi</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              Anda belum terhubung dengan siapa pun. Mulai cari rekan tim yang cocok di menu Match!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}