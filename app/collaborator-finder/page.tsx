"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
  researcher_skills: { skill: string }[];
};

export default function CollaboratorFinderPage() {
  const [search, setSearch] = useState("");
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ FIX: define function BEFORE useEffect properly
  const fetchResearchers = async (): Promise<void> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("researchers")
        .select(`
          *,
          researcher_skills (
            skill
          )
        `);

      if (error) {
        console.error("Supabase error FULL:", error.message, error.details, error.hint);
        return;
      }

      const typedData = data as ResearcherDB[] | null;

      const formatted: Researcher[] = (typedData || []).map((r) => ({
        id: r.id,
        name: r.name,
        field: r.field,
        university: r.university,
        papers: r.papers,
        match: r.match,
        avatar: r.avatar ?? "👨‍🔬",
        skills: r.researcher_skills?.map((s) => s.skill) || [],
      }));

      setResearchers(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    fetchResearchers();
  }, []);

  const filteredResearchers = researchers.filter((r) => {
    const k = search.toLowerCase();

    return (
      r.name.toLowerCase().includes(k) ||
      r.field.toLowerCase().includes(k) ||
      r.skills.join(" ").toLowerCase().includes(k)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">

      <div className="mb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Collaborator Finder
        </h1>

        <p className="text-gray-600 mt-3 text-lg">
          Find researchers with similar interests and build research teams
        </p>
      </div>

      <div className="mb-8">
        <SearchResearcher search={search} setSearch={setSearch} />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading researchers...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResearchers.map((r) => (
            <ResearcherCard key={r.id} researcher={r} />
          ))}
        </div>
      )}

    </div>
  );
}