"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bell, Shield, Palette, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        workoutReminders: true,
        orderUpdates: true,
        darkMode: false,
        twoFactor: false,
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
        toast.success("Setting updated.");
    };

    const handleLogout = () => {
        localStorage.removeItem("fithome-token");
        localStorage.removeItem("fithome-user");
        router.push("/login");
    };

    const sections = [
        {
            icon: Bell,
            title: "Notifications",
            items: [
                { key: "emailNotifications" as const, label: "Email Notifications", description: "Receive updates via email" },
                { key: "pushNotifications" as const, label: "Push Notifications", description: "Browser push alerts" },
                { key: "workoutReminders" as const, label: "Workout Reminders", description: "Get reminded before scheduled workouts" },
                { key: "orderUpdates" as const, label: "Order Updates", description: "Shipping and delivery notifications" },
            ],
        },
        // {
        //     icon: Palette,
        //     title: "Appearance",
        //     items: [
        //         { key: "darkMode" as const, label: "Dark Mode", description: "Switch to dark theme" },
        //     ],
        // },
        // {
        //     icon: Shield,
        //     title: "Security",
        //     items: [
        //         { key: "twoFactor" as const, label: "Two-Factor Authentication", description: "Add extra security to your account" },
        //     ],
        // },
    ];

    return (
        <div className="flex flex-col h-full bg-[#f4f7f4] rounded-3xl p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account preferences.</p>
            </div>

            <div className="space-y-4 max-w-2xl">
                {sections.map(({ icon: Icon, title, items }) => (
                    <div key={title} className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <Icon className="w-5 h-5 text-[#5d8b63]" />
                            <h3 className="font-semibold text-foreground">{title}</h3>
                        </div>
                        <div className="space-y-4">
                            {items.map(({ key, label, description }) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor={key} className="text-sm font-medium cursor-pointer">{label}</Label>
                                        <p className="text-xs text-muted-foreground">{description}</p>
                                    </div>
                                    <Switch
                                        id={key}
                                        checked={settings[key]}
                                        onCheckedChange={() => toggle(key)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Danger zone */}
                <div className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <LogOut className="w-5 h-5 text-red-500" />
                        <h3 className="font-semibold text-foreground">Account</h3>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="rounded-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
