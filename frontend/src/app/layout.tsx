"use client";
import "./globals.css";
import { Navbar } from "../components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import NotificationListener from "@/app/Notifications";
import { Provider, useDispatch } from "react-redux";
import reduxStore from "@/lib/Redux/ReduxStore";
import { Toaster } from "@/components/ui/toaster";
import { getMyData } from "@/lib/Redux/PostsSlice";
import { useEffect } from "react";
import type { AppDispatch } from "@/lib/Redux/ReduxStore";
import { useRef } from "react";

function MyIdInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;

    const token = localStorage.getItem("access_token");
    if (token) {
      dispatch(getMyData());
      calledRef.current = true;
    }
  }, [dispatch]);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Miravo</title>
        <meta charSet="UTF-8" />
        <meta name="description" content="A modern social media app built with Next.js and NestJS" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Provider store={reduxStore}>
            <Navbar />
            <MyIdInitializer /> {/* ✅ This sets myId */}
            <main className="container md:mt-16 mt-2">{children}</main>
            <Toaster />
            <NotificationListener />
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
