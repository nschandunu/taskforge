"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Info, TriangleAlert, CircleAlert, Bell, RefreshCw, CheckCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/notifications.service";
import type { Notification, NotificationType } from "@/types/notifications";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function formatRelativeTime(dateString: string): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const date = new Date(dateString);
  const diffInMs = date.getTime() - Date.now();
  const diffInSeconds = Math.round(diffInMs / 1000);
  const diffInMinutes = Math.round(diffInSeconds / 60);
  const diffInHours = Math.round(diffInMinutes / 60);
  const diffInDays = Math.round(diffInHours / 24);

  if (Math.abs(diffInDays) >= 1) return rtf.format(diffInDays, "day");
  if (Math.abs(diffInHours) >= 1) return rtf.format(diffInHours, "hour");
  if (Math.abs(diffInMinutes) >= 1) return rtf.format(diffInMinutes, "minute");
  return rtf.format(diffInSeconds, "second");
}

const ICONS: Record<NotificationType, React.ElementType> = {
  SUCCESS: CheckCircle,
  INFO: Info,
  WARNING: TriangleAlert,
  ERROR: CircleAlert,
};

const ICON_COLORS: Record<NotificationType, string> = {
  SUCCESS: "text-[#16A34A]",
  INFO: "text-[#2563EB]",
  WARNING: "text-[#F59E0B]",
  ERROR: "text-[#DC2626]",
};

type TabState = "ALL" | "UNREAD" | "READ";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabState>("ALL");

  const { data: notifications, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 60000, 
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData<Notification[]>(["notifications"]);
      
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(["notifications"], (old) => {
          if (!old) return old;
          return old.map(n => n.id === id ? { ...n, isRead: true } : n);
        });
      }
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      toast.error(err.message || "Failed to mark as read");
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: (unreadIds: string[]) => markAllNotificationsAsRead(unreadIds),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData<Notification[]>(["notifications"]);
      
      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(["notifications"], (old) => {
          if (!old) return old;
          return old.map(n => ({ ...n, isRead: true }));
        });
      }
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      toast.error("Failed to mark all as read");
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All caught up!");
    },
  });

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (isRead) return;
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    if (!notifications) return;
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;
    markAllMutation.mutate(unreadIds);
  };

  const filteredNotifications = notifications?.filter(n => {
    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "READ") return n.isRead;
    return true;
  }) || [];

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Notifications</h2>
          <p className="text-[#6B7280]">Stay updated with project activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-lg border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#FAFAFA] text-[#111827] shadow-sm h-10"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
          <Button 
            className="rounded-lg bg-[#111827] text-[#FFFFFF] hover:bg-[#111827]/90 h-10 shadow-sm"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#E5E7EB]">
        {(["ALL", "UNREAD", "READ"] as TabState[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab 
                ? "border-[#2563EB] text-[#2563EB]" 
                : "border-transparent text-[#6B7280] hover:text-[#111827] hover:border-[#E5E7EB]"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col space-y-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error Loading Notifications</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Something went wrong."}
            </AlertDescription>
          </Alert>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA]">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#E5E7EB]/50 mb-4">
              <Bell className="size-6 text-[#6B7280]" />
            </div>
            <h3 className="text-lg font-semibold text-[#111827]">No notifications</h3>
            <p className="text-sm text-[#6B7280]">You are all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredNotifications.map((notification) => {
              const Icon = ICONS[notification.type];
              return (
                <div
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                  className={`group relative flex cursor-pointer gap-4 rounded-xl border shadow-sm p-4 transition-all overflow-hidden ${
                    notification.isRead 
                      ? "border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#2563EB]/30" 
                      : "border-[#2563EB]/20 bg-[#2563EB]/[0.02] hover:border-[#2563EB]/40"
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                  )}
                  
                  <div className={`mt-0.5 shrink-0 ${ICON_COLORS[notification.type]}`}>
                    <Icon className="size-5" />
                  </div>
                  
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-1">
                      <h4 className="font-semibold text-[#111827]">{notification.title}</h4>
                      <span className="text-xs font-medium text-[#6B7280]">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
