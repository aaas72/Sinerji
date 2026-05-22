"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { FiCompass, FiSearch, FiFilter, FiMapPin, FiBriefcase, FiUserPlus, FiChevronDown, FiX, FiStar } from "react-icons/fi";
import StudentExploreCard from "@/components/ui/cards/StudentExploreCard";

const MOCK_STUDENTS = [
  {
    id: 1,
    name: "Emre Can",
    initials: "EC",
    headline: "Frontend Developer | React & Next.js",
    university: "Boğaziçi Üniversitesi",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    location: "İstanbul, Türkiye",
  },
  {
    id: 2,
    name: "Zeynep Çelik",
    initials: "ZÇ",
    headline: "UI/UX Designer | Figma Explorer",
    university: "ODTÜ",
    skills: ["Figma", "UI Design", "Prototyping"],
    location: "Ankara, Türkiye",
  },
  {
    id: 3,
    name: "Burak Kaya",
    initials: "BK",
    headline: "Backend Developer Stajyeri",
    university: "İTÜ",
    skills: ["Node.js", "Python", "MongoDB"],
    location: "İstanbul, Türkiye",
  },
  {
    id: 4,
    name: "Elif Demir",
    initials: "ED",
    headline: "Marketing Intern | SEO Specialist",
    university: "Bilkent Üniversitesi",
    skills: ["SEO", "Content Writing", "Social Media"],
    location: "Ankara, Türkiye",
  },
  {
    id: 5,
    name: "Caner Yıldız",
    initials: "CY",
    headline: "Mobile App Developer | Flutter",
    university: "Yıldız Teknik Üniversitesi",
    skills: ["Flutter", "Dart", "Firebase"],
    location: "İstanbul, Türkiye",
  },
  {
    id: 6,
    name: "Seda Nur",
    initials: "SN",
    headline: "Veri Bilimi Stajyeri",
    university: "Hacettepe Üniversitesi",
    skills: ["Python", "Machine Learning", "SQL"],
    location: "Ankara, Türkiye",
  },
];

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");

  const filteredStudents = MOCK_STUDENTS.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = category === "all" || 
                            student.skills.some(skill => skill.toLowerCase().includes(category.toLowerCase())) ||
                            student.headline.toLowerCase().includes(category.toLowerCase());
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "newest") return b.id - a.id;
    return a.id - b.id;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategory("all");
    setSortBy("best_match");
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-6">

      {/* Popular Section */}
      <section className="hero-gradient rounded-[40px] p-6 md:p-8 shadow-xl border border-white/5">
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">Platformda En Popüler</h2>
              <p className="text-[#e28743] text-sm mt-1">Öne çıkan yetenekleri keşfedin</p>
            </div>
          </div>
        </div>
        
        {/* Horizontal Slider */}
        <div className="flex overflow-x-auto gap-6 pb-2 pt-2 snap-x snap-mandatory relative z-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {MOCK_STUDENTS.map((student) => (
            <div key={`pop-${student.id}`} className="snap-start shrink-0 w-[85vw] sm:w-[320px] lg:w-[350px]">
              <StudentExploreCard student={student} variant="glass" />
            </div>
          ))}
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#0b1c30]">Tüm Yetenekleri Keşfet</h2>
        </div>

      {/* Filter Bar following ApplicantsSearchFilter design */}
      <div className="bg-transparent border border-[#dfded6] rounded-[50px] p-4 flex flex-col lg:flex-row items-center gap-4 select-none">
        {/* Search Input Box */}
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565e74] w-4 h-4" />
          <input
            type="text"
            placeholder="Öğrenci veya yetenek ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/50 border-[#bfc9c4]/50 border rounded-full pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] outline-none text-xs font-semibold text-[#3f465c] transition-all placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Categories Dropdown Filter */}
          <div className="relative w-full sm:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-white/50 border-[#bfc9c4]/50 border rounded-full pl-5 pr-10 py-2.5 text-xs font-bold text-[#3f465c] focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] outline-none cursor-pointer transition-all"
            >
              <option value="all">Tüm Yetenekler</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="design">Tasarım</option>
              <option value="marketing">Pazarlama</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#565e74] w-4 h-4" />
          </div>

          {/* Sort By Option Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-white/50 border-[#bfc9c4]/50 border rounded-full pl-5 pr-10 py-2.5 text-xs font-bold text-[#3f465c] focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] outline-none cursor-pointer transition-all"
            >
              <option value="best_match">En İyi Eşleşme</option>
              <option value="newest">En Yeni Katılanlar</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#565e74] w-4 h-4" />
          </div>
        </div>

        {/* Clear Filters Action Button */}
        <div className="lg:ml-auto w-full lg:w-auto flex justify-end shrink-0">
          <button 
            onClick={handleClearFilters}
            className="w-full lg:w-auto bg-transparent border-0 outline-none text-[#565e74]/70 hover:text-[#00342b] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 py-2 px-1"
          >
            <FiX className="w-4 h-4 text-current" />
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <StudentExploreCard key={student.id} student={student} />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-[#DFDED6]">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <FiSearch className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-[#0b1c30]">Öğrenci Bulunamadı</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            Arama kriterlerinize uygun bir öğrenci profili bulunamadı. Lütfen farklı anahtar kelimeler deneyin.
          </p>
        </div>
      )}
      </section>

    </div>
  );
}
