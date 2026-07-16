import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | TaskForge",
  description: "Manage projects with confidence.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#FAFAFA]">
      {/* Left Side: Login Form */}
      <div className="flex w-full flex-col justify-center items-center p-4 lg:w-1/2 bg-[#FFFFFF]">
        <LoginForm />
      </div>

      {/* Right Side: Abstract Blue CSS Background (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#2563EB]">
        {/* Abstract shapes using pure CSS */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-black/10 blur-3xl" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-white/5 blur-2xl" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              TaskForge
            </h2>
            <p className="text-lg text-white/80">
              The premium project management platform for high-performing engineering teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}