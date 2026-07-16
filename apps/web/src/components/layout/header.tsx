"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/services/notifications.service";
import { Search, Bell, Menu, LogOut, Settings as SettingsIcon, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "../theme-toggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUser, logout } from "@/lib/auth";
import * as React from "react";
import { motion } from "framer-motion";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState(getUser());

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 60000,
  });
  
  React.useEffect(() => {
    setUser(getUser());
  }, []);

  const title = pathname.split("/")[1]
    ? pathname.split("/")[1].charAt(0).toUpperCase() + pathname.split("/")[1].slice(1)
    : "Dashboard";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 md:px-6 transition-colors duration-300">
      <div className="flex items-center gap-4 lg:w-[280px]">
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-muted-foreground hover:text-foreground rounded-xl" />
          }>
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 border-r-0">
             <div className="sr-only">
               <SheetTitle>Navigation Menu</SheetTitle>
               <SheetDescription>Access TaskForge pages and settings.</SheetDescription>
             </div>
            <Sidebar />
          </SheetContent>
        </Sheet>
        
        <h1 className="text-lg font-bold tracking-tight text-foreground lg:hidden">{title}</h1>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-md flex items-center group">
          <Search className="absolute left-3 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            type="search" 
            placeholder="Search tasks, projects, or people..." 
            className="w-full rounded-full bg-secondary/50 hover:bg-secondary/80 focus:bg-background pl-10 border-transparent focus-visible:border-primary/30 focus-visible:ring-primary/20 h-10 text-sm transition-all shadow-none" 
          />
          <div className="absolute right-3 flex gap-1">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 px-4 md:gap-4 lg:px-8">
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground relative rounded-xl hover:bg-secondary/80 transition-colors"
          onClick={() => router.push("/notifications")}
        >
          <Bell className="size-[1.2rem]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-transparent ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-1" />
          }>
            <Avatar className="size-9 rounded-xl ring-1 ring-border/50 hover:ring-border transition-all shadow-sm">
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xs">
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-xl border-border/50 bg-popover shadow-lg backdrop-blur-xl p-1 mt-1">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-semibold leading-none text-foreground">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground font-medium">{user?.email || "user@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50 -mx-1" />
            <DropdownMenuItem disabled className="cursor-default text-muted-foreground rounded-lg my-0.5 px-3 py-2">
              <User className="mr-2 size-4" />
              <span className="font-medium">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer text-foreground focus:bg-secondary rounded-lg my-0.5 px-3 py-2 transition-colors">
              <SettingsIcon className="mr-2 size-4 text-muted-foreground" />
              <span className="font-medium">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50 -mx-1" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg my-0.5 px-3 py-2 transition-colors">
              <LogOut className="mr-2 size-4" />
              <span className="font-medium">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
