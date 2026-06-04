"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiFilter, FiChevronDown, FiX, FiLoader, FiAlertCircle, FiBriefcase } from "react-icons/fi";
import CompanyExploreCard, { CompanyExploreType } from '@/components/features/companies/CompanyExploreCard';
import { companyService } from "@/services/company.service";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FilterContainer from "@/components/ui/FilterContainer";
import CompanyProfileDrawer from "@/components/features/companies/CompanyProfileDrawer";

export default function StudentExplorePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("best_match");
  
  const [companies, setCompanies] = useState<CompanyExploreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<CompanyExploreType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companyService.getAllCompanies();
        const mapped = data.map((c: any) => ({
          id: c.user_id,
          name: c.company_name || "İsimsiz Şirket",
          initials: (c.company_name || "İ Ş").substring(0, 2).toUpperCase(),
          industry: c.industry || "Sektör Belirtilmemiş",
          location: c.location || "Konum Belirtilmemiş",
          openTasks: c._count?.tasks || 0,
          rating: 4.5, // Default placeholder rating
          logo_url: c.logo_url || undefined
        }));
        setCompanies(mapped);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleCompanyClick = (company: CompanyExploreType) => {
    setSelectedCompany(company);
    setIsDrawerOpen(true);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "all" || 
                            company.industry.toLowerCase().includes(category.toLowerCase());
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "tasks") return b.openTasks - a.openTasks;
    return Number(a.id) - Number(b.id); // newest/default
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategory("all");
    setSortBy("best_match");
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-6">

      {/* Popular Section */}
      <section className="hero-gradient rounded-[40px] p-6 md:p-8 shadow-xl border border-white/5 bg-gradient-to-r from-[#004d40] to-[#0f172a]">
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">Platformda Öne Çıkan Şirketler</h2>
              <p className="text-[#e28743] text-sm mt-1">Sektörün liderlerini keşfedin ve projelerine başvurun</p>
            </div>
          </div>
        </div>
        
        {/* Horizontal Slider */}
        <div className="flex overflow-x-auto gap-6 pb-2 pt-2 snap-x snap-mandatory relative z-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="flex justify-center items-center py-10 w-full">
              <FiLoader className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : companies.length > 0 ? (
            companies.sort((a, b) => b.rating - a.rating).slice(0, 6).map((company) => (
              <div key={`pop-${company.id}`} className="snap-start shrink-0 w-[85vw] sm:w-[320px] lg:w-[350px]">
                <CompanyExploreCard 
                  company={company} 
                  variant="glass" 
                  onClick={() => handleCompanyClick(company)}
                />
              </div>
            ))
          ) : (
             <div className="text-white/70 py-10">Şirket bulunamadı.</div>
          )}
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="flex flex-col gap-6 mt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#0b1c30]">Tüm Şirketleri Keşfet</h2>
        </div>

      {/* Filter Bar */}
      <FilterContainer>
        {/* Search Input Box */}
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565e74] w-4 h-4" />
          <Input
            type="text"
            placeholder="Şirket veya sektör ara..."
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
              <option value="all">Tüm Sektörler</option>
              <option value="Yazılım ve Teknoloji">Yazılım ve Teknoloji</option>
              <option value="Tasarım ve Medya">Tasarım ve Medya</option>
              <option value="Pazarlama ve Reklam">Pazarlama ve Reklam</option>
              <option value="Finans Teknolojileri">Finans Teknolojileri</option>
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
              <option value="rating">En Yüksek Puanlı</option>
              <option value="tasks">En Çok Görev Veren</option>
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
      ) : filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyExploreCard 
              key={company.id} 
              company={company} 
              onClick={() => handleCompanyClick(company)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-[#DFDED6]">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <FiBriefcase className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-[#0b1c30]">Şirket Bulunamadı</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            Arama kriterlerinize uygun bir şirket bulunamadı. Lütfen farklı anahtar kelimeler deneyin.
          </p>
        </div>
      )}
      </section>

      <CompanyProfileDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        company={selectedCompany} 
      />
    </div>
  );
}
