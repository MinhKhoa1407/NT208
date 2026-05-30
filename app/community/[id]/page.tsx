"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import {
  Heart,
  MessageCircle,
  Clock,
  Star,
  Send,
} from "lucide-react";

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

  reviewTime: string;

  tags: string[];

  liked?: boolean;
};

type CommentType = {
  id: number;

  username: string;

  content: string;

  created_at?: string;

  parent_id?: number | null;

  likes?: number;

  liked?: boolean;
};

// =========================
// COMMENT ITEM
// =========================
type CommentItemProps = {
  comment: CommentType;

  comments: CommentType[];

  replyingTo: number | null;

  setReplyingTo: (
    id: number | null
  ) => void;

  replyContent: string;

  setReplyContent: (
    value: string
  ) => void;

  handleReply: (
    parentId: number
  ) => Promise<void>;

  formatRelativeTime: (
    date?: string
  ) => string;

  handleLikeComment: (
    commentId: number
  ) => Promise<void>;
};

function CommentItem({

  comment,

  comments,

  replyingTo,

  setReplyingTo,

  replyContent,

  setReplyContent,

  handleReply,

  formatRelativeTime,

  handleLikeComment,

}: CommentItemProps) {

  const replies =
    comments.filter(
      (item) =>
        item.parent_id ===
        comment.id
    );

  return (

    <div>

      {/* COMMENT */}
      <div
        className="
        bg-white
        rounded-2xl
        p-5
        shadow-sm
        border
        border-gray-100
        "
      >

        <div
          className="
          flex
          items-center
          justify-between
          "
        >

          <h3
            className="
            font-bold
            text-gray-800
            "
          >
            {comment.username}
          </h3>

          <span
            className="
            text-sm
            text-gray-400
            "
          >
            {formatRelativeTime(
              comment.created_at
            )}
          </span>

        </div>

        <p
          className="
          text-gray-700
          mt-3
          leading-7
          "
        >
          {comment.content}
        </p>

        {/* ACTIONS */}
        <div
          className="
          flex
          items-center
          gap-5
          mt-4
          "
        >

          {/* LIKE COMMENT */}
          <button
            onClick={() =>
              handleLikeComment(
                comment.id
              )
            }
            className="
            flex
            items-center
            gap-2
            text-sm
            text-gray-600
            hover:text-red-500
            transition
            "
          >

            <Heart
              size={16}
              className={`
                transition-all

                ${
                  comment.liked
                    ? "fill-red-500 text-red-500"
                    : ""
                }
              `}
            />

            {comment.likes || 0}

          </button>

          {/* REPLY */}
          <button
            onClick={() =>
              setReplyingTo(
                comment.id
              )
            }
            className="
            text-sm
            font-medium
            text-blue-600
            hover:underline
            "
          >
            Reply
          </button>

        </div>

        {/* REPLY INPUT */}
        {replyingTo ===
          comment.id && (

          <div className="mt-4">

            <textarea
              rows={3}
              value={replyContent}
              onChange={(e) =>
                setReplyContent(
                  e.target.value
                )
              }
              placeholder="Write a reply..."
              className="
              w-full
              border
              rounded-xl
              p-3
              outline-none
              focus:ring-2
              focus:ring-blue-500
              "
            />

            <button
              onClick={() =>
                handleReply(
                  comment.id
                )
              }
              className="
              mt-3
              bg-blue-600
              text-white
              px-4
              py-2
              rounded-xl
              "
            >
              Reply
            </button>

          </div>

        )}

      </div>

      {/* REPLIES */}
      {replies.length > 0 && (

        <div
          className="
          ml-10
          mt-4
          pl-5
          border-l-2
          border-blue-100
          space-y-4
          "
        >

          {replies.map((reply) => (

            <CommentItem
              key={reply.id}
              comment={reply}
              comments={comments}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleReply={handleReply}
              formatRelativeTime={formatRelativeTime}
              handleLikeComment={
                handleLikeComment
              }
            />

          ))}

        </div>

      )}

    </div>

  );

}

