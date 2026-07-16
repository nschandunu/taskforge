export interface LoginDto {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
}

export interface LoginResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    accessToken: string;
    user: User;
  };
}