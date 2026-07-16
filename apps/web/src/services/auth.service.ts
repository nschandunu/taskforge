import { api } from "@/lib/api";

import type {
  LoginDto,
  LoginResponse,
} from "@/types/auth";

export async function login(
  dto: LoginDto,
) {
  const { data } =
    await api.post<LoginResponse>(
      "/auth/login",
      dto,
    );

  return data;
}