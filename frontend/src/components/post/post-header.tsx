"use client";

import { CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHandleOpenPost } from "@/lib/utils";
import axios from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import { User } from "@/app/types/post.types";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/Redux/ReduxStore";

interface PostHeaderProps {
  user: User;
  createdAt: string;
  postId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PostHeader({
  user,
  createdAt,
  postId,
  onEdit,
  onDelete,
}: PostHeaderProps) {
  const handleOpenPost = useHandleOpenPost();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date not available";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFullImageUrl = (path: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  if (!path) return "";
  if (path.startsWith("/uploads")) return `${baseURL}${path}`;
  if (path.startsWith("http")) return path;
  return `${baseURL}/uploads/${path}`;
};

  const myId = useSelector((state: RootState) => state.posts.myId);

  const handleRemovePost = async () => {
    try {
      const response = await axios.delete(`/posts/${postId}`); // 👈 token auto-attached

      if (response.data.message === "success") {
        toast({
          title: "Success",
          description: "Post deleted successfully",
          variant: "success",
        });
        onDelete?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the post",
        variant: "destructive",
      });
    }
  };

  return (
    <CardHeader className="flex flex-row items-center gap-4">
      <Avatar>
        <AvatarImage
  src={user.photo ? getFullImageUrl(user.photo) : "/Avatar.jpg"}
  alt={user.name || "User"}
  className="object-cover"
/>

        <AvatarFallback>{user.name?.[0] || ""}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p
          className="text-sm text-gray-500 cursor-pointer inline-block"
          onClick={() => handleOpenPost(postId)}
        >
          {formatDate(createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {user._id === myId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Post options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.()}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this post?")) {
                    handleRemovePost();
                  }
                }}
              >
                Delete
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </CardHeader>
  );
}
