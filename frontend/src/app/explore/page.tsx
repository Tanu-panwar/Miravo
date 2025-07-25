"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function ExplorePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/user/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      toast({ variant: "destructive", title: "Error fetching users" });
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (userId: string, isFollowed: boolean) => {
    const token = localStorage.getItem("token");
    const url = `/user/${userId}/${isFollowed ? "unfollow" : "follow"}`;
    try {
      await axios.put(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: isFollowed ? "Unfollowed" : "Followed" });
      fetchUsers();
    } catch {
      toast({ variant: "destructive", title: "Action failed" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p className="text-center mt-10 text-muted-foreground">Loading users...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 mt-10 space-y-6">
      {/* Centered title */}
      <h2 className="text-3xl font-bold text-center text-foreground">
        🌐 Explore New Users
      </h2>

      {users.length === 0 ? (
        <p className="text-center text-muted-foreground">No users found</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center px-6 py-4 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div>
                <p className="font-medium text-lg text-foreground">
                  {user.username}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => toggleFollow(user._id, user.isFollowed)}
                className="transition-colors duration-200 border-2 border-gray-300 dark:border-zinc-600 
             hover:bg-primary hover:text-white 
             dark:hover:bg-white dark:hover:text-black"
              >
                {user.isFollowed ? "Unfollow" : "Follow"}
              </Button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
