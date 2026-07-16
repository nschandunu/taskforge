import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Notification, NotificationsResponse, UnreadCountResponse } from "@/types/notifications";

export async function getNotifications(): Promise<Notification[]> {
  const token = getToken();
  const { data } = await api.get<NotificationsResponse>("/notifications", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch notifications");
  }

  return data.data;
}

export async function getUnreadCount(): Promise<number> {
  try {
    const token = getToken();
    const { data } = await api.get<UnreadCountResponse>("/notifications/unread-count", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!data.success) {
      return 0;
    }

    return data?.data?.count ?? 0;
  } catch (error) {
    return 0;
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const token = getToken();
  const { data } = await api.patch<{ success: boolean; message: string }>(`/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!data.success) {
    throw new Error(data.message || "Failed to mark notification as read");
  }
}

export async function markAllNotificationsAsRead(unreadIds: string[]): Promise<void> {
  // Since there is no bulk endpoint, we run them concurrently
  await Promise.all(unreadIds.map((id) => markNotificationAsRead(id)));
}
