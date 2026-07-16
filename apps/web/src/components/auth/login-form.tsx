"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { login } from "@/services/auth.service";
import { saveAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });

      if (response.success && response.data) {
        saveAuth(response.data.accessToken, response.data.user);
        toast.success("Login successful");
        router.push("/dashboard");
      } else {
        toast.error(response.message || "Failed to login. Please check your credentials.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-[420px] rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm">
      <CardHeader className="space-y-2 text-center pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-[#111827]">TaskForge</CardTitle>
        <CardDescription className="text-[#6B7280]">
          Manage projects with confidence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-[#111827]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="rounded-lg"
              disabled={isLoading}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm font-medium text-[#DC2626]">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#111827]">Password</Label>
              <a href="#" className="text-sm font-medium text-[#2563EB] hover:underline" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              className="rounded-lg"
              disabled={isLoading}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm font-medium text-[#DC2626]">{form.formState.errors.password.message}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 pt-1 pb-2">
            <input
              type="checkbox"
              id="rememberMe"
              className="size-4 rounded border-[#E5E7EB] text-[#2563EB] focus:ring-[#2563EB]"
              disabled={isLoading}
              {...form.register("rememberMe")}
            />
            <Label htmlFor="rememberMe" className="text-sm font-medium leading-none text-[#6B7280] peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full rounded-lg bg-[#2563EB] text-[#FAFAFA] hover:bg-[#2563EB]/90" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Log in
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-[#E5E7EB]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#FFFFFF] px-2 text-[#6B7280]">Demo Accounts</span>
          </div>
        </div>

        <div className="space-y-3 text-sm text-left">
          <div className="flex justify-between rounded-lg border border-[#E5E7EB] p-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer" onClick={() => {
            form.setValue("email", "admin@taskforge.com");
            form.setValue("password", "Password@123");
          }}>
            <div>
              <p className="font-medium text-[#111827]">Admin</p>
              <p className="text-xs text-[#6B7280]">admin@taskforge.com</p>
            </div>
            <p className="text-xs text-[#6B7280] font-mono mt-1">Password@123</p>
          </div>
          
          <div className="flex justify-between rounded-lg border border-[#E5E7EB] p-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer" onClick={() => {
            form.setValue("email", "manager@taskforge.com");
            form.setValue("password", "Password@123");
          }}>
            <div>
              <p className="font-medium text-[#111827]">Manager</p>
              <p className="text-xs text-[#6B7280]">manager@taskforge.com</p>
            </div>
            <p className="text-xs text-[#6B7280] font-mono mt-1">Password@123</p>
          </div>
          
          <div className="flex justify-between rounded-lg border border-[#E5E7EB] p-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer" onClick={() => {
            form.setValue("email", "member@taskforge.com");
            form.setValue("password", "Password@123");
          }}>
            <div>
              <p className="font-medium text-[#111827]">Member</p>
              <p className="text-xs text-[#6B7280]">member@taskforge.com</p>
            </div>
            <p className="text-xs text-[#6B7280] font-mono mt-1">Password@123</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}