"use client";

import { useState, useEffect, useRef } from "react";
import { FaUser, FaBuilding, FaFileAlt, FaEnvelope, FaBell, FaSave, FaCamera, FaSpinner, FaSearch, FaPlus, FaTimes } from "react-icons/fa";

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🌟 STATE MỚI: QUẢN LÝ POPUP XEM TOÀN ẢNH AVATAR
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // State quản lý danh sách lĩnh vực động từ DB & input tìm kiếm
  const [academicAreas, setAcademicAreas] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Các state tương ứng với các thuộc tính trong DB
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [bio, setBio] = useState("");
  const [interestedAreas, setInterestedAreas] = useState<string[]>([]);
  const [notifyViaEmail, setNotifyViaEmail] = useState(true);
  const [notifyViaWeb, setNotifyViaWeb] = useState(true);

  // 1. Lấy thông tin user & danh sách ngành khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);
      
      Promise.all([
        fetchUserProfile(parsedUser.id),
        fetchDynamicAreas()
      ]).finally(() => setLoading(false));
    } else {
      alert("Vui lòng đăng nhập để xem trang hồ sơ!");
      window.location.href = "/auth/login";
    }
  }, []);

  // Click ra ngoài thì ẩn hộp gợi ý danh sách đi
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Tải danh sách các ngành học thuật động từ DB
  const fetchDynamicAreas = async () => {
    try {
      const res = await fetch("/api/profile/areas");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.areas) {
        setAcademicAreas(data.areas);
      }
    } catch (error) {
      console.error("Không thể load danh sách ngành từ DB, dùng mảng dự phòng.");
      setAcademicAreas(["Computer Science", "Network & Communications", "Information Security", "Software Engineering", "Artificial Intelligence", "Data Science"]);
    }
  };

  // Fetch dữ liệu profile chi tiết từ Supabase
  const fetchUserProfile = async (id: string | number) => {
    try {
      const res = await fetch(`/api/profile/user?id=${id}`);
      if (!res.ok) throw new Error("Không thể tải thông tin profile");
      const data = await res.json();
      if (data.user) {
        setUsername(data.user.username || "");
        setEmail(data.user.email || "");
        setFullName(data.user.full_name || "");
        setAvatarUrl(data.user.avatar_url || "");
        setAffiliation(data.user.affiliation || "");
        setBio(data.user.bio || "");
        setInterestedAreas(data.user.interested_areas || []);
        setNotifyViaEmail(data.user.notify_via_email ?? true);
        setNotifyViaWeb(data.user.notify_via_web ?? true);
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi lấy dữ liệu profile");
    }
  };

  // Xử lý khi gõ chữ vào ô input để tìm kiếm gợi ý
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = academicAreas.filter(
      (area) =>
        area.toLowerCase().includes(value.toLowerCase()) &&
        !interestedAreas.includes(area)
    );
    setSuggestions(filtered.slice(0, 6)); // Giới hạn 6 gợi ý tốt nhất
  };

  // Hàm thêm ngành
  const handleAddArea = (areaToAdd: string) => {
    const trimmed = areaToAdd.trim();
    if (!trimmed) return;

    if (interestedAreas.includes(trimmed)) {
      alert("Lĩnh vực này đã có trong danh sách quan tâm của bạn!");
      return;
    }

    setInterestedAreas([...interestedAreas, trimmed]);
    setInputValue("");
    setSuggestions([]);
  };

  // Hàm xóa ngành
  const handleRemoveArea = (areaToRemove: string) => {
    setInterestedAreas(interestedAreas.filter((a) => a !== areaToRemove));
  };

  // Bắt sự kiện File ảnh đại diện
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      if (userId) formData.append("userId", String(userId));
      if (username) formData.append("username", username);

      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload ảnh thất bại");

      const freshUrl = `${data.avatarUrl}?t=${Date.now()}`;
      setAvatarUrl(freshUrl);
      alert("Tải ảnh lên thành công! Đừng quên bấm Save Profile để lưu thay đổi.");
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra trong quá trình truyền file");
    } finally {
      setUploading(false);
    }
  };

  // Submit form cập nhật lên database
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      const res = await fetch("/api/profile/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          full_name: fullName,
          avatar_url: avatarUrl,
          affiliation,
          bio,
          interested_areas: interestedAreas,
          notify_via_email: notifyViaEmail,
          notify_via_web: notifyViaWeb,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cập nhật thất bại");

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.full_name = fullName;
        u.avatar_url = avatarUrl;
        localStorage.setItem("user", JSON.stringify(u));
      }

      alert("Cập nhật thông tin hồ sơ thành công!");
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600 font-medium select-none">
        Loading Profile Data...
      </div>
    );
  }

  const displayAvatarUrl = avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : "https://placehold.co/150";

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-8 select-none">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3">
        
        {/* CỘT TRÁI: READ-ONLY INFO & AVATAR ACTIONS */}
        <div className="bg-gradient-to-b from-blue-600 to-indigo-700 p-8 text-white flex flex-col items-center justify-center text-center">
          
          {/* 🌟 KHU VỰC KHUNG AVATAR: CLICK VÀO ĐỂ PREVIEW XEM TOÀN ẢNH */}
          <div 
            onClick={() => setIsPreviewOpen(true)}
            className="group relative w-32 h-32 mb-3 rounded-full overflow-hidden border-4 border-white shadow-inner bg-white flex items-center justify-center cursor-pointer"
            title="Nhấp vào để xem ảnh lớn"
          >
            {uploading ? (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-xs text-white">
                <FaSpinner className="animate-spin text-xl mb-1" />
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <img src={displayAvatarUrl} alt="Avatar" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <span className="text-xs bg-black/40 px-2 py-1 rounded-md text-white font-medium">View Photo</span>
                </div>
              </>
            )}
          </div>

          {/* INPUT FILE ẨN */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg, image/gif, image/webp" className="hidden" />

          {/* 🌟 NÚT ĐỔI ẢNH RIÊNG BIỆT: CHỈ KHI BẤM NÚT NÀY MỚI LÊN MỞ FOLDER CHỌN FILE */}
          <button 
            type="button" 
            disabled={uploading} 
            onClick={(e) => {
              e.stopPropagation(); // Ngăn sự kiện nổi bọt kích hoạt mở preview ảnh
              fileInputRef.current?.click();
            }} 
            className="mb-4 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <FaCamera /> Change Photo
          </button>

          <h2 className="text-2xl font-bold mb-1">{fullName || "Chưa đặt tên"}</h2>
          <p className="text-blue-100 text-sm mb-4">@{username || "username"}</p>
          <div className="w-full border-t border-blue-400/30 my-2 pt-3 text-left text-xs text-blue-100 space-y-1">
            <p><strong>Email:</strong> {email}</p>
            <p><strong>ID Hệ thống:</strong> {userId}</p>
          </div>
        </div>

        {/* CỘT PHẢI: FORM CHỈNH SỬA THÔNG TIN */}
        <form onSubmit={handleSaveProfile} className="col-span-2 p-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 border-b pb-3">Edit Academic Profile</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaUser className="text-blue-500" /> Full Name
              </label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" className="w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500 transition" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaBuilding className="text-blue-500" /> Affiliation
              </label>
              <input type="text" value={affiliation} onChange={(e) => setAffiliation(e.target.value)} placeholder="University of Information Technology (UIT)" className="w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500 transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar URL</label>
            <input type="text" value={avatarUrl} readOnly placeholder="Đường dẫn ảnh định dạng CDN..." className="w-full p-2.5 border rounded-lg bg-gray-100 text-sm text-gray-500 font-mono focus:outline-none cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaFileAlt className="text-blue-500" /> Biography (Bio)
            </label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about your research path..." rows={3} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500 transition text-sm" />
          </div>

          {/* CHỌN LĨNH VỰC BẰNG INPUT & SUGGESTION */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
              📌 Fields of Interest (For Alerts)
            </h3>
            <p className="text-xs text-gray-500 mb-3">Nhập từ khóa ngành nghiên cứu (lấy từ database Conferences) để thêm vào danh sách nhận alert.</p>
            
            <div ref={suggestionRef} className="relative flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-3.5 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  placeholder="Ví dụ: Computer Science, Network, Technology..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500 text-sm transition shadow-sm"
                />

                {isFocused && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-gray-50 animate-fadeIn">
                    {suggestions.map((area) => (
                      <div
                        key={area}
                        onClick={() => handleAddArea(area)}
                        className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition flex items-center justify-between"
                      >
                        <span>{area}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Phù hợp</span>
                      </div>
                    ))}
                  </div>
                )}

                {isFocused && inputValue.trim() !== "" && suggestions.length === 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-md p-3 text-xs text-center text-gray-400 z-50">
                    Không tìm thấy lĩnh vực này trong DB. Bạn vẫn có thể bấm nút "Add" bên cạnh để tự thêm mới.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleAddArea(inputValue)}
                disabled={inputValue.trim() === ""}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:cursor-not-allowed"
              >
                <FaPlus className="text-xs" /> Add
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Lĩnh vực bạn đang theo dõi ({interestedAreas.length}):</p>
              {interestedAreas.length === 0 ? (
                <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-dashed text-center">Chưa có lĩnh vực nào được chọn. Hãy tìm kiếm ở trên!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {interestedAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm animate-scaleIn"
                    >
                      {area}
                      <button type="button" onClick={() => handleRemoveArea(area)} className="text-blue-400 hover:text-blue-600 transition focus:outline-none">
                        <FaTimes className="text-[10px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CÀI ĐẶT NHẬN THÔNG BÁO */}
          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaEnvelope className="text-gray-600" /> Email Notifications
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifyViaEmail} onChange={(e) => setNotifyViaEmail(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm text-gray-700 font-medium">Nhận bản tin CfP qua Email</span>
              </label>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaBell className="text-gray-600" /> In-App Alerts (Web)
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notifyViaWeb} onChange={(e) => setNotifyViaWeb(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm text-gray-700 font-medium">Hiện chuông báo trên web</span>
              </label>
            </div>
          </div>

          {/* NÚT SAVE */}
          <div className="border-t pt-4 flex justify-end">
            <button type="submit" disabled={saving || uploading} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <FaSave /> {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>

      </div>

      {/* 🌟 MODAL PREVIEW TOÀN MÀN HÌNH CHỈ HIỂN THỊ KHI ISPREVIEWOPEN === TRUE */}
      {isPreviewOpen && (
        <div 
          onClick={() => setIsPreviewOpen(false)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-xl bg-white p-2 shadow-2xl flex flex-col items-center">
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
            >
              <FaTimes />
            </button>
            <img 
              src={displayAvatarUrl} 
              alt="Avatar Full View" 
              className="max-w-full max-h-[75vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()} // Click vào chính bức ảnh không bị đóng modal
            />
            <p className="text-gray-500 text-xs mt-2 font-medium">@{username || "username"} - Academic Profile Photo</p>
          </div>
        </div>
      )}
    </div>
  );
}