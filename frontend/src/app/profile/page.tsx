"use client";

import { useEffect, useState, useRef } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import AddPost from "@/components/add-post";
import Post from "@/components/post";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Post as PostType } from "@/app/types/post.types";

interface UserType {
  username: string;
  email: string;
  photo: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null | undefined>(undefined);
  // undefined = loading, null = not logged in

  const [loading, setLoading] = useState(true);
  const [photoVersion, setPhotoVersion] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("/user/profile");
      setUser(res.data.user);
      setLoading(false); // ✅ added this line
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "Session expired. Please login again.",
      });
      localStorage.removeItem("token");
      router.replace("/login");
    }
  };


  const fetchUserPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setPostsLoading(true);
      const res = await axios.get("/posts/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched posts:", res.data);
      setPosts(res.data);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your posts.",
      });
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetchUserProfile();
    fetchUserPosts();
    const timeout = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(timeout);
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch("/user/photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data.user);
      setPhotoVersion(Date.now());

      toast({
        title: "Success",
        description: "Profile photo updated.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not update photo.",
      });
    }
  };

  const handlePostCreated = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      fetchUserPosts();
    }, 6000); // to account for queue delay
  };

  if (user === undefined) {
    return (
      <div className="max-w-md mx-auto mt-20 space-y-4">
        <Skeleton className="w-32 h-32 rounded-full mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 mt-6 space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <img
            key={photoVersion}
            src={
              user.photo?.startsWith("http")
                ? `${user.photo}?v=${photoVersion}`
                : "/Avatar.jpg"
            }
            alt="Profile Photo"
            className="w-24 h-24 rounded-full object-cover border"
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handlePhotoUpload}
          />

          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload New Photo
          </Button>

          <div className="text-center">
            <h2 className="text-lg font-semibold">{user.username}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Create Post Button */}
      <div className="text-right mb-4">
        <Button onClick={() => setIsModalOpen(true)}>Create New Post</Button>
      </div>

      {/* Show AddPost modal/component */}
      {isModalOpen && (
        <AddPost onClose={handlePostCreated} />
      )}

      {/* Post Section without extra wrapping styles */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold mb-2 text-center text-foreground">
          Your Posts
        </h3>

        {postsLoading ? (
          <p className="text-muted-foreground text-center">Loading your posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground text-center">No posts yet. Start sharing!</p>
        ) : (
          posts.map((post) => <Post key={post._id} post={post} />)
        )}
      </div>

    </div>
  );
}
