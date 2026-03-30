"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/services/api";
import { uploadImage, validateImageFile } from "@/services/imageUploadService";


// ------- Unified Profile Page — name + avatar + password in ONE form -------
export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.name);
    setAvatarPreview((prev) => (prev === undefined ? user.avatar : prev));
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 5);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file);
      setAvatarPreview(url);
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    if (!user || !token) return;

    // Password validation (only if user is trying to change)
    const changingPassword = !!(currentPassword || newPassword || confirmPassword);
    if (changingPassword) {
      if (!currentPassword) { toast.error("Current password is required"); return; }
      if (!newPassword || newPassword.length < 6) { toast.error("New password must be at least 6 characters"); return; }
      if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = { name: name.trim() };
      if (avatarPreview && avatarPreview !== user.avatar) payload.avatar = avatarPreview;
      if (changingPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }

      const res = await userApi.updateProfile(payload as { name: string; avatar?: string }, token);
      const updated = { ...user, ...res.data };
      updateUser(updated);
      localStorage.setItem("fithome-user", JSON.stringify(updated));

      // If password was changed, save new token
      if ((res.data as Record<string, unknown>).token) {
        localStorage.setItem("fithome-token", (res.data as Record<string, unknown>).token as string);
      }

      toast.success("Profile updated successfully");
      if (changingPassword) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const nameChanged = name.trim() !== (user?.name ?? "");
  const avatarChanged = avatarPreview !== user?.avatar;
  const passwordFilled = !!(currentPassword || newPassword || confirmPassword);
  const isDirty = nameChanged || avatarChanged || passwordFilled;

  return (
    <div className="space-y-5 w-full max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Profile</h1>
        <p className="text-gray-400 text-sm mt-0.5">Update your name, photo, and password — all in one place</p>
      </div>

      <section className="rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        {/* Avatar + Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={avatarPreview} />
              <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                {name.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {uploadingAvatar
                ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                : <Camera className="h-3.5 w-3.5 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-gray-800 dark:text-gray-100 font-semibold">{name || user?.name}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-primary/10 text-primary border-0 capitalize">{user?.role ?? "user"}</Badge>
              {user?.isEmailVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" className="mt-3 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800/50" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
              {uploadingAvatar && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {uploadingAvatar ? "Uploading..." : "Upload new photo"}
            </Button>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP · max 5 MB</p>
          </div>
        </div>

        <Separator className="bg-gray-100 dark:bg-gray-800 mb-5" />

        {/* Name */}
        <div className="space-y-4">
          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100" />
          </div>

          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">Email Address</Label>
            <Input value={user?.email ?? ""} readOnly className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">
              To change email, go to{" "}
              <a href="/dashboard/settings" className="text-primary hover:underline">Settings</a>
            </p>
          </div>

          <Separator className="bg-gray-100 dark:bg-gray-800" />

          {/* Password Section */}
          <p className="text-sm text-gray-500 dark:text-gray-400">Leave password fields empty if you don&apos;t want to change it.</p>
          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">Current Password</Label>
            <div className="relative">
              <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 pr-10" />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">New Password</Label>
            <div className="relative">
              <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" className="bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 pr-10" />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className={`bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 ${confirmPassword && confirmPassword !== newPassword ? "border-red-300 focus-visible:ring-red-300" : ""}`} />
            {confirmPassword && confirmPassword !== newPassword && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
          </div>

          <Button onClick={handleSave} disabled={saving || !isDirty} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All Changes
          </Button>
        </div>
      </section>
    </div>
  );
}
