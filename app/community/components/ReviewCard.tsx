"use client";

import { useRouter } from "next/navigation";

import {
  Heart,
  MessageCircle,
  Clock,
  Star
} from "lucide-react";

type Post = {
  id: number;
  title: string;
  journal: string;
  content: string;
  rating: number;
  likes: number;
  comments: number;
  reviewTime: string;
  tags: string[];
  liked?: boolean;
};

type Props = {
  post: Post;
  onLike: (id: number) => void;
};

export default function ReviewCard({
  post,
  onLike,
}: Props) {

  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/community/${post.id}`)}
      className="
      bg-white
      rounded-3xl
      p-6
      shadow-md
      hover:shadow-2xl
      hover:-translate-y-1
      transition-all
      duration-300
      border
      border-gray-100
      cursor-pointer
      "
    >

      {/* TOP */}
      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            {post.title}
          </h2>

          <p className="text-blue-600 font-medium mt-1">
            {post.journal}
          </p>

        </div>

        <div
          className="
          flex
          items-center
          gap-1
          bg-yellow-100
          text-yellow-700
          px-3
          py-1
          rounded-full
          text-sm
          font-semibold
          "
        >
          <Star size={16} fill="currentColor" />
          {post.rating}
        </div>

      </div>

      {/* CONTENT */}
      <p className="text-gray-600 mt-5 leading-8 line-clamp-4">
        {post.content}
      </p>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mt-5">

        {post.tags.map((tag) => (

          <span
            key={tag}
            className="
            px-3
            py-1
            rounded-full
            bg-blue-100
            text-blue-700
            text-sm
            font-medium
            "
          >
            #{tag}
          </span>

        ))}

      </div>

    

      {/* FOOTER */}
      <div
        className="
        flex
        items-center
        justify-between
        mt-6
        pt-4
        border-t
        "
      >

        <div className="flex items-center gap-5 text-gray-500">

          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
            className="
            flex
            items-center
            gap-1
            hover:scale-110
            transition
            "
          >

            <Heart
              size={18}

              className={`
                transition-all

                ${
              post.liked
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-gray-500"
                }
          `}
        />

            {post.likes}

          </button>

          <div className="flex items-center gap-1">
            <MessageCircle size={18} />
            {post.comments}
          </div>

        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <Clock size={16} />
          {post.reviewTime}
        </div>

      </div>

    </div>
  );
}