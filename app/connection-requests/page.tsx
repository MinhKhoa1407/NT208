"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";

type User = {
  id: number;
  full_name: string;
  username: string;
  affiliation: string;
};

type ConnectionRequest = {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: "pending" | "accepted";
  created_at: string;
  sender?: User;
};

export default function ConnectionRequestsPage() {
  const [requests, setRequests] =
    useState<ConnectionRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fetchRequests =
    async () => {
      try {
        const currentUser = JSON.parse(
          localStorage.getItem("user") ||
            "{}"
        );

        const {
          data: connectionData,
          error: connectionError,
        } = await supabase
          .from("connections")
          .select("*")
          .eq(
            "receiver_id",
            currentUser.id
          )
          .eq(
            "status",
            "pending"
          );

        if (connectionError) {
          console.error(
            connectionError
          );
          return;
        }

        if (
          !connectionData ||
          connectionData.length === 0
        ) {
          setRequests([]);
          return;
        }

        const senderIds =
          connectionData.map(
            (c) => c.sender_id
          );

        const {
          data: usersData,
          error: usersError,
        } = await supabase
          .from("users")
          .select(`
            id,
            full_name,
            username,
            affiliation
          `)
          .in(
            "id",
            senderIds
          );

        if (usersError) {
          console.error(usersError);
          return;
        }

        const merged =
          connectionData.map(
            (request) => ({
              ...request,
              sender:
                usersData?.find(
                  (u) =>
                    u.id ===
                    request.sender_id
                ),
            })
          );

        setRequests(
          merged as ConnectionRequest[]
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept =
    async (
      connectionId: number
    ) => {
      const { error } =
        await supabase
          .from("connections")
          .update({
            status:
              "accepted",
          })
          .eq(
            "id",
            connectionId
          );

      if (error) {
        console.error(error);
        return;
      }

      fetchRequests();
    };

  const handleReject =
    async (
      connectionId: number
    ) => {
      const { error } =
        await supabase
          .from("connections")
          .delete()
          .eq(
            "id",
            connectionId
          );

      if (error) {
        console.error(error);
        return;
      }

      fetchRequests();
    };

  return (
    <div
  className="
  min-h-screen
  bg-gradient-to-br
  from-slate-50
  to-blue-50
  p-8
  "
>
    
  <div className="mb-10">
        <Link
        href="/connections"
        className="
        text-blue-600
        font-medium
        hover:underline
        "
        >
        ← Back to Connections
        </Link>

    <h1
      className="
      text-5xl
      font-extrabold
      bg-gradient-to-r
      from-blue-600
      to-indigo-600
      bg-clip-text
      text-transparent
      "
    >
      Connection Requests
    </h1>

    <p
      className="
      text-gray-600
      mt-3
      text-lg
      "
    >
      Manage incoming collaboration requests
    </p>
  </div>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow">
          No pending requests.
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map(
            (request) => (
              <div
                key={request.id}
                className="
                 bg-white
                    rounded-3xl
                    p-6
                    shadow-md
                    hover:shadow-2xl
                    transition
                    border
                    border-blue-50
                "
              >
                <div className="flex items-center gap-4">
  <div
    className="
    w-16
    h-16
    rounded-full
    bg-blue-100
    flex
    items-center
    justify-center
    text-3xl
    "
  >
    👤
  </div>

  <div>
    <h2 className="text-xl font-bold">
      {request.sender?.full_name}
    </h2>

    <p className="text-blue-600">
      @{request.sender?.username}
    </p>

    <p className="text-gray-500 text-sm mt-1">
      {request.sender?.affiliation}
    </p>
  </div>
</div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() =>
                      handleAccept(
                        request.id
                      )
                    }
                    className="
                      px-5
                      py-2
                      rounded-xl
                      bg-green-600
                      text-white
                    "
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      handleReject(
                        request.id
                      )
                    }
                    className="
                      px-5
                      py-2
                      rounded-xl
                      bg-red-500
                      text-white
                    "
                  >
                    Reject
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}