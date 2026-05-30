"use client";

import { useEffect, useMemo, useState } from "react";

import ReviewCard from "./components/ReviewCard";
import SearchBar from "./components/SearchBar";
import FilterChips from "./components/FilterChips";
import CreatePostModal from "./components/CreatePostModal";

import { supabase } from "@/app/api/supabase";

// =========================
// TYPES
// =========================
type Post = {
  id: number;
  title: string;
  journal: string;
  content: string;
  rating: number;
  likes: number;
  comments: number;
  review_time: string;
  tags: string[];
  liked?: boolean;
};

type NewPost = {
  title: string;
  journal: string;
  content: string;
};

// =========================
// KEY
// =========================
const LIKED_KEY = "likedPosts";

export default function CommunityPage() {
  const [openModal, setOpenModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // =========================
  // FETCH POSTS
  // =========================
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const currentUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const userEmail = currentUser.email;

        const { data: postsData, error } = await supabase
          .from("community_posts")
          .select(`*, comments_table:comments(count)`)
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          return;
        }

        const likedIds: number[] = JSON.parse(
          localStorage.getItem(LIKED_KEY) || "[]"
        );

        const formatted = (postsData || []).map((post) => ({
          ...post,
          liked: likedIds.includes(post.id),
          comments: post.comments_table?.[0]?.count || 0,
        }));

        setPosts(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // =========================
  // ADD POST
  // =========================
  const addPost = async (newPost: NewPost) => {
    const { data, error } = await supabase
      .from("community_posts")
      .insert([
        {
          ...newPost,
          author: "Anonymous Researcher",
          likes: 0,
          comments: 0,
          tags: ["Research"],
          rating: 4.0,
          review_time: "Recently",
        },
      ])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    setPosts((prev) => [
      {
        ...data[0],
        liked: false,
        comments: 0,
      },
      ...prev,
    ]);
  };

  // =========================
  // LIKE (LOCAL ONLY)
  // =========================
  const handleLike = async (id: number) => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (!currentUser.email) {
        alert("Please login first");
        return;
      }

      const likedIds: number[] = JSON.parse(
        localStorage.getItem(LIKED_KEY) || "[]"
      );

      const target = posts.find((p) => p.id === id);
      if (!target) return;

      const isLiked = likedIds.includes(id);
      const newLiked = !isLiked;

      let updated = [...likedIds];

      if (newLiked) updated.push(id);
      else updated = updated.filter((x) => x !== id);

      localStorage.setItem(LIKED_KEY, JSON.stringify(updated));

      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                liked: newLiked,
                likes: p.likes + (newLiked ? 1 : -1),
              }
            : p
        )
      );
    } catch (err) {
      console.error("LIKE ERROR:", err);
    }
  };

  // =========================
  // FILTERS
  // =========================
  const allFilters = [
    "All",
    ...Array.from(new Set(posts.flatMap((p) => p.tags || []))),
  ];

  const filteredPosts = useMemo(() => {
    const k = search.toLowerCase();

    return posts.filter((post) => {
      const matchSearch =
        post.title.toLowerCase().includes(k) ||
        post.journal.toLowerCase().includes(k) ||
        post.content.toLowerCase().includes(k) ||
        post.tags.join(" ").toLowerCase().includes(k);

      const matchFilter =
        selectedFilter === "All" ||
        post.tags.includes(selectedFilter);

      return matchSearch && matchFilter;
    });
  }, [posts, search, selectedFilter]);

  // =========================
  // LOADING UI (STYLE FIX)
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">
        Loading community...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      
      {/* HERO (FIX STYLE) */}
      <div className="mb-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Research Community
        </h1>

        <p className="text-gray-600 mt-3 text-lg">
          Share and explore scientific publishing experiences
        </p>
      </div>

      {/* SEARCH (SPACE LIKE VERSION 1) */}
      <div className="mb-6">
        <SearchBar search={search} setSearch={setSearch} />
      </div>

      {/* FILTER */}
      <div className="mb-8">
        <FilterChips
          filters={allFilters}
          selected={selectedFilter}
          setSelected={setSelectedFilter}
        />
      </div>

      {/* POSTS */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-md">
          <h2 className="text-2xl font-bold text-gray-700">
            No posts found
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <ReviewCard
              key={post.id}
              post={{
                ...post,
                reviewTime: post.review_time,
              }}
              onLike={handleLike}
            />
          ))}
        </div>
      )}

      {/* FLOATING BUTTON (STYLE LIKE VERSION 1) */}
      <button
        onClick={() => setOpenModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-3xl shadow-2xl hover:scale-110 transition-all duration-300"
      >
        +
      </button>

      {/* MODAL */}
      <CreatePostModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={addPost}
      />
    </div>
  );
}