"use client";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/lib/Redux/ReduxStore";
import type { Comment } from "@/app/types/post.types";
import { RootState } from "@/lib/Redux/ReduxStore";
import { useHandleOpenPost } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getSinglePost } from "@/lib/Redux/PostsSlice";


import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CardFooter } from "@/components/ui/card";
import { MessageCircle, Send, MoreHorizontal } from "lucide-react";

interface CommentSectionProps {
  commentsArr: Comment[];
  showAllComments: boolean;
  postId: string;
  postCreatorId: string;
}

export default function CommentSection({
  commentsArr,
  showAllComments,
  postId,
  postCreatorId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(commentsArr);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentBeingEdited, setCommentBeingEdited] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const myId = useSelector((state: RootState) => state.posts.myId);
  useEffect(() => {
    if (!myId) return; // wait until available
    console.log("✅ myId loaded:", myId);
  }, [myId]);

  const handleOpenPost = useHandleOpenPost();

  useEffect(() => {
    setComments(commentsArr); // Keep comments in sync when parent updates
  }, [commentsArr]);


  useEffect(() => {
    if (!showAllComments) return; // ✅ only fetch when in full post view

    const fetchFreshComments = async () => {
      try {
        const res = await axios.get(`/comments/post/${postId}`);
        setComments(res.data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        });
      }
    };

    fetchFreshComments();
  }, [postId, showAllComments]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await axios.post("/comments", {
        content: newComment.trim(),
        post: postId,
      });

      toast({ title: "Success", description: "Comment added successfully" });

      dispatch(getSinglePost(postId)); // 👈 Redux state update trigger
      setNewComment("");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    try {
      await axios.patch(`/comments/${commentId}`, {
        content: commentBeingEdited,
      });

      toast({ title: "Updated", description: "Comment updated successfully" });

      const updated = await axios.get(`/comments/post/${postId}`);
      setComments(updated.data);
      setEditingCommentId(null);
    } catch (err: any) {
      const lengthError = `\"content\" length must be less than or equal to 30 characters long`;
      toast({
        title: "Error",
        description:
          err?.response?.data?.message === lengthError
            ? "Comment must be under 30 characters"
            : "Error updating comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`/comments/${commentId}`);
      toast({ title: "Deleted", description: "Comment deleted successfully" });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      toast({
        title: "Error",
        description: "Error deleting comment",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <CardFooter className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-gray-500 w-full">
        <MessageCircle
          size={20}
          className="cursor-pointer"
          onClick={() => handleOpenPost(postId)}
        />
        {Array.isArray(comments) && comments.length > 0 && (
          <span className="cursor-pointer" onClick={() => handleOpenPost(postId)}>
            {comments.length} comments
          </span>
        )}
      </div>

      {/* New Comment Input */}
      <div className="flex w-full items-center gap-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleAddComment}
          variant="outline"
          className="bg-transparent"
        >
          <Send className="h-4 w-4 stroke-black dark:stroke-white" />
          <span className="sr-only">Send comment</span>
        </Button>

      </div>

      {/* Comments */}
      {Array.isArray(comments) && comments.length > 0 && (
        <div className="w-full space-y-4">
          {comments
            .slice(0, showAllComments ? comments.length : 1)
            .map((comment) => (

              <div key={comment._id} className="flex items-start gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={comment?.commentCreator?.photo || "/Avatar.jpg"}
                    alt={comment?.commentCreator?.name || "User"}
                  />
                  <AvatarFallback>
                    {comment?.commentCreator?.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {comment?.commentCreator?.name ?? "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.createdAt || "")}
                    </p>
                  </div>

                  {editingCommentId === comment._id ? (
                    <div className="mt-1 space-y-2">
                      <Input
                        value={commentBeingEdited || ""}
                        onChange={(e) => setCommentBeingEdited(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => setEditingCommentId(null)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleUpdateComment(comment._id)}
                          size="sm"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{comment.content}</p>
                  )}
                </div>

                {(comment.commentCreator._id === myId || postCreatorId === myId) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {comment.commentCreator._id === myId && (
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setCommentBeingEdited(comment.content);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}

          {comments.length > 1 && !showAllComments && (
            <Button
              variant="link"
              onClick={() => handleOpenPost(postId)}
              className="mt-2 px-0 text-sm text-blue-600"
            >
              Show all {comments.length} comments
            </Button>
          )}

        </div>
      )}
    </CardFooter>
  );
}
