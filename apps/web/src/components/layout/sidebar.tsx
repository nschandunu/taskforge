"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, Bell, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUser, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-[#E5E7EB] bg-[#FFFFFF]">
      <div className="flex h-[72px] shrink-0 items-center px-6 border-b border-transparent">
        <span className="text-xl font-bold tracking-tight text-[#111827]">TaskForge</span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-[#FAFAFA]",
                isActive ? "bg-[#FAFAFA] text-[#2563EB]" : "text-[#6B7280] hover:text-[#111827]"
              )}
            >
              <item.icon className={cn("size-4", isActive ? "text-[#2563EB]" : "")} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="shrink-0 border-t border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-lg">
            <AvatarFallback className="rounded-lg bg-[#2563EB]/10 text-[#2563EB] text-xs">
              {user?.name?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-[#111827]">{user?.name || "User"}</p>
            <p className="truncate text-xs text-[#6B7280]">{user?.role || "Member"}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="rounded-lg p-2 text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111827] transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
