"use client";

import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, SquarePen, X } from "lucide-react";
import Image from "next/image";
import axios from "@/lib/axios";
import { toast } from "@/hooks/use-toast";

interface AddPostProps {
  onPostCreated?: () => void;
  onClose?: () => void;
}

export default function AddPost({ onPostCreated, onClose }: AddPostProps) {
  const [postText, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleBodyChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!postText.trim()) return;
    if (!token) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "Please login first to create a post.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "";

      if (image) {
        const imageForm = new FormData();
        imageForm.append("image", image);

        const imageRes = await axios.post("/user/upload", imageForm, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        imageUrl = imageRes.data.imageUrl;
      }

      const postPayload = {
        content: postText,
        image: imageUrl || undefined, 
      };

      await axios.post("/posts", postPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Queued for publishing ⏳",
        description: "Your post will appear shortly after processing.",
      });

      // Reset form
      setBody("");
      setImage(null);
      setImagePreview(null);

      if (onPostCreated) onPostCreated();
      if (onClose) onClose();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Post failed",
        description: error?.response?.data?.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-3">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <SquarePen className="inline-block pr-2" size={30} /> Create a New Post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="What's on your mind?"
          value={postText}
          onChange={handleBodyChange}
          rows={4}
          className="resize-none"
        />

        <div className="flex items-center space-x-2">
          {imagePreview && (
            <div className="relative w-20 h-20">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="rounded-md object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={handleSubmit} disabled={!postText.trim() || isSubmitting}>
            {isSubmitting ? "Posting..." : "Post"}
          </Button>

          <div className="flex items-center space-x-2">
            <Input
              id="post-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Label
              htmlFor="post-image"
              className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ImagePlus className="h-5 w-5 text-gray-600" />
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
