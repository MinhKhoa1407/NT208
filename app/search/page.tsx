"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle, 
  Bell, 
  BellOff,
  Calendar, 
  ChevronRight,
  Sparkles,
  Info,
  Globe,
  FileText
} from "lucide-react";

export default function SearchDiscoveryPage() {
  // State quản lý Tab chính (Hội nghị từ bảng conferences hay Tạp chí từ bảng journals)
  const [activeTab, setActiveTab] = useState<"conference" | "journal">("conference");
  const [searchQuery, setSearchQuery] = useState("");
  
  // =========================================================
  // STATE BỘ LỌC CHUẨN THEO ĐÚNG CÁC CỘT TRONG DATABASE
  // =========================================================
  
  // 1. Bộ lọc chung cho cả 2 bên (Lĩnh vực & Quốc gia/Địa điểm)
  const [selectedArea, setSelectedArea] = useState("all"); // Bảng journals: subject_area | Bảng conferences: field
  const [selectedCountry, setSelectedCountry] = useState("all"); // Bảng journals: country | Bảng conferences: location

  // 2. Bộ lọc Xếp hạng (Hạng Q cho Journals hoặc Hạng A*/A/B/C cho Conferences)
  const [selectedRanks, setSelectedRanks] = useState<string[]>([]); // Bảng journals: quartile | Bảng conferences: rank

  // 3. Tiêu chí đặc thù chuẩn theo cột của bảng Journals
  const [isOpenAccess, setIsOpenAccess] = useState(false); // Cột open_access ('Yes' / 'No')
  const [isHighHIndex, setIsHighHIndex] = useState(false); // Cột h_index (Ví dụ: h_index >= 100)

  // 4. Tiêu chí đặc thù chuẩn theo cột của bảng Conferences
  const [isUpcomingDeadline, setIsUpcomingDeadline] = useState(false); // Cột submission_deadline (Còn hạn nộp bài)

  // State phụ cho tính năng mẫu Đăng ký nhận thông báo (Alerts) & Lịch
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [syncedItems, setSyncedItems] = useState<number[]>([]);

  // Xử lý chọn/bỏ chọn Hạng (Rank)
  const handleRankToggle = (rank: string) => {
    if (selectedRanks.includes(rank)) {
      setSelectedRanks(selectedRanks.filter((r) => r !== rank));
    } else {
      setSelectedRanks([...selectedRanks, rank]);
    }
  };

  // Đồng bộ lịch dựa vào cột dữ liệu thời gian của Conference
  const handleSyncCalendar = (id: number, title: string) => {
    if (syncedItems.includes(id)) {
      alert(`Đã hủy đồng bộ lịch cho: ${title}`);
      setSyncedItems(syncedItems.filter((item) => item !== id));
    } else {
      alert(`🎉 Đã tự động đồng bộ hạn Abstract và Full Paper vào Google Calendar của bạn!`);
      setSyncedItems([...syncedItems, id]);
    }
  };

  // Reset bộ lọc khi chuyển Tab để tránh xung đột dữ liệu
  const handleTabChange = (tab: "conference" | "journal") => {
    setActiveTab(tab);
    setSelectedRanks([]);
    setSelectedArea("all");
    setSelectedCountry("all");
    setIsOpenAccess(false);
    setIsHighHIndex(false);
    setIsUpcomingDeadline(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 p-6 w-full">
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-[1600px] mx-auto">
        
        {/* =========================================================
            1. SIDEBAR TRÁI: BỘ LỌC NÂNG CAO (MAP THEO DATABASE COLUMNS)
            ========================================================= */}
        <aside className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-6 shrink-0 h-fit sticky top-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Bộ lọc theo Data</h2>
          </div>

          {/* LỌC THEO LĨNH VỰC (Bảng journals: subject_area | Bảng conferences: field) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-gray-400" /> 
              {activeTab === "journal" ? "Lĩnh vực (subject_area)" : "Mảng nghiên cứu (field)"}
            </label>
            <select
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="all">Tất cả lĩnh vực</option>
              {activeTab === "journal" ? (
                <>
                  <option value="Medicine">Medicine (Y học)</option>
                  <option value="Computer Science">Computer Science (Khoa học máy tính)</option>
                  <option value="Engineering">Engineering (Kỹ thuật)</option>
                  <option value="Social Sciences">Social Sciences (Khoa học xã hội)</option>
                </>
              ) : (
                <>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence & ML</option>
                  <option value="Data Mining">Data Mining & Databases</option>
                  <option value="Cyber Security">Cyber Security</option>
                </>
              )}
            </select>
          </div>

          {/* LỌC THEO QUỐC GIA / ĐỊA ĐIỂM (Bảng journals: country | Bảng conferences: location) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-gray-400" /> 
              {activeTab === "journal" ? "Quốc gia (country)" : "Địa điểm (location)"}
            </label>
            <select
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value="all">{activeTab === "journal" ? "Tất cả quốc gia" : "Tất cả địa điểm"}</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Germany">Germany</option>
            </select>
          </div>

          {/* LỌC THEO XẾP HẠNG (Bảng journals: quartile | Bảng conferences: rank) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-gray-400" /> 
              {activeTab === "journal" ? "Phân hạng (quartile)" : "Xếp hạng (rank)"}
            </label>
            <div className="space-y-2 pl-1">
              {activeTab === "conference" ? (
                // Rank của bảng conferences (CORE Ranks)
                ["A*", "A", "B", "C", "Unranked"].map((rank) => (
                  <label key={rank} className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      checked={selectedRanks.includes(rank)}
                      onChange={() => handleRankToggle(rank)}
                    />
                    Hạng {rank}
                  </label>
                ))
              ) : (
                // Phân hạng Q của bảng journals (SJR Quartile)
                ["Q1", "Q2", "Q3", "Q4"].map((q) => (
                  <label key={q} className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      checked={selectedRanks.includes(q)}
                      onChange={() => handleRankToggle(q)}
                    />
                    Nhóm phân hạng {q}
                  </label>
                ))
              )}
            </div>
          </div>

          {/* TIÊU CHÍ ĐẶC THÙ (CHUYỂN ĐỔI ĐỘNG THEO CỘT THẬT CỦA DATABASE) */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Lọc theo chỉ số thực tế
            </label>
            
            {activeTab === "journal" ? (
              <>
                {/* Lọc theo cột open_access của bảng journals */}
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" 
                    checked={isOpenAccess}
                    onChange={(e) => setIsOpenAccess(e.target.checked)}
                  />
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Truy cập mở (open_access = 'Yes')
                  </span>
                </label>

                {/* Lọc theo cột h_index của bảng journals */}
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" 
                    checked={isHighHIndex}
                    onChange={(e) => setIsHighHIndex(e.target.checked)}
                  />
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Uy tín cao (h_index &ge; 100)
                  </span>
                </label>
              </>
            ) : (
              <>
                {/* Lọc theo cột submission_deadline của bảng conferences */}
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" 
                    checked={isUpcomingDeadline}
                    onChange={(e) => setIsUpcomingDeadline(e.target.checked)}
                  />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-500" /> Còn hạn nộp (deadline &ge; Hiện tại)
                  </span>
                </label>
              </>
            )}
          </div>
        </aside>

        {/* =========================================================
            2. KHU VỰC BÊN PHẢI: THANH TÌM KIẾM TỔNG & DANH SÁCH KẾT QUẢ
            ========================================================= */}
        <main className="flex-1 flex flex-col gap-4">
          
          {/* THANH ĐIỀU HƯỚNG TAB & THANH KIẾM TỔNG LỰC */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Chuyển đổi giữa Hội nghị (conferences) và Tạp chí (journals) */}
            <div className="flex bg-gray-100 p-1 rounded-xl w-full lg:w-auto">
              <button
                onClick={() => handleTabChange("conference")}
                className={`flex-1 lg:flex-none px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "conference" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                Conferences
              </button>
              <button
                onClick={() => handleTabChange("journal")}
                className={`flex-1 lg:flex-none px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "journal" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              >
                Journals
              </button>
            </div>

            {/* Thanh Tìm Kiếm Đa Năng theo Cột Tên (name hoặc full_name / acronym) */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === "journal" ? "Tìm theo tên tạp chí (name), issn..." : "Tìm theo tên (full_name), viết tắt (acronym)..."}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Đăng ký nhận thông báo */}
            <button
              onClick={() => {
                if (!alertEnabled) { setShowAlertModal(true); } 
                else { setAlertEnabled(false); }
              }}
              className={`w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${alertEnabled ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {alertEnabled ? (
                <><Bell className="w-4 h-4 fill-green-600 text-green-600 animate-pulse" /> Đang theo dõi ngành này</>
              ) : (
                <><BellOff className="w-4 h-4 text-gray-400" /> Nhận thông báo dữ liệu mới</>
              )}
            </button>
          </div>

          {/* KHUNG HIỂN THỊ KẾT QUẢ TRA CỨU */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center text-sm text-gray-500 border-b border-gray-100 pb-4">
              <span>Kết quả hiển thị từ bảng dữ liệu thực tế</span>
              <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-semibold">
                <Sparkles className="w-3 h-3" /> Supabase Connected
              </span>
            </div>

            {/* =========================================================
                HIỂN THỊ DỮ LIỆU BẢNG CONFERENCES
                ========================================================= */}
            {activeTab === "conference" && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/10 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {/* Mapping cột: rank */}
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-extrabold tracking-wider">Rank A*</span>
                      {/* Mapping cột: acronym */}
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">ICSE</span>
                    </div>
                    {/* Mapping cột: full_name */}
                    <h3 className="text-base font-bold text-gray-900">IEEE/ACM International Conference on Software Engineering</h3>
                    
                    <p className="text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {/* Mapping cột: location */}
                      <span><b>📍 Địa điểm (location):</b> Lisbon, Portugal</span>
                      <span>•</span>
                      {/* Mapping cột: field */}
                      <span><b>📚 Mảng (field):</b> Software Engineering</span>
                    </p>
                    
                    <div className="text-xs bg-amber-50 text-amber-700 font-medium p-2 rounded-lg border border-amber-100/50 w-fit flex flex-wrap items-center gap-x-3 gap-y-1">
                      {/* Mapping cột: submission_deadline và conference_date */}
                      <span>📅 <b>Hạn nộp (submission_deadline):</b> 2026-10-15</span>
                      <span>|</span>
                      <span>🚀 <b>Ngày hội nghị (conference_date):</b> 2026-05-20</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 shrink-0">
                    <button 
                      onClick={() => handleSyncCalendar(1, "ICSE 2026")}
                      className={`flex items-center justify-center gap-1.5 w-full lg:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${syncedItems.includes(1) ? "bg-green-600 text-white border border-green-600" : "bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200"}`}
                    >
                      <Calendar className="w-3.5 h-3.5" /> 
                      {syncedItems.includes(1) ? "Đã lưu lịch nộp bài" : "Đồng bộ lịch Google"}
                    </button>
                    {/* Mapping cột: conference_url */}
                    <a href="#" className="flex items-center justify-center gap-1 text-xs font-bold text-blue-600 hover:underline p-1 w-full lg:w-auto">
                      Đi tới URL Hội nghị <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                HIỂN THỊ DỮ LIỆU BẢNG JOURNALS (DỮ LIỆU SCIMAGO THẬT)
                ========================================================= */}
            {activeTab === "journal" && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/10 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Mapping cột: quartile */}
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-extrabold tracking-wider">Rank {`{quartile || 'Q1'}`}</span>
                      {/* Mapping cột: type */}
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-semibold capitalize">type: journal</span>
                      {/* Mapping cột: open_access */}
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">Open Access: Yes</span>
                      {/* Mapping cột: country */}
                      <span className="text-xs text-gray-400 font-medium">🌐 Quốc gia: United States</span>
                    </div>

                    {/* Mapping cột: name */}
                    <h3 className="text-base font-bold text-gray-900">Journal of Systems and Software</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 rounded-xl border border-gray-150 text-xs font-medium text-gray-600">
                      {/* Mapping cột: sjr */}
                      <div>📈 <b>SJR:</b> 1.42</div>
                      {/* Mapping cột: h_index */}
                      <div>🔥 <b>H-Index:</b> 125</div>
                      {/* Mapping cột: citations_per_doc */}
                      <div>💬 <b>Citations/Doc:</b> 4.15</div>
                      {/* Mapping cột: total_docs_3years */}
                      <div>📦 <b>Total Docs (3y):</b> 520</div>
                    </div>

                    <p className="text-xs text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                      {/* Mapping cột: issn */}
                      <span><b>🆔 ISSN:</b> 0164-1212</span>
                      <span>•</span>
                      {/* Mapping cột: subject_area & scope */}
                      <span><b>📂 Ngành (subject_area):</b> Computer Science</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 shrink-0">
                    <div className="text-xs text-gray-400 font-semibold mb-1 hidden lg:block">
                      {/* Hiển thị thứ hạng toàn cầu từ cột global_rank */}
                      Thứ hạng: #450 toàn cầu
                    </div>
                    {/* Mapping cột: journal_url */}
                    <a href="#" className="flex items-center justify-center gap-1.5 w-full lg:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 shadow-sm">
                      <FileText className="w-3.5 h-3.5" /> Xem trang Journal
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* =========================================================
          MODAL ĐĂNG KÝ ALERTS (ĐỒNG BỘ THEO DATA)
          ========================================================= */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <Bell className="w-6 h-6 fill-blue-100" />
              <h3 className="text-xl font-bold text-gray-900">Thiết lập bộ nhận tin (Alerts)</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Hệ thống sẽ gửi thông báo đẩy và email định kỳ cho bạn mỗi khi dữ liệu được Crawl mới có thuộc tính khớp với lựa chọn của bạn.
            </p>

            <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-150 mb-6">
              <div className="text-sm text-gray-700">
                • <b>Bộ lọc ngành:</b> {selectedArea === "all" ? "Tất cả các ngành" : selectedArea}
              </div>
              <div className="text-sm text-gray-700">
                • <b>Hạng lọc chọn:</b> {selectedRanks.length > 0 ? selectedRanks.join(", ") : "Tất cả các hạng uy tín"}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  setAlertEnabled(true);
                  setShowAlertModal(false);
                }}
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
              >
                Kích hoạt hệ thống đẩy tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}