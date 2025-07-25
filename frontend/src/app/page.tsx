"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import AddPost from "@/components/add-post";
import Post from "@/components/post";
import { PostSkeletonList } from "@/components/post-skeleton";
import { Post as PostType } from "./types/post.types";
import { Button } from "@/components/ui/button";

export default function Page() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostType[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTimelinePosts = async () => {
    try {
      const res = await axios.get("/posts/timeline"); // token auto-injected via interceptor
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching timeline posts:", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchTimelinePosts();
  }, []);

  const handlePostCreated = () => {
    // ⏳ wait 5.5s for BullMQ to process post
    setTimeout(() => {
      fetchTimelinePosts();
    }, 5500);
  };

  return (
    <>
      <AddPost onPostCreated={handlePostCreated} />
      <div className="space-y-3 mt-6">
        {loading ? (
          <PostSkeletonList />
        ) : posts && posts.length > 0 ? (
          posts.map((post) => <Post key={post._id} post={post} />)
        ) : (
          <div className="text-center py-10 border rounded-lg shadow-sm dark:border-zinc-700">
            <p className="text-muted-foreground mb-2 text-lg">No posts yet in your feed</p>
            <p className="text-sm text-muted-foreground mb-4">
              Follow others or create your first post!
            </p>
            <Button onClick={fetchTimelinePosts} variant="outline">
              Refresh Feed 🔄
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
