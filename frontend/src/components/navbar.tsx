"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/Redux/hooks";
import { LogIn, LogOut, User, UserPlus, Home } from "lucide-react";

import logo from "../assets/logo.png";
import defaultAvatar from "../../public/Avatar.jpg";

import { ModeToggle } from "./ui/dark-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { RootState } from "@/lib/Redux/ReduxStore";
import { clearUserData, getMyInfo } from "@/lib/Redux/AuthSlice";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state: RootState) => state.auth.userInfo.user);
  const isAuth = useAppSelector((state: RootState) => state.auth.isAuth);

  const [isMounted, setIsMounted] = useState(false); // 👈
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    if (token) dispatch(getMyInfo());
  }, [dispatch]);

  if (!isMounted) return null; // 👈 Prevent hydration mismatch

  const handleLogout = () => {
    dispatch(clearUserData());
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 border-b dark:bg-black bg-white">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <Image src={logo} alt="Yap Logo" width={40} height={40} priority/>
        <span className="font-bold text-3xl italic text-blue-500">Miravo</span>
      </Link>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <ModeToggle />

        {isAuth && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full p-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.photo || defaultAvatar.src}
                    alt={user.name || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end" forceMount>
              <Link href="/">
                <DropdownMenuItem>
                  <Home className="mr-2 h-4 w-4" />
                  <span className="text-foreground">Home</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/explore">
                <DropdownMenuItem>
                  <Home className="mr-2 h-4 w-4" />
                  <span className="text-foreground">Explore</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span className="text-foreground">Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-foreground">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            {pathname !== "/login" && (
              <Link href="/login">
                <Button variant="outline">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
            {pathname !== "/signup" && (
              <Link href="/signup">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
