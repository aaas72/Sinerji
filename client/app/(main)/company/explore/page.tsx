"use client";

import { useState, useEffect } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { FiCompass, FiSearch, FiFilter, FiMapPin, FiBriefcase, FiUserPlus, FiChevronDown, FiX, FiStar, FiLoader, FiAlertCircle } from "react-icons/fi";
import StudentExploreCard, { StudentType } from '@/components/features/students/StudentExploreCard';
import StudentProfileDrawer from '@/components/features/students/StudentProfileDrawer';
import { studentService } from "@/services/student.service";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FilterContainer from "@/components/ui/FilterContainer";

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");
  
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleStudentClick = (student: StudentType) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    (async () => {
      try {
        const rawStudents = await studentService.getAllStudents();
        const formatted: StudentType[] = rawStudents.map((s) => ({
          id: s.user_id,
          name: s.full_name || "Bilinmeyen",
          initials: (s.full_name || "B Ö")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          headline: s.major || s.bio || "Öğrenci",
          university: s.university || "Bilinmeyen Üniversite",
          skills: s.skills?.map((sk) => sk.skill?.name || "Yetenek") || [],
          location: "Türkiye",
        }));
        setStudents(formatted);
      } catch (err) {
        console.error("Failed to fetch students", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = category === "all" || 
                            student.skills.some(skill => skill.toLowerCase().includes(category.toLowerCase())) ||
                            student.headline.toLowerCase().includes(category.toLowerCase());
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "newest") return Number(b.id) - Number(a.id);
    return Number(a.id) - Number(b.id);
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategory("all");
    setSortBy("best_match");
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-6 animate-fade-up">

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
          {loading ? (
            <div className="flex justify-center items-center py-10 w-full">
              <FiLoader className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : students.length > 0 ? (
            students.slice(0, 6).map((student) => (
              <div key={`pop-${student.id}`} className="snap-start shrink-0 w-[85vw] sm:w-[320px] lg:w-[350px]">
                <StudentExploreCard 
                  student={student} 
                  variant="glass" 
                  onClick={() => handleStudentClick(student)}
                />
              </div>
            ))
          ) : (
             <div className="text-white/70 py-10">Öğrenci bulunamadı.</div>
          )}
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#0b1c30]">Tüm Yetenekleri Keşfet</h2>
        </div>

      {/* Filter Bar following ApplicantsSearchFilter design */}
      <FilterContainer>
        {/* Search Input Box */}
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565e74] w-4 h-4" />
          <Input
            type="text"
            placeholder="Öğrenci veya yetenek ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 text-xs font-semibold text-[#3f465c] bg-white border-[#bfc9c4]/50 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Categories Dropdown Filter */}
          <div className="relative w-full sm:w-auto">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-5 pr-10 py-2.5 text-xs font-bold text-[#3f465c] bg-white border-[#bfc9c4]/50 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b]"
            >
              <option value="all">Tüm Yetenekler</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="design">Tasarım</option>
              <option value="marketing">Pazarlama</option>
            </Select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#565e74] w-4 h-4" />
          </div>

          {/* Sort By Option Dropdown */}
          <div className="relative w-full sm:w-auto">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-5 pr-10 py-2.5 text-xs font-bold text-[#3f465c] bg-white border-[#bfc9c4]/50 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b]"
            >
              <option value="best_match">En İyi Eşleşme</option>
              <option value="newest">En Yeni Katılanlar</option>
            </Select>
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
      </FilterContainer>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <FiLoader className="w-8 h-8 text-[#00342b] animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-[#565e74]">
          <FiAlertCircle className="w-8 h-8 text-red-400" />
          <p>Veriler yüklenemedi. Lütfen sayfayı yenileyin.</p>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <StudentExploreCard 
              key={student.id} 
              student={student} 
              onClick={() => handleStudentClick(student)}
            />
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

      <StudentProfileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        student={selectedStudent} 
      />
    </div>
  );
}
