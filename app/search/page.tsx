"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  Sparkles,
  Globe,
  ExternalLink,
  BookMarked,
  X
} from "lucide-react";

export default function SearchDiscoveryPage() {
  const [activeTab, setActiveTab] = useState<"conference" | "journal">("conference");
  const [searchQuery, setSearchQuery] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [countryInput, setCountryInput] = useState("");

  const [selectedRanks, setSelectedRanks] = useState<string[]>([]); 
  const [isOpenAccess, setIsOpenAccess] = useState(false); 
  const [isHighHIndex, setIsHighHIndex] = useState(false); 
  const [isUpcomingDeadline, setIsUpcomingDeadline] = useState(false); 

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); 

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 100; 

  const generateCalendarUrl = (item: any, type: 'deadline' | 'conference') => {
    const isDeadline = type === 'deadline';
    const dateStr = isDeadline ? item.submission_deadline : item.conference_date;
    
    if (!dateStr || dateStr === "N/A" || dateStr === "") return null;

    // Định dạng YYYY-MM-DD sang YYYYMMDD
    const formattedDate = dateStr.replace(/-/g, ""); 
    const title = encodeURIComponent(`${isDeadline ? '⏰ Deadline:' : '🚀 Conf:'} ${item.full_name || item.name}`);
    const details = encodeURIComponent(`Link: ${item.conference_url || item.journal_url || 'N/A'}`);
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formattedDate}/${formattedDate}&details=${details}&sf=true&output=xml`;
  };

  const handleSearchAllConditions = async (pageTarget = 1) => {
    setLoadingResults(true);
    setHasSearched(true);
    setCurrentPage(pageTarget);
    
    try {
      // 🛠️ FIX: Mã hóa toàn bộ chuỗi ranks bằng encodeURIComponent để bảo toàn ký tự dấu sao (*)
      const rankStr = encodeURIComponent(selectedRanks.join(","));
      
      const url = `/api/search?tab=${activeTab}` +
                  `&q=${encodeURIComponent(searchQuery)}` +
                  `&field=${encodeURIComponent(areaInput)}` +
                  `&country=${encodeURIComponent(countryInput)}` +
                  `&ranks=${rankStr}` +
                  `&open_access=${isOpenAccess}` +
                  `&high_h_index=${isHighHIndex}` +
                  `&upcoming_deadline=${isUpcomingDeadline}` +
                  `&page=${pageTarget}` +
                  `&limit=${itemsPerPage}`;

      const res = await fetch(url);
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        setSearchResults([]);
        setTotalCount(0);
        setTotalPages(0);
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        const rawData = data.results || [];

        const scoredData = rawData.map((item: any) => {
          let score = 0;
          const q = searchQuery.toLowerCase().trim();
          const area = areaInput.toLowerCase().trim();
          const country = countryInput.toLowerCase().trim();

          if (activeTab === "conference") {
            if (q) {
              if (item.full_name?.toLowerCase() === q || item.acronym?.toLowerCase() === q) score += 4;
              else if (item.full_name?.toLowerCase().includes(q) || item.acronym?.toLowerCase().includes(q)) score += 2;
            }
            if (area && item.field?.toLowerCase().includes(area)) {
              score += item.field.toLowerCase() === area ? 3 : 1.5;
            }
            if (country && item.location?.toLowerCase().includes(country)) {
              score += item.location.toLowerCase() === country ? 3 : 1.5;
            }
          } else {
            if (q) {
              if (item.name?.toLowerCase() === q || item.issn?.toLowerCase() === q) score += 4;
              else if (item.name?.toLowerCase().includes(q) || item.issn?.toLowerCase().includes(q)) score += 2;
            }
            if (area && item.subject_area?.toLowerCase().includes(area)) {
              score += item.subject_area.toLowerCase() === area ? 3 : 1.5;
            }
            if (country && item.country?.toLowerCase().includes(country)) {
              score += item.country.toLowerCase() === country ? 3 : 1.5;
            }
          }
          return { ...item, matchScore: score };
        });

        const sortedData = scoredData.sort((a: any, b: any) => b.matchScore - a.matchScore);
        setSearchResults(sortedData);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleRankToggle = (rank: string) => {
    if (selectedRanks.includes(rank)) {
      setSelectedRanks(selectedRanks.filter((r) => r !== rank));
    } else {
      setSelectedRanks([...selectedRanks, rank]);
    }
  };

  const handleTabChange = (tab: "conference" | "journal") => {
    setActiveTab(tab);
    setSelectedRanks([]);
    setAreaInput("");
    setCountryInput("");
    setSearchQuery("");
    setIsOpenAccess(false);
    setIsHighHIndex(false);
    setIsUpcomingDeadline(false);
    setSearchResults([]);
    setHasSearched(false); 
    setCurrentPage(1);
    setTotalCount(0);
    setTotalPages(0);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 p-6 w-full">
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-[1600px] mx-auto">
        
        {/* SIDEBAR BỘ LỌC */}
        <aside className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-6 shrink-0 h-fit static md:sticky top-6 z-40">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Bộ lọc tra cứu</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-gray-400" /> 
              {activeTab === "journal" ? "Lĩnh vực (subject_area)" : "Mảng nghiên cứu (field)"}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập chuyên ngành nghiên cứu..."
                className="w-full p-2.5 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchAllConditions(1); }}
              />
              {areaInput && <button onClick={() => setAreaInput("")} className="absolute right-2.5 top-3 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-gray-400" /> 
              {activeTab === "journal" ? "Quốc gia (country)" : "Địa điểm (location)"}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập quốc gia, thành phố..."
                className="w-full p-2.5 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchAllConditions(1); }}
              />
              {countryInput && <button onClick={() => setCountryInput("")} className="absolute right-2.5 top-3 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-gray-400" /> 
              {activeTab === "journal" ? "Phân hạng (quartile)" : "Xếp hạng (rank)"}
            </label>
            <div className="space-y-2 pl-1">
              {activeTab === "conference" ? (
                /* 🌟 ĐÃ THÊM MỤC "Others" VÀO ĐOẠN ĐẦU HÀNG NÀY */
                ["A*", "A", "B", "C", "Unranked", "Others"].map((rank) => (
                  <label key={rank} className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-blue-600 border-gray-300" 
                      checked={selectedRanks.includes(rank)} 
                      onChange={() => handleRankToggle(rank)}
                    />
                    {rank === "Others" ? "Hạng khác (Others)" : `Hạng ${rank}`}
                  </label>
                ))
              ) : (
                ["Q1", "Q2", "Q3", "Q4"].map((q) => (
                  <label key={q} className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-gray-300" checked={selectedRanks.includes(q)} onChange={() => handleRankToggle(q)}/>
                    Phân hạng {q}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            {activeTab === "journal" ? (
              <>
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-gray-300" checked={isOpenAccess} onChange={(e) => setIsOpenAccess(e.target.checked)}/>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Truy cập mở (Open Access)</span>
                </label>
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-gray-300" checked={isHighHIndex} onChange={(e) => setIsHighHIndex(e.target.checked)}/>
                  <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> Chất lượng cao (H-Index &ge; 100)</span>
                </label>
              </>
            ) : (
              <label className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-gray-300" checked={isUpcomingDeadline} onChange={(e) => setIsUpcomingDeadline(e.target.checked)}/>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> Còn hạn nộp bài (Deadline)</span>
              </label>
            )}
          </div>

          <button onClick={() => handleSearchAllConditions(1)} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm">
            <Search className="w-4 h-4" /> Thực thi Tìm kiếm
          </button>
        </aside>

        {/* KHU VỰC KẾT QUẢ VÀ PHÂN TRANG */}
        <main className="flex-1 flex flex-col gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex bg-gray-100 p-1 rounded-xl w-full lg:w-auto">
              <button onClick={() => handleTabChange("conference")} className={`flex-1 lg:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "conference" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>Conferences</button>
              <button onClick={() => handleTabChange("journal")} className={`flex-1 lg:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === "journal" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>Journals</button>
            </div>

            <div className="relative flex-1 w-full max-w-xl">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === "journal" ? "Tìm theo tên tạp chí khoa học, mã issn..." : "Tìm theo tên hội nghị đầy đủ hoặc viết tắt (acronym)..."}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchAllConditions(1); }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 flex-1">
            {loadingResults ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-gray-400">Đang quét dữ liệu từ Server...</p>
              </div>
            ) : !hasSearched ? (
              <div className="flex flex-col items-center justify-center text-center py-24 px-4">
                <div className="p-4 bg-blue-50 rounded-full text-blue-600 mb-4"><Search className="w-8 h-8" /></div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Cơ sở dữ liệu danh mục khoa học</h3>
                <p className="text-sm text-gray-400 max-w-sm">Vui lòng thiết lập bộ lọc ở thanh điều hướng bên trái và nhấn Tìm kiếm.</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-medium text-sm">Không tìm thấy dữ liệu nào khớp điều kiện.</div>
            ) : (
              <>
                <div className="flex justify-between items-center text-sm text-gray-500 border-b border-gray-100 pb-4">
                  <span>Đang xem trang <b>{currentPage}/{totalPages}</b> (Tìm thấy tổng cộng <b>{totalCount}</b> hàng dữ liệu)</span>
                  <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-semibold"><Sparkles className="w-3 h-3" /> Tải 100 dòng / trang</span>
                </div>

                <div className="space-y-4">
                  {searchResults.map((item) => {
                    if (activeTab === "conference") {
                      return (
                        <div key={item.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-all shadow-sm">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                              {/* 🌟 ĐÃ NÂNG CẤP ĐOẠN CHECK ĐỂ HIỂN THỊ ĐÚNG CÁC RANK LẠ TRONG DB */}
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-extrabold">
                                {item.rank && item.rank.trim() !== "" && item.rank !== "N/A" 
                                  ? `Rank ${item.rank}` 
                                  : "Unranked"}
                              </span>
                              {item.acronym && <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.acronym}</span>}
                            </div>

                            <h3 className="text-base font-bold text-gray-900">{item.full_name}</h3>

                            {/* Phần thông tin: Địa điểm và Mảng nghiên cứu */}
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>📍 <b>Địa điểm:</b> {item.location && item.location.trim() !== "" && item.location !== "N/A" ? item.location : "N/A"}</p>
                              <p>📚 <b>Mảng nghiên cứu:</b> {item.field && item.field.trim() !== "" && item.field !== "N/A" ? item.field : "N/A"}</p>
                            </div>

                            {/* Phần thời gian: Hạn nộp và Ngày hội nghị */}
                            <div className="text-xs bg-amber-50 text-amber-700 font-medium p-2 rounded-lg border border-amber-100/50 w-fit">
                              📅 <b>Hạn nộp bài:</b> {item.submission_deadline && item.submission_deadline.trim() !== "" && item.submission_deadline !== "N/A" ? item.submission_deadline : "N/A"} 
                              {" | "} 
                              🚀 <b>Ngày hội nghị:</b> {item.conference_date && item.conference_date.trim() !== "" && item.conference_date !== "N/A" ? item.conference_date : "N/A"}
                            </div>

                            {/* Phần Link sự kiện */}
                            <div className="text-xs text-gray-600">
                              🌐 <b>Link sự kiện:</b>{" "}
                              {item.conference_url && 
                              item.conference_url.trim() !== "" && 
                              item.conference_url !== "N/A" && 
                              item.conference_url.toLowerCase() !== "null" &&
                              !item.conference_url.toUpperCase().startsWith("FALLBACK") ? (
                                <a 
                                  href={item.conference_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:underline font-bold"
                                >
                                  Trang chính thức
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">N/A</span>
                              )}
                            </div>

                            {/* NÚT ĐỒNG BỘ LỊCH */}
                            <div className="flex gap-2 mt-3">
                              {item.submission_deadline && item.submission_deadline !== "N/A" && (
                                <button 
                                  onClick={() => window.open(generateCalendarUrl(item, 'deadline')!, '_blank')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold hover:bg-amber-100 transition-colors"
                                >
                                  📅 Deadline
                                </button>
                              )}
                              {item.conference_date && item.conference_date !== "N/A" && (
                                <button 
                                  onClick={() => window.open(generateCalendarUrl(item, 'conference')!, '_blank')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                >
                                  🚀 Conference
                                </button>
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={item.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-all shadow-sm">
                          <div className="space-y-3 flex-1 w-full">
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                                <BookMarked className="w-4 h-4 text-blue-500 shrink-0" />
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-extrabold">{item.quartile ? `Phân hạng ${item.quartile}` : "No Quartile"}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.open_access?.toLowerCase() === 'yes' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>OA: {item.open_access || "No"}</span>
                                {item.type && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold capitalize">{item.type}</span>}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-gray-150 text-xs text-gray-600">
                              <div>📌 <b>Mã ISSN:</b> <span className="font-mono font-semibold text-gray-800">{item.issn || "N/A"}</span></div>
                              <div>📈 <b>Chỉ số SJR:</b> <span className="font-semibold text-gray-800">{item.sjr ?? "N/A"}</span></div>
                              <div>🔥 <b>H-Index:</b> <span className="font-semibold text-gray-800">{item.h_index ?? "N/A"}</span></div>
                              <div>💬 <b>Cites / Doc:</b> <span className="font-semibold text-gray-800">{item.citations_per_doc ?? "N/A"}</span></div>
                              <div>📦 <b>Total Docs (3y):</b> <span className="text-gray-800">{item.total_docs_3years ?? "N/A"}</span></div>
                              <div>🌐 <b>Quốc gia:</b> <span className="text-gray-800">{item.country || "N/A"}</span></div>
                              <div>👑 <b>Global Rank:</b> <span className="text-gray-800 font-medium">#{item.global_rank ?? "N/A"}</span></div>
                              <div>🏢 <b>Nhà xuất bản:</b> <span className="text-blue-700 font-semibold">{item.publishers?.name || "N/A"}</span></div>
                            </div>

                            <div className="space-y-1 pt-1 text-xs">
                              <p className="text-gray-600">📚 <b>Mảng nghiên cứu (Subject Area):</b> <span className="text-gray-800 font-medium">{item.subject_area || "N/A"}</span></p>
                              {item.scope && <p className="text-gray-500 bg-white p-2 rounded-lg border border-gray-100 italic line-clamp-2"><b>Mô tả Scope:</b> {item.scope}</p>}
                            </div>
                          </div>

                          {item.journal_url && item.journal_url.trim() !== "" && item.journal_url !== "N/A" && (
                            <a 
                              href={item.journal_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-full lg:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center justify-center gap-1.5 shrink-0 shadow-sm transition-all"
                            >
                              Xem Journal <ChevronRight className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>

                {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100 mt-6 select-none">
                    <button
                      onClick={() => handleSearchAllConditions(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                    >
                      Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      if (pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 2) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handleSearchAllConditions(pageNumber)}
                            className={`w-9 h-9 text-sm font-bold rounded-xl transition-all ${currentPage === pageNumber ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                        return <span key={pageNumber} className="text-gray-400 px-1">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => handleSearchAllConditions(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}