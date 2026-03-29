import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Heart, 
  Filter, 
  MapPin, 
  GraduationCap, 
  Code, 
  Palette, 
  TrendingUp, 
  MessageSquare,
  ChevronLeft
} from 'lucide-react';

// MOCK DATA: Nanti bisa diganti dengan fetch dari Supabase (tabel profiles)
const MOCK_PROFILES = [
  {
    id: 1,
    name: "Budi Santoso",
    role: "Hacker / Programmer",
    university: "Universitas Indonesia",
    bio: "Suka bikin web app dan API. Sedang mencari UI/UX Designer dan Bisnis untuk ikut Hackathon bulan depan.",
    skills: ["React", "Node.js", "Python"],
    icon: <Code size={40} className="text-blue-500" />,
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: 2,
    name: "Sarah Wijaya",
    role: "Hipster / UI/UX Designer",
    university: "Institut Teknologi Bandung",
    bio: "Figma enthusiast. Mencari tim yang butuh desain ciamik dan user-friendly untuk kompetisi startup.",
    skills: ["Figma", "Prototyping", "User Research"],
    icon: <Palette size={40} className="text-pink-500" />,
    color: "from-pink-500 to-rose-600"
  },
  {
    id: 3,
    name: "Kevin Pratama",
    role: "Hustler / Business",
    university: "Universitas Gadjah Mada",
    bio: "Punya ide startup edukasi. Butuh eksekutor (programmer) untuk merealisasikan MVP.",
    skills: ["Pitching", "Marketing", "Business Model"],
    icon: <TrendingUp size={40} className="text-amber-500" />,
    color: "from-amber-400 to-orange-500"
  }
];

export default function MatchPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  const currentProfile = MOCK_PROFILES[currentIndex];

  const handlePass = () => {
    nextProfile();
  };

  const handleConnect = () => {
    // Animasi "Match" sementara
    setShowMatchAnimation(true);
    setTimeout(() => {
      setShowMatchAnimation(false);
      nextProfile();
    }, 1500);
  };

  const nextProfile = () => {
    if (currentIndex < MOCK_PROFILES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Jika sudah habis, kembali ke indeks 0 (untuk demo)
      setCurrentIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col md:items-center md:justify-center md:py-10">
      
      {/* Container Utama ala Mobile App */}
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[800px] md:rounded-[3rem] md:shadow-2xl md:shadow-slate-200/50 relative overflow-hidden flex flex-col border border-slate-100">
        
        {/* --- NAVBAR --- */}
        <div className="flex items-center justify-between p-6 z-10 bg-white/80 backdrop-blur-md sticky top-0">
          <button 
            onClick={() => navigate('/feed')}
            className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Cari Partner</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temukan Timmu</p>
          </div>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {/* --- MAIN CONTENT (CARD) --- */}
        <div className="flex-1 p-6 flex flex-col justify-center relative">
          
          {/* Animasi Match Overlay */}
          {showMatchAnimation && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-black text-2xl animate-bounce shadow-2xl shadow-blue-500/30 flex items-center gap-2">
                <Heart className="fill-white" /> CONNECTED!
              </div>
            </div>
          )}

          {currentProfile ? (
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-[550px] relative transition-all duration-300 transform hover:scale-[1.02]">
              
              {/* Bagian Foto/Ilustrasi Profil */}
              <div className={`h-2/5 bg-gradient-to-br ${currentProfile.color} relative flex items-center justify-center`}>
                <div className="absolute inset-0 bg-black/10"></div>
                {/* Lingkaran Avatar */}
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/10 z-10 absolute -bottom-12 border-4 border-white">
                  {currentProfile.icon}
                </div>
              </div>

              {/* Info Profil */}
              <div className="pt-16 pb-6 px-6 flex flex-col flex-1 text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-1">{currentProfile.name}</h2>
                <p className="text-blue-600 font-bold text-sm mb-4">{currentProfile.role}</p>

                <div className="flex items-center justify-center gap-1 text-slate-500 text-sm font-medium mb-6">
                  <GraduationCap size={16} />
                  <span>{currentProfile.university}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex-1 flex items-center justify-center border border-slate-100">
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    "{currentProfile.bio}"
                  </p>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 justify-center mt-auto">
                  {currentProfile.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="text-center p-10">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <X size={30} />
               </div>
               <h3 className="text-xl font-bold text-slate-900">Habis!</h3>
               <p className="text-slate-500 text-sm">Tidak ada lagi profil di sekitarmu.</p>
             </div>
          )}

        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="p-6 pb-10 flex justify-center gap-6 z-10">
          <button 
            onClick={handlePass}
            className="w-16 h-16 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-lg shadow-slate-200/50 hover:scale-110 active:scale-95"
          >
            <X size={28} />
          </button>

          <button 
            className="w-16 h-16 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-lg shadow-slate-200/50 hover:scale-110 active:scale-95"
          >
            <MessageSquare size={24} />
          </button>

          <button 
            onClick={handleConnect}
            className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-110 active:scale-95"
          >
            <Heart size={28} className="fill-white/20" />
          </button>
        </div>

      </div>
    </div>
  );
}