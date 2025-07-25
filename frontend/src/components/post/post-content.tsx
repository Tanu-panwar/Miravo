"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PostContentProps {
  body: string;
  image: string;
  editing: boolean;
  onSave: (updatedBody: string, updatedImage: File | null) => void;
  onCancel: () => void;
}

const getFullImageUrl = (path: string) => {
  if (!path || typeof path !== "string") return "";

  const isServer = typeof window === "undefined";

  // Use absolute domain dynamically if deployed
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  if (path.startsWith("/uploads")) {
    return `${baseURL}${path}`;
  }

  if (path.startsWith("http")) return path;

  return `${baseURL}/uploads/${path}`;
};


const PostContent: React.FC<PostContentProps> = ({
  body,
  image,
  editing,
  onSave,
  onCancel,
}) => {
  const [editedBody, setEditedBody] = useState(body);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(getFullImageUrl(image));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-4 space-y-4">
      {editing ? (
        <>
          <Input
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            placeholder="Edit your post content"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:bg-gray-100 file:text-gray-700
              hover:file:bg-gray-200"
          />

          {previewImage && (
            <Image
              src={previewImage}
              alt="Preview"
              width={500}
              height={300}
              className="rounded"
            />
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={() => onSave(editedBody, selectedImage)}
              disabled={!editedBody.trim()}
            >
              Save
            </Button>
          </div>
        </>
      ) : (
        <>
          {image ? (
            <Image
              src={getFullImageUrl(image)}
              alt="Post Image"
              width={500}
              height={0}
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
              className="rounded"
              onError={(e) => {
                console.error("🚨 Image failed to load:", e.currentTarget.src);
                e.currentTarget.src = "/placeholder.png"; // optional fallback
              }}
            />
          ) : (
            <p className="text-gray-400 italic">No image available</p>
          )}
          <p className="text-sm whitespace-pre-wrap">{body}</p>
        </>
      )}
    </div>
  );
};

export default PostContent;
