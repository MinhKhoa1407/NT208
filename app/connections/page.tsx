"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, UserMinus } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

type User = {
  id: number;
  username: string;
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

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const stored = localStorage.getItem("user");
      if (!stored) {
        setConnections([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(stored);
      const myId = Number(user.id);

      setUserId(myId);

      // =========================
      // 1. CONNECTIONS
      // =========================
      const { data, error } = await supabase
        .from("connections")
        .select(`
          id,
          sender_id,
          receiver_id,
          status,
          created_at,
          sender:users!fk_sender(id, username),
          receiver:users!fk_receiver(id, username)
        `)
        .eq("status", "accepted");

      if (error || !data) {
        console.error(error);
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

      // =========================
      // 2. REQUEST COUNT (badge)
      // =========================
      const { data: requests } = await supabase
        .from("connections")
        .select("id")
        .eq("status", "pending")
        .eq("receiver_id", myId);

      setRequestCount(requests?.length ?? 0);

      setLoading(false);
    };

    fetchData();
  }, []);

  const unfriend = async (id: number) => {
    await supabase.from("connections").delete().eq("id", id);
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-10">

        <div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Connections
          </h1>

          <p className="text-gray-500 mt-2">
            Your accepted collaborators
          </p>
        </div>

        <Link
          href="/connection-requests"
          className="text-blue-600 font-medium hover:underline transition"
        >
          View Requests
          {requestCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {requestCount}
            </span>
          )}
        </Link>

      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-500 animate-pulse">
          Loading connections...
        </p>
      )}

      {/* EMPTY */}
      {!loading && connections.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No connections yet 💬
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-5">

        {connections.map((c) => {
          const isMeSender = c.sender_id === userId;

          const otherUser = isMeSender ? c.receiver : c.sender;

          const name =
            otherUser?.username ??
            (isMeSender ? c.receiver_id : c.sender_id);

          return (
            <div
              key={c.id}
              className="
                bg-white border rounded-2xl p-5 shadow-sm
                hover:shadow-lg transition
                flex justify-between items-center
              "
            >

              {/* LEFT */}
              <div className="flex items-center gap-4">

                {/* avatar giống request UI */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {otherUser?.username?.[0]?.toUpperCase() || "?"}
                </div>

                <div>
                  <div className="font-semibold text-gray-900">
                    {name}
                  </div>

                  <div className="text-sm text-gray-500">
                    Connected • {new Date(c.created_at).toLocaleDateString()}
                  </div>

                  <div className="text-xs text-green-600 font-medium mt-1">
                    ● Connected
                  </div>
                </div>

              </div>

              {/* RIGHT */}
              <div className="flex gap-2">

                <Link
                  href={`/messages/${c.id}`}
                  className="
                    flex items-center gap-1
                    bg-blue-500 hover:bg-blue-600
                    text-white px-3 py-1.5 rounded-lg text-sm transition
                  "
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Link>

                <button
                  onClick={() => unfriend(c.id)}
                  className="
                    flex items-center gap-1
                    bg-red-500 hover:bg-red-600
                    text-white px-3 py-1.5 rounded-lg text-sm transition
                  "
                >
                  <UserMinus className="w-4 h-4" />
                  Unfriend
                </button>

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}