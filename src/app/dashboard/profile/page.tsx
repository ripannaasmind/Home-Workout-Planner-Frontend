"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
    const [form, setForm] = useState({
        name: "Justin Carter",
        email: "justin@example.com",
        phone: "+1 (555) 000-0000",
        bio: "Fitness enthusiast on a journey to build strength and endurance.",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        toast.success("Profile updated successfully!");
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f7f4] rounded-3xl p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your personal information.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar card */}
                <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm flex flex-col items-center text-center gap-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20">
                        <Image src="/profile.jpg" alt="Profile" fill className="object-cover" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-lg">{form.name}</h3>
                        <p className="text-sm text-muted-foreground">{form.email}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full text-xs">
                        Change Photo
                    </Button>
                    <div className="w-full border-t border-border/40 pt-4 space-y-1.5 text-left">
                        <p className="text-xs text-muted-foreground">Member since <span className="font-medium text-foreground">Jan 2024</span></p>
                        <p className="text-xs text-muted-foreground">Workouts completed <span className="font-medium text-foreground">12</span></p>
                        <p className="text-xs text-muted-foreground">Orders placed <span className="font-medium text-foreground">5</span></p>
                    </div>
                </div>

                {/* Edit form */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-border/50 shadow-sm">
                    <h3 className="font-semibold text-foreground text-lg mb-6">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm">Full Name</Label>
                            <Input id="name" name="name" value={form.name} onChange={handleChange} className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm">Email</Label>
                            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-sm">Phone</Label>
                            <Input id="phone" name="phone" value={form.phone} onChange={handleChange} className="rounded-xl" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="bio" className="text-sm">Bio</Label>
                            <Input id="bio" name="bio" value={form.bio} onChange={handleChange} className="rounded-xl" />
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <Button onClick={handleSave} className="rounded-full bg-[#5d8b63] hover:bg-[#4a724f] text-white px-6">
                            Save Changes
                        </Button>
                        <Button variant="outline" className="rounded-full px-6">
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
