"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, CheckSquare, Bell, Settings, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUser, logout } from "@/lib/auth";
import { motion } from "framer-motion";
import { useState } from "react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="relative flex h-full flex-col border-r border-border bg-sidebar shrink-0 transition-all duration-300 ease-in-out"
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-bold tracking-tight text-sidebar-foreground"
          >
            TaskForge
          </motion.span>
        )}
        {isCollapsed && (
          <div className="flex w-full items-center justify-center">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              T
            </div>
          </div>
        )}
        
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors group",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-xl bg-sidebar-accent"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3 w-full">
                <item.icon className={cn("size-[18px] shrink-0 transition-colors", isActive ? "text-sidebar-primary" : "group-hover:text-sidebar-foreground")} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="shrink-0 p-4 border-t border-border">
        <div className="flex items-center gap-3 w-full">
          <Avatar className="size-10 rounded-xl ring-1 ring-border/50 shadow-sm cursor-pointer hover:ring-border transition-all">
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-semibold text-xs">
              {user?.name?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.name || "User"}</p>
                <p className="truncate text-xs font-medium text-sidebar-foreground/50">{user?.role || "Member"}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="rounded-lg p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <LogOut className="size-[18px]" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
