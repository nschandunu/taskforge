"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  if (!mounted || !isAuthenticated()) {
    return null; // Return null while checking auth on client-side to prevent hydration mismatch/flicker
  }

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA]">
      <div className="hidden lg:block lg:w-[280px] lg:shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
