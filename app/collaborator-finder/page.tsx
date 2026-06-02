"use client";

import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";

import ResearcherCard from "./components/ResearcherCard";
import SearchResearcher from "./components/SearchResearcher";

import type { Researcher } from "./types/researcher";

type ResearcherDB = {
  id: number;
  name: string;
  field: string;
  university: string;
  papers: number;
  match: number;
  avatar: string | null;
  researcher_skills: {
    skill: string;
  }[];
};

type RealUser = {
  id: number;
  username: string;
  full_name: string;
  affiliation: string;
  interested_areas: string[];
  avatar_url: string | null;
};

type Connection = {
  id: number;
  sender_id: number;
  receiver_id: number;
  status:
    | "pending"
    | "accepted";
  created_at: string;
};

export default function CollaboratorFinderPage() {
  const [search, setSearch] =
    useState("");

  const [researchers, setResearchers] =
    useState<Researcher[]>([]);

  const [realUsers, setRealUsers] =
    useState<RealUser[]>([]);

  const [loading, setLoading] =
    useState(false);

    const [connections, setConnections] =
  useState<Connection[]>([]);

    const handleConnect = async (
  receiverId: number
) => {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const { data, error } =
    await supabase
      .from("connections")
      .insert({
        sender_id: currentUser.id,
        receiver_id: receiverId,
        status: "pending",
      })
      .select();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Connection request sent!");
};

const getConnectionStatus = (
  userId: number
) => {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  return connections.find(
    (c) =>
      (c.sender_id === currentUser.id &&
        c.receiver_id === userId) ||
      (c.receiver_id === currentUser.id &&
        c.sender_id === userId)
  );
};

const getButtonInfo = (
  userId: number
) => {

  const connection =
    getConnectionStatus(userId);

  if (!connection) {
    return {
      text: "Connect",
      className:
        "bg-gradient-to-r from-blue-500 to-indigo-600",
      disabled: false,
    };
  }

  if (
    connection.status ===
    "accepted"
  ) {
    return {
      text: "Connected",
      className:
        "bg-green-600",
      disabled: true,
    };
  }

  return {
    text: "Pending",
    className:
      "bg-yellow-500",
    disabled: true,
  };
};

  // =========================
  // FETCH DATA
  // =========================
  const fetchData =
    async (): Promise<void> => {
      try {
        setLoading(true);

        const currentUser = JSON.parse(
  localStorage.getItem("user") || "{}"
);

const { data: connectionData } =
  await supabase
    .from("connections")
    .select("*")
    .or(
      `sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`
    );

setConnections(
  connectionData || []
);

        // =========================
        // REAL USERS
        // =========================
        const {
          data: usersData,
          error: usersError,
        } = await supabase
          .from("users")
          .select(`
            id,
            username,
            full_name,
            affiliation,
            interested_areas,
            avatar_url
          `);

        if (usersError) {
          console.error(
            "Users Error:",
            usersError
          );
        } else {
          setRealUsers(
            usersData || []
          );
        }

        // =========================
        // FAKE RESEARCHERS
        // =========================
        const {
          data: researcherData,
          error: researcherError,
        } = await supabase
          .from("researchers")
          .select(`
            *,
            researcher_skills (
              skill
            )
          `);

        if (researcherError) {
          console.error(
            "Researcher Error:",
            researcherError
          );
        } else {
          const typedData =
            researcherData as
              | ResearcherDB[]
              | null;

          const formatted:
            Researcher[] =
            (
              typedData || []
            ).map((r) => ({
              id: r.id,
              name: r.name,
              field: r.field,
              university:
                r.university,
              papers: r.papers,
              match: r.match,
              avatar:
                r.avatar ??
                "👨‍🔬",
              skills:
                r.researcher_skills?.map(
                  (s) =>
                    s.skill
                ) || [],
            }));

          setResearchers(
            formatted
          );
        }
      } catch (err) {
        console.error(
          "Fetch Error:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // FILTER RESEARCHERS
  // =========================
  const filteredResearchers =
    researchers.filter((r) => {
      const k =
        search.toLowerCase();

      return (
        r.name
          .toLowerCase()
          .includes(k) ||
        r.field
          .toLowerCase()
          .includes(k) ||
        r.skills
          .join(" ")
          .toLowerCase()
          .includes(k)
      );
    });

  // =========================
  // FILTER USERS
  // =========================
  const currentUser =
  JSON.parse(
    localStorage.getItem("user") ||
    "{}"
  );

const filteredUsers =
  realUsers
    .filter(
      (u) =>
        u.id !== currentUser.id
    )
    .filter((u) => {

      const k =
        search.toLowerCase();

      return (

        u.full_name
          ?.toLowerCase()
          .includes(k) ||

        u.username
          ?.toLowerCase()
          .includes(k) ||

        u.affiliation
          ?.toLowerCase()
          .includes(k) ||

        (
          u.interested_areas || []
        )
          .join(" ")
          .toLowerCase()
          .includes(k)

      );

    });
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
      {/* HEADER */}
      <div className="mb-10">
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
          Collaborator Finder
        </h1>

        <p
          className="
          text-gray-600
          mt-3
          text-lg
          "
        >
          Find researchers with
          similar interests and
          build research teams
        </p>
      </div>

      {/* SEARCH */}
      <div className="mb-8">
        <SearchResearcher
          search={search}
          setSearch={setSearch}
        />
      </div>

      {loading ? (
        <p className="text-gray-500">
          Loading researchers...
        </p>
      ) : (
        <>
          {/* REAL USERS FIRST */}
          <div
            className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
            mb-6
            "
          >
            {filteredUsers.map(
              (user) => (
                <div
                  key={user.id}
                  className="
                  bg-white
                  rounded-3xl
                  p-6
                  shadow-md
                  hover:shadow-2xl
                  transition
                  "
                >
                  <div
                    className="
                    flex
                    items-center
                    gap-4
                    "
                  >
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
                      <h3
                        className="
                        text-xl
                        font-bold
                        "
                      >
                        {
                          user.full_name
                        }
                      </h3>

                      <p className="text-blue-600">
                        @
                        {
                          user.username
                        }
                      </p>
                    </div>
                  </div>

                  <p
                    className="
                    mt-4
                    text-gray-600
                    "
                  >
                    {
                      user.affiliation
                    }
                  </p>

                  <div
                    className="
                    flex
                    flex-wrap
                    gap-2
                    mt-4
                    "
                  >
                    {(
                      user.interested_areas ||
                      []
                    ).map(
                      (
                        area
                      ) => (
                        <span
                          key={
                            area
                          }
                          className="
                          px-3
                          py-1
                          rounded-full
                          bg-blue-100
                          text-blue-700
                          text-sm
                          "
                        >
                          {
                            area
                          }
                        </span>
                      )
                    )}
                  </div>

                  <button
  disabled={
    getButtonInfo(user.id)
      .disabled
  }
  onClick={() =>
    handleConnect(user.id)
  }
  className={`
    mt-5
    w-full
    py-3
    rounded-2xl
    text-white
    font-semibold
    ${
      getButtonInfo(user.id)
        .className
    }
    ${
      getButtonInfo(user.id)
        .disabled
        ? "cursor-not-allowed"
        : ""
    }
  `}
>
  {
    getButtonInfo(user.id)
      .text
  }
</button>
                </div>
              )
            )}
          </div>

          {/* FAKE RESEARCHERS AFTER */}
          <div
            className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
            "
          >
            {filteredResearchers.map(
              (r) => (
                <ResearcherCard
                  key={r.id}
                  researcher={r}
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}