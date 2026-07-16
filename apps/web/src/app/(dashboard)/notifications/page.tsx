"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Info, TriangleAlert, CircleAlert, Bell, RefreshCw, CheckCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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
  SUCCESS: "text-success",
  INFO: "text-primary",
  WARNING: "text-warning",
  ERROR: "text-destructive",
};

type TabState = "ALL" | "UNREAD" | "READ";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

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
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Notifications</h2>
          <p className="text-muted-foreground font-medium">Stay updated with project activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="h-10 shadow-sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 size-[1.1rem]" />
            Refresh
          </Button>
          <Button 
            className="h-10 shadow-sm font-bold"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="mr-2 size-[1.1rem]" />
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border/60">
        {(["ALL", "UNREAD", "READ"] as TabState[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-3.5 text-[13px] font-extrabold tracking-wide uppercase transition-colors ${
              activeTab === tab 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col space-y-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : isError ? (
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 rounded-2xl">
            <AlertCircle className="size-5" />
            <AlertTitle className="font-bold">Error Loading Notifications</AlertTitle>
            <AlertDescription className="font-medium">
              {error instanceof Error ? error.message : "Something went wrong."}
            </AlertDescription>
          </Alert>
        ) : filteredNotifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-border/60 bg-secondary/30"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary mb-4 ring-4 ring-background">
              <Bell className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No notifications</h3>
            <p className="text-sm font-medium text-muted-foreground/70 mt-1">You are all caught up!</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification) => {
                const Icon = ICONS[notification.type];
                return (
                  <motion.div
                    variants={itemVariants}
                    layout
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                    className={`group relative flex cursor-pointer gap-4 rounded-2xl border shadow-sm p-5 transition-all overflow-hidden ${
                      notification.isRead 
                        ? "border-border/60 bg-card hover:border-border hover:shadow-md" 
                        : "border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10 hover:shadow-md"
                    }`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl" />
                    )}
                    
                    <div className={`mt-0.5 shrink-0 p-2 rounded-xl bg-background shadow-sm border border-border/50 ${ICON_COLORS[notification.type]}`}>
                      <Icon className="size-5" />
                    </div>
                    
                    <div className="flex flex-col gap-1 w-full pt-1">
                      <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-1">
                        <h4 className="font-bold text-foreground">{notification.title}</h4>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed max-w-[90%]">
                        {notification.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
