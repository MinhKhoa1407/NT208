"use client";

import { useState } from "react";


import ReviewCard from "./components/ReviewCard";
import SearchBar from "./components/SearchBar";
import FilterChips from "./components/FilterChips";
import CreatePostModal from "./components/CreatePostModal";

const initialPosts = [
  {
    id: 1,
    title: "IEEE Access Review Experience",
    journal: "IEEE Access",
    content:
      "The editor responded within 2 weeks. Reviewers were professional and gave detailed feedback.",
    rating: 4.5,
    likes: 24,
    liked: false,
    comments: 8,
    reviewTime: "2 weeks",
    tags: ["AI", "IEEE", "Fast Review"],
  },

  {
    id: 2,
    title: "Springer Journal Submission",
    journal: "Springer",
    content:
      "Review process took around 3 months but communication was very clear and transparent.",
    rating: 4.2,
    likes: 18,
    liked: false,
    comments: 5,
    reviewTime: "3 months",
    tags: ["Cybersecurity", "Open Access"],
  },

  {
    id: 3,
    title: "Elsevier Conference Experience",
    journal: "Elsevier",
    content:
      "The acceptance rate was competitive but the reviewers provided useful suggestions.",
    rating: 4.0,
    likes: 12,
    liked: false,
    comments: 3,
    reviewTime: "1 month",
    tags: ["NLP", "Conference"],
  },
];

export default function CommunityPage() {

  const [openModal, setOpenModal] = useState(false);
  const [posts, setPosts] = useState(initialPosts);

type NewPost = {
  title: string;
  journal: string;
  content: string;
};

const addPost = (newPost: NewPost) => {

  setPosts((prev) => [
    {
      ...newPost,
      id: Date.now(),
      likes: 0,
      liked: false,
      comments: 0,
      rating: 5,
      reviewTime: "Recently",
      tags: ["New"],
    },

    ...prev,
  ]);

};

const handleLike = (id: number) => {

  setPosts((prev) =>
    prev.map((post) => {

      if (post.id === id) {

        return {
          ...post,
          liked: !post.liked,
          likes: post.liked
            ? post.likes - 1
            : post.likes + 1,
        };

      }

      return post;
    })
  );

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

      {/* HERO */}
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
          Research Community
        </h1>

        <p className="text-gray-600 mt-3 text-lg">
          Share and explore scientific publishing experiences
        </p>

      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* FILTERS */}
      <div className="mb-8">
        <FilterChips />
      </div>

      {/* POSTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {posts.map((post) => (
          <ReviewCard
            key={post.id}
            post={post}
            onLike={handleLike}
            />
        ))}

      </div>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpenModal(true)}
        className="
        fixed
        bottom-8
        right-8
        w-16
        h-16
        rounded-full
        bg-gradient-to-r
        from-blue-500
        to-indigo-600
        text-white
        text-3xl
        shadow-2xl
        hover:scale-110
        transition-all
        duration-300
        "
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