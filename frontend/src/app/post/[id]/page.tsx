"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { toast } from "@/hooks/use-toast";

import { Post as PostType } from "@/app/types/post.types";
import Post from "@/components/post";
import { PostSkeleton } from "@/components/post-skeleton";

type PageProps = {
  params: {
    id: string;
  };
};

export default function Page({ params: { id } }: PageProps) {
  const router = useRouter();

  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await axios.get(`/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(res.data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Post not found or unauthorized.",
        });
        router.replace("/"); // Redirect back to timeline or fallback
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  if (loading) return <PostSkeleton commentCount={3} />;
  if (!post) return null;

  return <Post post={post} showAllComments={true} />;
}
