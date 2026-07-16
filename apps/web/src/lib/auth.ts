import type { User } from "@/types/auth";

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export function saveAuth(
  token: string,
  user: User,
) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  const value = localStorage.getItem(USER_KEY);

  return value ? JSON.parse(value) : null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}