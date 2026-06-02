"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/app/api/supabase/index";

// Cấu trúc dữ liệu hiển thị trên giao diện
interface NotificationItem {
  id: string;
  type: "cfp" | "message" | "request";

  is_read: boolean;
  created_at: string;

  cfp?: {
    title: string;
    cfp_url: string;
  } | null;

  content?: string;
}
export default function NotificationBell({ currentUserId }: { currentUserId: number }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // 1. Hàm quét DB kết hợp JOIN lấy toàn bộ thông báo cũ khi F5/Reload trang
  const fetchNotifications = async () => {
    if (!currentUserId) return;

    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id,
        is_read,
        created_at,
        cfp_id,
        cfp (
          title,
          cfp_url 
        )
      `)
      // 🌟 TỐI ƯU: Ép kiểu Number để chắc chắn khớp với kiểu dữ liệu BigInt trong Postgres
      .eq("user_id", Number(currentUserId))
      .order("created_at", { ascending: false });

    if (!error && data) {
  const mapped: NotificationItem[] = data.map(
    (item: any) => ({
      id: `cfp-${item.id}`,
      type: "cfp",

      is_read: item.is_read,
      created_at: item.created_at,

      cfp: item.cfp,
    })
  );

  setNotifications(mapped);
}
  };

  useEffect(() => {
    if (!currentUserId) return;

    // Lấy ngay dữ liệu cũ từ Database đổ vào giao diện khi vừa nạp trang
    fetchNotifications();

    // 2. Kênh lắng nghe Real-time tuyệt đối từ Supabase
    // 🌟 SỬA ĐỔI: Ép kiểu Number trực tiếp vào chuỗi string filter giúp luồng Real-time nhận diện chuẩn xác
    const userIdFilter = Number(currentUserId);
    
    const channel = supabase
      .channel(`user-notifications-${userIdFilter}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userIdFilter}`, // Lọc sự kiện INSERT đúng ID người dùng này
        },
        async (payload) => {
          // Khi có dòng dữ liệu thông báo mới tinh, kéo nhanh tiêu đề và url gốc từ bảng cfp về
          const { data: cfpData } = await supabase
            .from("cfp")
            .select("title, cfp_url")
            .eq("id", payload.new.cfp_id)
            .maybeSingle();

          const customCfp = cfpData as { title: string; cfp_url: string } | null;

          const newNotifWithCfp: NotificationItem = {
            id: `cfp-${payload.new.id}`,
            type: "cfp",

            is_read: payload.new.is_read,
            created_at: payload.new.created_at,

            cfp: customCfp,
          };
            // Nạp thông báo mới lên đầu danh sách hiển thị
          setNotifications((prev) => [newNotifWithCfp, ...prev]);
        }
      )
      .subscribe();

    // Dọn dẹp, hủy kết nối socket ngầm khi component bị unmount khỏi cây DOM
    return () => {
      supabase.removeChannel(channel);
    };

    
  }, [currentUserId]);
  useEffect(() => {
  if (!currentUserId) return;

  const channel = supabase
    .channel(`message-notifications-${currentUserId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      async (payload) => {
        const msg = payload.new as any;

        if (msg.receiver_id !== currentUserId) return;

                const { data: sender } = await supabase
          .from("users")
          .select("username")
          .eq("id", msg.sender_id)
          .single();

        const notif: NotificationItem = {
          id: `msg-${msg.id}`,
          type: "message",
          is_read: false,
          created_at: msg.created_at,
          content: `${sender?.username}: ${
            msg.content || "Sent a file"
          }`,
        };

        setNotifications((prev) => [
          notif,
          ...prev,
        ]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [currentUserId]);

useEffect(() => {
  if (!currentUserId) return;

  const channel = supabase
    .channel(`request-notifications-${currentUserId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "connections",
      },
      async (payload) => {
        const req = payload.new as any;

        if (
          req.receiver_id !== currentUserId ||
          req.status !== "pending"
        )
          return;

        const { data: sender } =
          await supabase
            .from("users")
            .select("username")
            .eq("id", req.sender_id)
            .single();

        const notif: NotificationItem = {
          id: `req-${req.id}`,
          type: "request",

          is_read: false,
          created_at: req.created_at,

          content:
            sender?.username ||
            "Someone sent you a request",
        };

        setNotifications((prev) => [
          notif,
          ...prev,
        ]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [currentUserId]);

  // 3. Xử lý click: Đánh dấu đã đọc ngầm trên DB + Bật tab mới sang WikiCFP
  const handleNotificationClick = async (
  e: React.MouseEvent,
  notif: NotificationItem
) => {
  e.preventDefault();

  setIsOpen(false);

  if (notif.type === "cfp") {
    const targetUrl =
      notif.cfp?.cfp_url ||
      "http://www.wikicfp.com";

    window.open(
      targetUrl,
      "_blank",
      "noopener,noreferrer"
    );

    const dbId = notif.id.replace(
      "cfp-",
      ""
    );

    await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", dbId);
  }

  if (notif.type === "message") {
    router.push("/connections");
  }

  if (notif.type === "request") {
    router.push("/connection-requests");
  }

  setNotifications((prev) =>
    prev.map((n) =>
      n.id === notif.id
        ? {
            ...n,
            is_read: true,
          }
        : n
    )
  );
};

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative inline-block text-left">
      {/* 🔔 Nút Biểu tượng Chiếc Chuông */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 transition focus:outline-none rounded-full hover:bg-gray-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📂 Khung danh sách thông báo Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-3 font-semibold border-b border-gray-100 text-sm text-gray-700 bg-gray-50 rounded-t-xl flex justify-between items-center">
            <span>Thông báo của bạn</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                {unreadCount} mới
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">Không có thông báo lĩnh vực nào.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={(e) => handleNotificationClick(e, notif)}
                  className={`p-3 border-b border-gray-50 text-left cursor-pointer transition-colors ${
                    notif.is_read ? "bg-white hover:bg-gray-50" : "bg-blue-50/60 hover:bg-blue-50"
                  }`}
                >
                  <div className="block">
                    <div className="flex items-center gap-1.5">

                        <p
                          className={`text-xs text-gray-900 ${
                            !notif.is_read
                              ? "font-semibold"
                              : "font-normal"
                          }`}
                        >
                          {notif.type === "cfp" &&
                            "🔔 Hội nghị tương thích mới"}

                          {notif.type === "message" &&
                            "💬 Tin nhắn mới"}

                          {notif.type === "request" &&
                            "🤝 Yêu cầu kết nối mới"}
                        </p>
                      {/* Chấm đỏ nhấp nháy động phân biệt bài chưa đọc */}
                      {!notif.is_read && (
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {notif.type === "cfp" &&
                          `Bài đăng "${
                            notif.cfp?.title || "Hội nghị"
                          }" vừa khớp lĩnh vực của bạn.`}

                        {notif.type === "message" &&
                          notif.content}

                        {notif.type === "request" &&
                          `${notif.content} muốn kết nối với bạn`}
                      </p>
                    <span className="text-[9px] text-gray-400 block mt-1">
                      {new Date(notif.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}