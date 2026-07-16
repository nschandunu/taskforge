"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/services/notifications.service";
import { Search, Bell, Menu, LogOut, Settings as SettingsIcon, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "./sidebar";
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
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-[#FFFFFF] px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-[#6B7280] hover:text-[#111827]" />
          }>
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 border-r-0">
             {/* Hidden Title/Description to fix accessibility warnings for Radix Dialog */}
             <div className="sr-only">
               <SheetTitle>Navigation Menu</SheetTitle>
               <SheetDescription>Access TaskForge pages and settings.</SheetDescription>
             </div>
            <Sidebar />
          </SheetContent>
        </Sheet>
        
        <h1 className="text-lg font-semibold text-[#111827]">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex relative w-64 items-center">
          <Search className="absolute left-2.5 size-4 text-[#6B7280]" />
          <Input 
            type="search" 
            placeholder="Search..." 
            className="w-full rounded-lg bg-[#FAFAFA] pl-9 border-[#E5E7EB] focus-visible:ring-[#2563EB] h-9 text-sm" 
          />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-[#6B7280] hover:text-[#111827] relative"
          onClick={() => router.push("/notifications")}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[9px] font-medium text-white ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="rounded-lg hover:bg-transparent" />
          }>
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-[#2563EB]/10 text-[#2563EB] text-xs">
                {user?.name?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-[#111827]">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-[#6B7280]">{user?.email || "user@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#E5E7EB]" />
            <DropdownMenuItem disabled className="cursor-default text-[#6B7280]">
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer text-[#111827] focus:bg-[#FAFAFA]">
              <SettingsIcon className="mr-2 size-4 text-[#6B7280]" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#E5E7EB]" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-[#DC2626] focus:bg-[#FAFAFA] focus:text-[#DC2626]">
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