// =========================
// PAGE
// =========================
export default function PostDetailPage() {

  const params = useParams();

  const id = params.id;

  const [post, setPost] =
    useState<Post | null>(null);

  const [comments, setComments] =
    useState<CommentType[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [newComment, setNewComment] =
    useState("");

  const [replyingTo, setReplyingTo] =
    useState<number | null>(null);

  const [replyContent, setReplyContent] =
    useState("");

  // =========================
  // FETCH POST
  // =========================
  const fetchPost = async () => {

    const { data, error } =
      await supabase
        .from("community_posts")
        .select("*")
        .eq("id", Number(id))
        .single();

    if (error) {

      console.error(error);

      return;
    }

    const likedPosts =
      JSON.parse(
        localStorage.getItem(
          "likedPosts"
        ) || "[]"
      );

    setPost({
      ...data,

      liked:
        likedPosts.includes(
          data.id
        ),
    });

    setLoading(false);

  };

  // =========================
  // FETCH COMMENTS
  // =========================
  const fetchComments = async () => {

    const { data, error } =
      await supabase
        .from("comments")
        .select("*")
        .eq("post_id", Number(id))
        .order("created_at", {
          ascending: false,
        });

    if (error) {

      console.error(error);

      return;
    }

    const likedComments =
      JSON.parse(
        localStorage.getItem(
          "likedComments"
        ) || "[]"
      );

    const formatted =
      (data || []).map(
        (comment) => ({

          ...comment,

          liked:
            likedComments.includes(
              comment.id
            ),

        })
      );

    setComments(formatted);

  };

  useEffect(() => {

    const loadData = async () => {

      await fetchPost();

      await fetchComments();

    };

    loadData();

  }, [id]);

  // =========================
  // ADD COMMENT
  // =========================
  const handleAddComment =
    async () => {

      if (!newComment.trim())
        return;

      const currentUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "{}"
        );

      const { error } =
        await supabase
          .from("comments")
          .insert([
            {
              post_id: Number(id),

              username:
                currentUser.username ||
                currentUser.email?.split(
                  "@"
                )[0] ||
                "Unknown User",

              content: newComment,

              likes: 0,
            },
          ]);

      if (error) {

        console.error(error);

        return;
      }

      setNewComment("");

      fetchComments();

    };

  // =========================
  // REPLY COMMENT
  // =========================
  const handleReply = async (
    parentId: number
  ) => {

    if (!replyContent.trim())
      return;

    const currentUser =
      JSON.parse(
        localStorage.getItem(
          "user"
        ) || "{}"
      );

    const { error } =
      await supabase
        .from("comments")
        .insert([
          {
            post_id: Number(id),

            username:
              currentUser.username ||
              currentUser.email?.split(
                "@"
              )[0] ||
              "Unknown User",

            content: replyContent,

            parent_id: parentId,

            likes: 0,
          },
        ]);

    if (error) {

      console.error(error);

      return;
    }

    setReplyContent("");

    setReplyingTo(null);

    fetchComments();

  };

  // =========================
  // LIKE POST
  // =========================
  const handleLike = async () => {

    if (!post) return;

    const liked =
      !post.liked;

    const updatedLikes =
      liked
        ? post.likes + 1
        : post.likes - 1;

    const likedPosts =
      JSON.parse(
        localStorage.getItem(
          "likedPosts"
        ) || "[]"
      );

    let updatedLikedPosts =
      [...likedPosts];

    if (liked) {

      updatedLikedPosts.push(
        post.id
      );

    } else {

      updatedLikedPosts =
        updatedLikedPosts.filter(
          (item: number) =>
            item !== post.id
        );

    }

    localStorage.setItem(
      "likedPosts",
      JSON.stringify(
        updatedLikedPosts
      )
    );

    setPost({
      ...post,

      liked,

      likes: updatedLikes,
    });

    await supabase
      .from("community_posts")
      .update({
        likes: updatedLikes,
      })
      .eq("id", post.id);

  };

  // =========================
  // LIKE COMMENT
  // =========================
  const handleLikeComment =
    async (
      commentId: number
    ) => {

      const target =
        comments.find(
          (c) =>
            c.id === commentId
        );

      if (!target) return;

      const liked =
        !target.liked;

      const updatedLikes =
        liked
          ? (target.likes || 0) +
            1
          : (target.likes || 0) -
            1;

      const likedComments =
        JSON.parse(
          localStorage.getItem(
            "likedComments"
          ) || "[]"
        );

      let updatedLikedComments =
        [...likedComments];

      if (liked) {

        updatedLikedComments.push(
          commentId
        );

      } else {

        updatedLikedComments =
          updatedLikedComments.filter(
            (id: number) =>
              id !== commentId
          );

      }

      localStorage.setItem(
        "likedComments",
        JSON.stringify(
          updatedLikedComments
        )
      );

      setComments((prev) =>
        prev.map((comment) => {

          if (
            comment.id === commentId
          ) {

            return {

              ...comment,

              liked,

              likes: updatedLikes,

            };

          }

          return comment;

        })
      );

      await supabase
        .from("comments")
        .update({
          likes: updatedLikes,
        })
        .eq("id", commentId);

    };

  // =========================
  // ROOT COMMENTS
  // =========================
  const rootComments =
    comments.filter(
      (comment) =>
        !comment.parent_id
    );

  // =========================
  // TIME
  // =========================
  const formatRelativeTime = (
    dateString?: string
  ) => {

    if (!dateString)
      return "";

    const date =
      new Date(dateString);

    const now =
      new Date();

    const diff =
      now.getTime() -
      date.getTime();

    const minutes =
      Math.floor(
        diff / 1000 / 60
      );

    const hours =
      Math.floor(
        minutes / 60
      );

    const days =
      Math.floor(
        hours / 24
      );

    if (minutes < 60) {

      return `${minutes} minutes ago`;

    }

    if (hours < 24) {

      return `${hours} hours ago`;

    }

    return `${days} days ago`;

  };

  if (loading) {

    return (
      <div className="p-10 text-center text-gray-500">
        Loading post...
      </div>
    );

  }

  if (!post) {

    return (
      <div className="p-10 text-center text-red-500">
        Post not found
      </div>
    );

  }

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

      <div className="max-w-4xl mx-auto">

        {/* POST */}
        <div
          className="
          bg-white
          rounded-3xl
          p-8
          shadow-lg
          border
          border-gray-100
          "
        >

          <div
            className="
            flex
            justify-between
            items-start
            "
          >

            <div>

              <h1
                className="
                text-4xl
                font-extrabold
                text-gray-800
                "
              >
                {post.title}
              </h1>

              <p
                className="
                text-blue-600
                text-lg
                font-medium
                mt-2
                "
              >
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
              px-4
              py-2
              rounded-full
              font-semibold
              "
            >

              <Star
                size={18}
                fill="currentColor"
              />

              {post.rating}

            </div>

          </div>

          {/* TAGS */}
          <div
            className="
            flex
            flex-wrap
            gap-2
            mt-6
            "
          >

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

          {/* CONTENT */}
          <div className="mt-8">

            <p
              className="
              text-gray-700
              leading-8
              text-lg
              whitespace-pre-line
              "
            >
              {post.content}
            </p>

          </div>

          {/* FOOTER */}
          <div
            className="
            flex
            items-center
            justify-between
            mt-10
            pt-5
            border-t
            "
          >

            <div
              className="
              flex
              items-center
              gap-6
              "
            >

              <button
                onClick={handleLike}
                className="
                flex
                items-center
                gap-2
                text-gray-600
                hover:text-red-500
                transition
                "
              >

                <Heart
                  size={20}
                  className={`
                    transition-all

                    ${
                      post.liked
                        ? "fill-red-500 text-red-500 scale-110"
                        : ""
                    }
                  `}
                />

                {post.likes}

              </button>

              <div
                className="
                flex
                items-center
                gap-2
                text-gray-600
                "
              >

                <MessageCircle
                  size={20}
                />

                {comments.length}

              </div>

            </div>

            <div
              className="
              flex
              items-center
              gap-2
              text-gray-500
              "
            >

              <Clock size={18} />

              {post.reviewTime}

            </div>

          </div>

        </div>

        {/* COMMENTS */}
        <div className="mt-10">

          <h2
            className="
            text-3xl
            font-bold
            text-gray-800
            mb-6
            "
          >
            Comments
          </h2>

          {/* ADD COMMENT */}
          <div
            className="
            bg-white
            rounded-3xl
            p-5
            shadow-md
            mb-6
            "
          >

            <textarea
              rows={4}
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) =>
                setNewComment(
                  e.target.value
                )
              }
              className="
              w-full
              border
              rounded-2xl
              p-4
              resize-none
              outline-none
              focus:ring-2
              focus:ring-blue-500
              "
            />

            <button
              onClick={
                handleAddComment
              }
              className="
              mt-4
              flex
              items-center
              gap-2
              bg-gradient-to-r
              from-blue-500
              to-indigo-600
              text-white
              px-5
              py-3
              rounded-2xl
              font-semibold
              hover:opacity-90
              transition
              "
            >

              <Send size={18} />

              Post Comment

            </button>

          </div>

          {/* COMMENT LIST */}
          <div className="space-y-5">

            {rootComments.map((comment) => (

              <CommentItem
                key={comment.id}
                comment={comment}
                comments={comments}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleReply={handleReply}
                formatRelativeTime={formatRelativeTime}
                handleLikeComment={
                  handleLikeComment
                }
              />

            ))}

          </div>

        </div>

      </div>

    </div>

  );

}