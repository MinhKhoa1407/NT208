"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  Tag, 
  Search, 
  ExternalLink, 
  AlertTriangle,
  Award,
  Layers,
  SlidersHorizontal
} from "lucide-react";

// Định nghĩa kiểu dữ liệu đồng bộ 100% với DTO của Backend Route
type MatchResult = {
  id: number;
  type: string;
  display_name: string;
  display_rank: string;
  display_sub_info: string;
  url: string;
  similarity_score: number;
  raw_description?: string;
};

export default function AiMatcherPage() {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  
  // Quản lý trạng thái phân loại mục tiêu đối soát
  const [selectedType, setSelectedType] = useState<"journal" | "conference" | "cfp">("journal");
  
  // 🌟 Bộ lọc AI nâng cao gửi động xuống backend
  const [limit, setLimit] = useState<number>(20);
  const [threshold, setThreshold] = useState<number>(0.35);

  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);
  const [hasMatched, setHasMatched] = useState(false);

  const isValidUrl = (url: string | null | undefined) => {
    if (!url) return false;
    const cleanUrl = url.trim().toLowerCase();
    return (
      cleanUrl !== "" &&
      cleanUrl !== "#" &&
      cleanUrl !== "n/a" &&
      cleanUrl !== "null" &&
      !cleanUrl.startsWith("fallback")
    );
  };

  const handleAiMatching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !abstract.trim()) {
      alert("Vui lòng nhập ít nhất tiêu đề hoặc tóm tắt bài báo!");
      return;
    }

    setLoading(true);
    setHasMatched(true);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🌟 Đã truyền đầy đủ các tham số cấu hình động lên Server
        body: JSON.stringify({ 
          title, 
          abstract, 
          keywords, 
          type: selectedType,
          limit,
          threshold
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server phản hồi lỗi mã: ${res.status}`);
      }
      
      const data = await res.json();
      setSearchResults(data || []);
      
    } catch (error: any) {
      console.error("Lỗi đối soát:", error);
      alert(error.message || "Gặp lỗi khi kết nối AI Engine");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 w-full">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        
        {/* TIÊU ĐỀ ENGINE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              NLP Scientific Matcher Engine
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Smart Publication Matcher
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-bold text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            Ngrok Endpoint Active
          </div>
        </div>

        {/* THÂN TRANG CHIA THÀNH 2 CỘT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* KHỐI NHẬP LIỆU BẢN THẢO */}
          <form 
            onSubmit={handleAiMatching}
            className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5 sticky top-6 z-30"
          >
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">Thông tin bản thảo nghiên cứu</h2>
            </div>

            {/* THANH CHỌN PHÂN LOẠI MỤC TIÊU ĐỐI SOÁT */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gray-400" /> Loại danh mục đối soát
              </label>
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
                {(["journal", "conference", "cfp"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`py-2 text-xs font-bold rounded-lg uppercase transition-all ${
                      selectedType === t 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      setSelectedType(t);
                      if (hasMatched) setSearchResults([]); // Xóa kết quả cũ chống nhiễu giao diện
                    }}
                  >
                    {t === "journal" ? "Journal" : t === "conference" ? "Conference" : "CFP"}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" /> Tiêu đề bài viết (Title) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., An Efficient OSPF Routing and VLAN Implementation..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Abstract Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" /> Tóm tắt bài báo (Abstract) *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Dán toàn bộ đoạn abstract tóm tắt mục tiêu nghiên cứu..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
              />
            </div>

            {/* Keywords Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" /> Từ khóa liên quan (Keywords)
              </label>
              <input
                type="text"
                placeholder="ospf, vlan, network management..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            {/* 🌟 CẤU HÌNH THAM SỐ AI NÂNG CAO */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex flex-col gap-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Cấu hình mô hình toán học
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Bộ lọc giới hạn số lượng */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Số lượng trả về</label>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                  >
                    <option value={10}>10 kết quả</option>
                    <option value={20}>20 kết quả</option>
                    <option value={30}>30 kết quả</option>
                    <option value={50}>50 kết quả</option>
                  </select>
                </div>
                {/* Bộ lọc ngưỡng tương đồng */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Độ khớp tối thiểu</label>
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm"
                  >
                    <option value={0.30}>&gt; 30% (Rộng)</option>
                    <option value={0.35}>&gt; 35% (Chuẩn)</option>
                    <option value={0.40}>&gt; 40% (Cao)</option>
                    <option value={0.50}>&gt; 50% (Chặt chẽ)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nút trigger API */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang Embedding qua Ngrok...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Khởi chạy đối soát {selectedType.toUpperCase()}
                </>
              )}
            </button>
          </form>

          {/* KHỐI HIỂN THỊ KẾT QUẢ ĐỐI SOÁT */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 min-h-[580px]">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                  <div className="p-1 bg-green-50 rounded-md text-green-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  Kết quả đề xuất [{selectedType.toUpperCase()}] tương đồng tốt nhất
                </div>
                {hasMatched && !loading && (
                  <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                    Tìm thấy {searchResults.length} mục thỏa mãn
                  </span>
                )}
              </div>

              {/* Trạng thái Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-36 gap-3 flex-1">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold text-gray-400">Đang quét không gian vector PGVector...</p>
                </div>
              )}

              {/* Trạng thái ban đầu chưa quét */}
              {!hasMatched && !loading && (
                <div className="flex flex-col items-center justify-center text-center py-40 flex-1">
                  <div className="p-4 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl mb-3">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700">Sẵn sàng phân tích ngữ nghĩa</h3>
                  <p className="text-xs text-gray-400 max-w-xs mt-1">
                    Chọn Tab danh mục, cấu hình tham số mong muốn và bấm nút chạy phân tích đối soát.
                  </p>
                </div>
              )}

              {/* Trạng thái không tìm thấy dữ liệu đạt yêu cầu */}
              {hasMatched && !loading && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-36 flex-1 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-sm font-bold text-gray-600">Không tìm thấy dữ liệu phù hợp</p>
                  <p className="text-xs text-gray-400 max-w-xs mt-0.5">
                    Không có danh mục nào vượt qua ngưỡng tương đồng {(threshold * 100).toFixed(0)}%. Hãy thử hạ thấp độ khớp tối thiểu xuống.
                  </p>
                </div>
              )}

              {/* DANH SÁCH CARD KẾT QUẢ */}
              {hasMatched && !loading && searchResults.length > 0 && (
                <div className="space-y-4">
                  {searchResults.map((item, index) => {
                    const isUrlValid = isValidUrl(item.url);
                    const matchPercent = item.similarity_score
                      ? `${(item.similarity_score * 100).toFixed(1)}%` 
                      : "0.0%";

                    return (
                      <div 
                        key={item.id || index}
                        className="p-5 bg-gray-50/70 border border-gray-150 rounded-2xl hover:border-blue-300 hover:bg-white transition-all shadow-sm flex flex-col gap-3.5 group"
                      >
                        {/* Hàng 1: Thứ hạng và Độ khớp */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-bold tracking-wider uppercase">
                              {item.display_rank || "UNRANKED"}
                            </span>
                            <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors pt-0.5">
                              {item.display_name}
                            </h3>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Độ tương đồng</span>
                            <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-extrabold shadow-sm">
                              {matchPercent}
                            </span>
                          </div>
                        </div>

                        {/* Hàng 2: Chi tiết phụ khoa học */}
                        <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-100 text-xs font-medium text-gray-600">
                          <Award className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="truncate">{item.display_sub_info}</span>
                        </div>

                        {/* Hàng 3: Điều hướng và Hành động */}
                        <div className="pt-2.5 border-t border-gray-200/60 flex items-center justify-between">
                          {isUrlValid ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-indigo-600 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Source Gateway
                            </a>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-xs text-gray-400 italic font-medium select-none">
                              <AlertTriangle className="w-3.5 h-3.5 text-gray-300" />
                              Nguồn chưa cập nhật liên kết chính thức
                            </div>
                          )}

                          <button 
                            type="button" 
                            className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            Chi tiết phạm vi
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}