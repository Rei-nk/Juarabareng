import React from 'react';
import Sidebar from './Sidebar'; // Sesuaikan path Sidebar kamu

export default function DashboardLayout({ children, onLogout }) {
  return (
    // 👇 Aturan responsif mobile/desktop cukup ditaruh di sini sekali saja!
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 w-full font-sans">
      
      <Sidebar onLogout={onLogout} />
      
      <main className="flex-1 w-full lg:w-auto overflow-y-auto min-h-screen">
        {/* 'children' ini adalah isi dari halaman-halaman kamu nantinya */}
        {children}
      </main>

    </div>
  );
}