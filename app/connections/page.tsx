"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { MessageCircle, UserMinus, X, Send, Paperclip } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

type User = {
  id: number;
  email?: string;
  username?: string;
};

type Connection = {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: string;
  created_at: string;
  sender?: User;
  receiver?: User;
};

type ChatMessage = {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  file_url?: string;
  file_name?: string;
  is_read?: boolean;
  created_at: string;
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState(0);
const [unreadMap, setUnreadMap] = useState<
  Record<number, number>
>({});
const [toast, setToast] = useState("");

  const [openChat, setOpenChat] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  useEffect(() => {
  if (!openChat || !userId) return;

  const otherId =
    openChat.sender_id === userId
      ? openChat.receiver_id
      : openChat.sender_id;

  const channel = supabase
    .channel(`chat-${userId}-${otherId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const newMsg = payload.new as ChatMessage;

        if (
          (newMsg.sender_id === userId &&
            newMsg.receiver_id === otherId) ||
          (newMsg.sender_id === otherId &&
            newMsg.receiver_id === userId)
        ) {
          setMessages((prev) => {
            const exists = prev.some(
              (m) => m.id === newMsg.id
            );

            if (exists) return prev;

            return [...prev, newMsg];
          });
        }
      }
    )
    .subscribe((status) => {
  console.log("REALTIME STATUS:", status);
});

  return () => {
    supabase.removeChannel(channel);
  };
}, [openChat, userId]);

useEffect(() => {
  if (!userId) return;

  const channel = supabase
    .channel(`notify-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      
      (payload) => {
        const msg = payload.new as ChatMessage;

        if (msg.receiver_id !== userId) return;

        const chatOpen =
          openChat &&
          (
            (openChat.sender_id === msg.sender_id &&
              openChat.receiver_id === msg.receiver_id) ||
            (openChat.sender_id === msg.receiver_id &&
              openChat.receiver_id === msg.sender_id)
          );

        if (chatOpen) return;


setUnreadMap((prev) => ({
  ...prev,
  [msg.sender_id]:
    (prev[msg.sender_id] || 0) + 1,
}));

setToast("📩 New message received");

        setTimeout(() => {
          setToast("");
        }, 3000);
      }
    )
    .subscribe((status) => {
      console.log("NOTIFY STATUS:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [userId, openChat]);

  const [otherUserOnline, setOtherUserOnline] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
const messagesEndRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const stored = localStorage.getItem("user");
      if (!stored) {
  setLoading(false);
  return;
}

      const user = JSON.parse(stored);
      const myId = Number(user.id);

      setUserId(myId);

      const { data, error } = await supabase
        .from("connections")
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          created_at,
          sender:users!fk_sender(id, username, email),
          receiver:users!fk_receiver(id, username, email)
        `)
        .eq("status", "accepted");

      if (error || !data) {
        setConnections([]);
        setLoading(false);
        return;
      }

      const normalized: Connection[] = data.map((c) => ({
        id: c.id,
        sender_id: Number(c.sender_id),
        receiver_id: Number(c.receiver_id),
        status: c.status,
        created_at: c.created_at,
        sender: Array.isArray(c.sender) ? c.sender[0] : c.sender,
        receiver: Array.isArray(c.receiver) ? c.receiver[0] : c.receiver,
      }));

      const filtered = normalized.filter(
        (c) => c.sender_id === myId || c.receiver_id === myId
      );

      setConnections(filtered);

      const { data: req } = await supabase
        .from("connections")
        .select("id")
        .eq("status", "pending")
        .eq("receiver_id", myId);

      setRequestCount(req?.length ?? 0);

      setLoading(false);
    };

    fetchData();
  }, []);

  

  // ===== FIX NAME SAFE =====
  const getName = (c: Connection) => {
    if (!userId) return "Unknown";

    const isMeSender = c.sender_id === userId;
    const raw = isMeSender ? c.receiver : c.sender;

    const u = Array.isArray(raw) ? raw[0] : raw;

    return (
      u?.username ||
      u?.email ||
      String(isMeSender ? c.receiver_id : c.sender_id)
    );
  };

  // ===== OPEN CHAT =====
  const openChatBox = async (c: Connection) => {

    setOpenChat(c);

    const myId = userId!;
    const otherId =
      c.sender_id === myId ? c.receiver_id : c.sender_id;

      setUnreadMap((prev) => ({
  ...prev,
  [otherId]: 0,
}));

    const { data: otherUser } = await supabase
      .from("users")
      .select("is_online")
      .eq("id", otherId)
      .single();

      setOtherUserOnline(
      otherUser?.is_online ?? false
);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${myId})`
      )
      .order("created_at", { ascending: true });

    setMessages(data || []);

    await supabase
      .from("messages")
      .update({
        is_read: true
      })
      .eq("sender_id", otherId)
      .eq("receiver_id", myId)
      .eq("is_read", false);
  };

  // ===== SEND MESSAGE FIXED =====
  const sendMessage = async () => {
    if (!text.trim() || !openChat || !userId) return;

    const receiverId =
      openChat.sender_id === userId
        ? openChat.receiver_id
        : openChat.sender_id;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: userId,
        receiver_id: receiverId,
        content: text,
      })
      .select()
      .single();

    if (error) {
      console.error("SEND MESSAGE ERROR:", error);
      return;
    }

    
    setText("");
  };

  // ===== ENTER TO SEND =====
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // ===== FILE UPLOAD SIMPLE =====
  const uploadFile = async (file: File) => {
  if (!openChat || !userId) return;

  const receiverId =
    openChat.sender_id === userId
      ? openChat.receiver_id
      : openChat.sender_id;

  const fileName = `${Date.now()}-${file.name}`;

  // 1. upload file
  const { error: uploadError } = await supabase.storage
    .from("chat-files")
    .upload(fileName, file);

  if (uploadError) {
    console.error("UPLOAD ERROR:", uploadError);
    return;
  }

  // 2. get public url
  const { data } = supabase.storage
    .from("chat-files")
    .getPublicUrl(fileName);

  const fileUrl = data.publicUrl;

  // 3. insert message
  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      sender_id: userId,
      receiver_id: receiverId,
      content: "", // file message thì để rỗng
      file_url: fileUrl,
      file_name: file.name,
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    console.error("SEND FILE MESSAGE ERROR:", error);
    return;
  }

};

  const unfriend = async (id: number) => {
    await supabase.from("connections").delete().eq("id", id);
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  return (
  <>
    {toast && (
      <div
        className="
          fixed
          top-6
          right-6
          z-50
          bg-white
          border-l-4
          border-blue-500
          shadow-xl
          rounded-xl
          px-4
          py-3
          animate-bounce
        "
      >
        <div className="font-semibold text-gray-800">
          New Message
        </div>

        <div className="text-sm text-gray-500">
          {toast}
        </div>
      </div>
    )}

    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">

      {/* HEADER (GIỮ NGUYÊN) */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-3">
  <h1 className="text-5xl font-extrabold text-blue-600">
    Connections
  </h1>
</div>
          <p className="text-gray-500 mt-2">
            Your accepted collaborators
          </p>
        </div>

        <Link
  href="/connection-requests"
  className="
    text-blue-600
    font-medium
    hover:underline
    flex
    items-center
  "
>
  View Requests 

  {requestCount > 0 && (
    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
      {requestCount}
    </span>
  )}
</Link>
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-5">
          {connections.map((c) => (
            <div
              key={c.id}
              className="bg-white border rounded-2xl p-5 shadow-sm flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {getName(c)[0]?.toUpperCase()}
                </div>

                <div>
                  <div className="font-semibold">{getName(c)}</div>

                  <div className="text-sm text-gray-500">
                    Connected • {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                      <button
                            onClick={() => openChatBox(c)}
                            className="
                              bg-blue-500
                              hover:bg-blue-600
                              text-white
                              px-3
                              py-1.5
                              rounded-lg
                              flex
                              items-center
                              gap-1
                            "
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </button>

                          {(() => {
                            const otherId =
                              c.sender_id === userId
                                ? c.receiver_id
                                : c.sender_id;

                            const count =
                              unreadMap[otherId] || 0;

                            return count > 0 ? (
                              <span
                                className="
                                  absolute
                                  -top-2
                                  -right-2
                                  bg-red-500
                                  text-white
                                  text-xs
                                  min-w-[20px]
                                  h-5
                                  px-1
                                  rounded-full
                                  flex
                                  items-center
                                  justify-center
                                  font-bold
                                "
                              >
                                {count}
                              </span>
                            ) : null;
                          })()}
                        </div>

                <button
                  onClick={() => unfriend(c.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <UserMinus className="w-4 h-4" />
                  Unfriend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CHAT POPUP (FIXED UI + BEAUTY) ================= */}
      {openChat && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{getName(openChat)}</h3>
                <span
                  className={`w-2 h-2 rounded-full ${
                    otherUserOnline
                    ? "bg-green-400 animate-pulse"
                    : "bg-gray-400"
                }`}
                />
              </div>
              <p className="text-xs text-blue-100">
                  {otherUserOnline
                    ? "Online"
                    : "Offline"}
              </p>
            </div>

            <button onClick={() => setOpenChat(null)}>
              <X />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-2">
            {messages.map((m) => {
  const isMe = m.sender_id === userId;

  return (
  <div
    key={m.id}
    className={`flex flex-col ${
      isMe ? "items-end" : "items-start"
    }`}
  >
      {/* TEXT MESSAGE */}
      {m.content && (
  <div
    className={`flex flex-col ${
      isMe ? "items-end" : "items-start"
    }`}
  >
    <div
      className={`
        inline-block
        w-fit
        min-w-[80px]
        max-w-[75%]
        px-4 py-2
        rounded-2xl
        text-sm
        break-words
        shadow-sm
        ${
          isMe
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white border text-gray-800 rounded-bl-sm"
        }
      `}
    >
      {m.content}
    </div>

    {isMe && (
      <span className="text-[10px] text-gray-400 mt-1">
        {m.is_read ? "Seen" : "Delivered"}
      </span>
    )}
  </div>
)}
      {/* FILE MESSAGE (CARD STYLE) */}
      {m.file_url && (
  <>
    {/\.(jpg|jpeg|png|gif|webp)$/i.test(
      m.file_name || ""
    ) ? (
      <div
        className={`
          rounded-2xl
          overflow-hidden
          shadow-sm
          border
          ${
            isMe
              ? "border-blue-200"
              : "border-gray-200"
          }
        `}
      >
        <img
          src={m.file_url}
          alt={m.file_name}
          className="
            max-w-[220px]
            max-h-[220px]
            object-cover
            block
          "
        />
      </div>
    ) : (
      <a
        href={m.file_url}
        target="_blank"
        rel="noreferrer"
        className={`
          max-w-[75%]
          flex items-center gap-3
          px-4 py-3
          rounded-2xl
          shadow-sm
          border
          text-sm
          transition
          hover:shadow-md
          ${
            isMe
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-gray-100 border-gray-200 text-gray-700"
          }
        `}
      >

        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[180px]">
            {m.file_name}
          </span>

          <span className="text-xs opacity-70">
            Click to open file
          </span>
        </div>
      </a>
    )}
  </>
)}
    </div>
  );
})}
<div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-t p-3 flex gap-2 items-center">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 border rounded-xl px-3 py-2 text-sm"
              placeholder="Type message..."
            />

            <input
              type="file"
              ref={fileRef}
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) uploadFile(e.target.files[0]);
              }}
            />

            <button
              onClick={() => fileRef.current?.click()}
              className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center"
            >
              <Paperclip size={16} />
            </button>

            <button
              onClick={sendMessage}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-xl text-white flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}
    </div>
    </>
  );
}