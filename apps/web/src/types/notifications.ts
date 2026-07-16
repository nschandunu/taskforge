export type NotificationType = "SUCCESS" | "INFO" | "WARNING" | "ERROR";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}
