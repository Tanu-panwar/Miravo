"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Post as PostType } from "@/app/types/post.types";
import PostHeader from "@/components/post/post-header";
import PostContent from "@/components/post/post-content";
import CommentSection from "@/components/post/comment-section";
import axios from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/Redux/ReduxStore";
import { useAppDispatch } from "@/lib/Redux/hooks";
import { getSinglePost } from "@/lib/Redux/PostsSlice";

interface ExtendedPost extends PostType {
  isLiked?: boolean;
  user: PostType["user"] & {
    isFollowed?: boolean;
  };
}

interface PostProps {
  post: ExtendedPost;
  showAllComments?: boolean;
  onPostDeleted?: () => void;
}


export default function Post({
  post,
  showAllComments = false,
  onPostDeleted,
}: PostProps) {
  if (!post?.user) {
    console.error("Post data is incomplete:", post);
    return null;
  }
  const [editingPost, setEditingPost] = useState(false);
  const [postBody, setPostBody] = useState(post.body || "");
  const [postImage, setPostImage] = useState(post.image);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isFollowed, setIsFollowed] = useState(post?.user?.isFollowed ?? false);


  const dispatch = useAppDispatch();

  const token = useSelector((state: RootState) => state.auth.userToken);
  const myId = useSelector((state: RootState) => state.posts.myId);

  const handleUpdatePost = async (updatedBody: string, updatedImage: File | null) => {
    const data = new FormData();
    data.append("body", updatedBody);
    if (updatedImage) data.append("image", updatedImage);

    try {
      const response = await axios.put(`/posts/${post._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.message === "success") {
        toast({
          title: "Success",
          description: "Post updated successfully",
          variant: "success",
        });
        setPostBody(updatedBody);
        if (updatedImage) {
          setPostImage(URL.createObjectURL(updatedImage));
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the post.",
        variant: "destructive",
      });
    }

    setEditingPost(false);
  };

  // const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [likeCount, setLikeCount] = useState(() =>
    Array.isArray(post.likes) ? post.likes.length : 0
  );


  const handleLikeToggle = async () => {
    try {
      const endpoint = isLiked ? "unlike" : "like";
      const res = await axios.post(
        `/posts/${post._id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.message === "Post liked" || res.data.message === "Post unliked") {
        setIsLiked(!isLiked); // ✅ Toggle immediately
        setLikeCount(res.data.likeCount || likeCount); // ✅ Update count if present

        toast({
          title: "Success",
          description: `${res.data.likerName || "Someone"} ${isLiked ? "unliked" : "liked"} your post`,
          variant: "success",
        });

        // Optionally refresh Redux post too
        dispatch(getSinglePost(post._id));
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };


  // Follow/Unfollow logic
  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowed ? "unfollow" : "follow";
      const response = await axios.put(`/user/${post.user._id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.message) {
        setIsFollowed(!isFollowed);
        toast({
          title: "Success",
          description: `You ${isFollowed ? "unfollowed" : "followed"} ${response.data.followerName || post.user.name}`,
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const isAuthor = post.user._id === myId;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <PostHeader
        user={post.user}
        createdAt={post.createdAt}
        postId={post._id || ""}
        onEdit={isAuthor ? () => setEditingPost(true) : undefined}
        onDelete={isAuthor ? onPostDeleted || (() => { }) : undefined}
      />
      <PostContent
        body={postBody || ""}
        image={postImage}
        editing={editingPost}
        onSave={handleUpdatePost}
        onCancel={() => setEditingPost(false)}
      />

      {/* Like / Unlike Button */}
      <div className="px-4 pb-2 flex gap-2 items-center">
        <button
          className={`text-xl ${isLiked ? "text-red-500" : "text-gray-400"}`}
          onClick={handleLikeToggle}
          title={isLiked ? "Unlike" : "Like"}
        >
          {isLiked ? "❤️" : "🤍"}
        </button>

        {likeCount > 0 && (
          <span className="text-sm text-gray-600">{likeCount}</span>
        )}
      </div>

      {/* Follow / Unfollow Button */}
      {post?.user?._id !== myId && (  // 👈 SAFE null check
        <div className="px-4 pb-2">
          <button
            className={`text-sm font-medium ${isFollowed ? "text-blue-500" : "text-gray-500"}`}
            onClick={handleFollowToggle}
          >
            {isFollowed ? "Unfollow" : "Follow"}
          </button>
        </div>
      )}

      <CommentSection
        commentsArr={post.comments || []}
        showAllComments={showAllComments}
        postId={post._id || ""}
        postCreatorId={post.user._id || ""}
      />

    </Card>
  );
}
