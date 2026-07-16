"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { getUser } from "@/lib/auth";
import { User, Lock, Bell, Globe, Monitor, Moon, Sun, AlertCircle, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type SettingsTab = "account" | "security" | "preferences";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const { theme, setTheme } = useTheme();
  const user = getUser();

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          Settings
        </h2>
        <p className="text-muted-foreground font-medium">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeSettingsTab"
                      className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "account" && (
                <div className="space-y-6">
                  <Card className="rounded-2xl border-border/40 bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Profile Information</CardTitle>
                      <CardDescription>
                        Your personal account details. This information is currently read-only as the backend does not support profile updates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-2">
                        <label className="text-sm font-bold text-foreground">Full Name</label>
                        <Input readOnly value={user?.name || ""} className="bg-secondary/30 text-muted-foreground cursor-not-allowed h-11 rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-bold text-foreground">Email Address</label>
                        <Input readOnly value={user?.email || ""} className="bg-secondary/30 text-muted-foreground cursor-not-allowed h-11 rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-bold text-foreground">Account Role</label>
                        <div className="flex items-center h-11 px-3 rounded-xl bg-secondary/30 border border-border/50">
                          <Badge variant="outline" className="bg-background text-foreground font-bold">
                            {user?.role.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/10 border-t border-border/40 p-4 rounded-b-2xl">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="size-3.5" />
                        Profile editing will be available in a future update.
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <Card className="rounded-2xl border-border/40 bg-card shadow-sm opacity-70">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Change Password</CardTitle>
                      <CardDescription>
                        Update your account password to maintain security.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-2">
                        <label className="text-sm font-bold text-muted-foreground">Current Password</label>
                        <Input type="password" disabled placeholder="••••••••" className="bg-secondary/30 cursor-not-allowed h-11 rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-bold text-muted-foreground">New Password</label>
                        <Input type="password" disabled placeholder="••••••••" className="bg-secondary/30 cursor-not-allowed h-11 rounded-xl" />
                      </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/10 border-t border-border/40 p-4 rounded-b-2xl flex justify-between items-center">
                      <p className="text-xs font-bold text-destructive flex items-center gap-1.5">
                        <AlertCircle className="size-3.5" />
                        Password changes are not supported by the current API version.
                      </p>
                      <Button disabled className="rounded-xl font-bold">
                        <Save className="mr-2 size-4" />
                        Update Password
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <Card className="rounded-2xl border-border/40 bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Appearance</CardTitle>
                      <CardDescription>
                        Customize the visual theme of the application.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => setTheme("light")}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            theme === "light" ? "border-primary bg-primary/5" : "border-border/50 bg-secondary/20 hover:bg-secondary/50"
                          }`}
                        >
                          <Sun className={`size-6 mb-2 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-bold ${theme === "light" ? "text-primary" : "text-foreground"}`}>Light</span>
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            theme === "dark" ? "border-primary bg-primary/5" : "border-border/50 bg-secondary/20 hover:bg-secondary/50"
                          }`}
                        >
                          <Moon className={`size-6 mb-2 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-bold ${theme === "dark" ? "text-primary" : "text-foreground"}`}>Dark</span>
                        </button>
                        <button
                          onClick={() => setTheme("system")}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            theme === "system" ? "border-primary bg-primary/5" : "border-border/50 bg-secondary/20 hover:bg-secondary/50"
                          }`}
                        >
                          <Monitor className={`size-6 mb-2 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-bold ${theme === "system" ? "text-primary" : "text-foreground"}`}>System</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border/40 bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Notifications</CardTitle>
                      <CardDescription>
                        Manage how you receive updates and alerts.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-foreground">Email Notifications</p>
                          <p className="text-xs font-medium text-muted-foreground">Receive daily summaries and critical alerts via email.</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-secondary/50 opacity-50 transition-colors">
                          <span className="translate-x-[2px] inline-block size-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-foreground">Push Notifications</p>
                          <p className="text-xs font-medium text-muted-foreground">Receive instant updates in your browser.</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-primary/50 opacity-50 transition-colors">
                          <span className="translate-x-[22px] inline-block size-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/10 border-t border-border/40 p-4 rounded-b-2xl">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="size-3.5" />
                        Notification preferences are currently read-only.
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
