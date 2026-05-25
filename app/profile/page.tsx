"use client";

import { useState, useEffect, useRef } from "react";
import { FaUser, FaBuilding, FaFileAlt, FaEnvelope, FaBell, FaSave, FaCamera, FaSpinner } from "react-icons/fa";

// Danh sách các lĩnh vực học thuật lớn cố định để user tích chọn (phục vụ thông báo)
const ACADEMIC_AREAS = [
  "Computer Science",
  "Network & Communications",
  "Information Security",
  "Software Engineering",
  "Artificial Intelligence",
  "Data Science",
];

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State quản lý trạng thái đang upload file ảnh của UI
  const [uploading, setUploading] = useState(false);

  // Dùng useRef để kích hoạt sự kiện mở folder của input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 1. Lấy thông tin user đã đăng nhập từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);
      fetchUserProfile(parsedUser.id);
    } else {
      alert("Vui lòng đăng nhập để xem trang hồ sơ!");
      window.location.href = "/auth/login";
    }
  }, []);

  // 2. Fetch dữ liệu profile chi tiết từ Supabase thông qua Route API
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
    } finally {
      setLoading(false);
    }
  };

  // HÀM UI: BẮT SỰ KIỆN CHỌN FILE VÀ GỬI ĐẾN BACK-END QUA FORMDATA
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      // Đóng gói file ảnh vào đối tượng FormData chuẩn để truyền qua API
      const formData = new FormData();
      formData.append("avatar", file);
      if (userId) {
        formData.append("userId", String(userId));
      }
      if (username) {
      formData.append("username", username);
    }

      // Gửi request lên API xử lý File ảnh của Back-end
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData, 
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload ảnh thất bại từ Back-end");

      // Back-end xử lý thành công và trả về URL ảnh mới kèm cache-buster để ép render lại ảnh
      const freshUrl = `${data.avatarUrl}?t=${Date.now()}`;
      setAvatarUrl(freshUrl);
      alert("Tải ảnh lên thành công! Đừng quên bấm Save Profile để lưu thay đổi.");

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra trong quá trình truyền file");
    } finally {
      setUploading(false);
    }
  };

  // 3. Xử lý khi user tích chọn/bỏ chọn Lĩnh vực quan tâm
  const handleAreaChange = (area: string) => {
    if (interestedAreas.includes(area)) {
      setInterestedAreas(interestedAreas.filter((a) => a !== area));
    } else {
      setInterestedAreas([...interestedAreas, area]);
    }
  };

  // 4. Submit cập nhật profile lên DB
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

      // Cập nhật lại cả dữ liệu hiển thị nhanh trong localStorage
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

  // Khởi tạo link fallback an toàn phòng trường hợp chuỗi URL rỗng
  const displayAvatarUrl = avatarUrl && avatarUrl.trim() !== "" 
  ? (avatarUrl.includes("?t=") ? avatarUrl : `${avatarUrl}?t=${Date.now()}`) 
  : "https://placehold.co/150";
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-8 select-none">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3">
        
        {/* CỘT TRÁI: AVATAR & THÔNG TIN ĐỌC CHỈ ĐỊNH (READ-ONLY) */}
        <div className="bg-gradient-to-b from-blue-600 to-indigo-700 p-8 text-white flex flex-col items-center justify-center text-center">
          
          {/* KHU VỰC AVATAR CÓ HOVER EFFECT VÀ CLICK KÍCH HOẠT INPUT FILE */}
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="group relative w-32 h-32 mb-3 rounded-full overflow-hidden border-4 border-white shadow-inner bg-white flex items-center justify-center cursor-pointer"
            title="Nhấp vào để đổi ảnh đại diện"
          >
            {uploading ? (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-xs text-white">
                <FaSpinner className="animate-spin text-xl mb-1" />
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <img 
                  src={displayAvatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <FaCamera className="text-xl text-white" />
                </div>
              </>
            )}
          </div>

          {/* THÀNH PHẦN INPUT FILE ẨN - CHỈ NHẬN FILE ẢNH */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
            className="hidden"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
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

          {/* 1. Thông tin cơ bản */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaUser className="text-blue-500" /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaBuilding className="text-blue-500" /> Affiliation
              </label>
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="University of Information Technology (UIT)"
                className="w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Avatar URL (Auto-generated by upload)</label>
            <input
              type="text"
              value={avatarUrl}
              readOnly
              placeholder="Đường dẫn ảnh sẽ tự điền sau khi upload..."
              className="w-full p-2.5 border rounded-lg bg-gray-100 text-sm text-gray-500 font-mono focus:outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaFileAlt className="text-blue-500" /> Biography (Bio)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your research path..."
              rows={3}
              className="w-full p-2.5 border rounded-lg bg-gray-50 focus:outline-none focus:bg-white focus:border-blue-500 transition text-sm"
            />
          </div>

          {/* 2. CHỌN LĨNH VỰC QUAN TÂM */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              📌 Fields of Interest (For Alerts)
            </h3>
            <p className="text-xs text-gray-500 mb-3">Chọn các ngành bạn muốn hệ thống đẩy thông báo khi có Call for Papers mới.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACADEMIC_AREAS.map((area) => {
                const isChecked = interestedAreas.includes(area);
                return (
                  <label
                    key={area}
                    className={`flex items-center gap-3 p-2.5 border rounded-xl cursor-pointer transition select-none ${
                      isChecked 
                        ? "bg-blue-50 border-blue-400 text-blue-700 font-medium shadow-sm" 
                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAreaChange(area)}
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm">{area}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. CÀI ĐẶT NHẬN THÔNG BÁO */}
          <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaEnvelope className="text-gray-600" /> Email Notifications
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyViaEmail}
                  onChange={(e) => setNotifyViaEmail(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm text-gray-700 font-medium">Nhận bản tin CfP qua Email</span>
              </label>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaBell className="text-gray-600" /> In-App Alerts (Web)
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyViaWeb}
                  onChange={(e) => setNotifyViaWeb(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm text-gray-700 font-medium">Hiện chuông báo trên web</span>
              </label>
            </div>
          </div>

          {/* NÚT SAVE */}
          <div className="border-t pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave /> {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}