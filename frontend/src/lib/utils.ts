// /lib/utils.ts
import { useRouter } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ✅ utility to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ custom hook to navigate to a post
export function useHandleOpenPost() {
  const router = useRouter();
  return (postId: string) => {
    router.push(`/post/${postId}`);
  };
}
