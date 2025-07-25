// Notifications.tsx
import { useEffect } from "react";
import { connectSocket } from "@/lib/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/Redux/ReduxStore";
import { toast } from "@/hooks/use-toast";

export default function NotificationListener() {
  const userId = useSelector(
    (state: RootState) => state.auth.userInfo.user._id
  );

  useEffect(() => {
    if (!userId) return;

    const socket = connectSocket(userId);

    socket.on("notification", (message: string) => {
      toast({
        title: "New Notification 🔔",
        description: message,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return null;
}
