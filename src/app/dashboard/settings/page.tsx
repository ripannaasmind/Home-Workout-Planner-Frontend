"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, Globe, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/context/AuthContext";
import { userApi } from "@/services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sanitize, validateName, validatePassword, validateConfirmPassword } from "@/lib/validation";

const NOTIF_KEY = "fithome-notifications";

function loadPref<T>(key: string, defaults: T): T {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}


// ------- Settings Page Component -------
export default function SettingsPage() {
  const { user, token, updateUser, logout } = useAuth();
  const router = useRouter();

  
  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  
  const [notif, setNotif] = useState({
    orderUpdates: true,
    workoutReminders: true,
    promoEmails: false,
  });

  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  
  useEffect(() => {
    setNotif(loadPref(NOTIF_KEY, { orderUpdates: true, workoutReminders: true, promoEmails: false }));
  }, []);

  
  const saveNotif = (updated: typeof notif) => {
    setNotif(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    toast.success("Notification preferences saved");
  };

  
  const handleSaveProfile = async () => {
    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      toast.error(nameCheck.message);
      return;
    }
    if (!token) return;
    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ name: sanitize(name) }, token);
      updateUser(res.data);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  
  const handleChangePassword = async () => {
    const passCheck = validatePassword(newPassword);
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!passCheck.valid) {
      toast.error(passCheck.message);
      return;
    }
    const confirmCheck = validateConfirmPassword(newPassword, confirmPassword);
    if (!confirmCheck.valid) {
      toast.error(confirmCheck.message);
      return;
    }
    if (!token) return;
    setSavingPassword(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword }, token);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  
  const handleDeleteAccount = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      await userApi.deleteAccount(token);
      logout();
      toast.success("Account deleted");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-5 w-full max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your account preferences and security</p>
      </div>

      {/* Language Settings */}
      <Link href="/dashboard/settings/language" className="block">
        <section className="rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-gray-800 dark:text-gray-100 font-semibold text-sm">Language</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Change the display language of the site</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
        </section>
      </Link>

      {}
      <section className="rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
        <h3 className="text-gray-800 dark:text-gray-100 font-semibold">Profile Information</h3>
        <Separator className="bg-gray-100 dark:bg-gray-800" />
        <div className="space-y-4">
          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">Email Address</Label>
            <Input
              value={user?.email ?? ""}
              readOnly
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email address cannot be changed</p>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={savingProfile || name.trim() === (user?.name ?? "")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </section>

      {}
      <section className="rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
        <h3 className="text-gray-800 dark:text-gray-100 font-semibold">Change Password</h3>
        <Separator className="bg-gray-100 dark:bg-gray-800" />
        <div className="space-y-3">
          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-gray-600 dark:text-gray-300 mb-1.5 block text-sm">Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className={`bg-white dark:bg-card border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-300 focus-visible:ring-red-300"
                  : ""
              }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </div>
      </section>

      {}
      <section className="rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
        <h3 className="text-gray-800 dark:text-gray-100 font-semibold">Notifications</h3>
        <Separator className="bg-gray-100 dark:bg-gray-800" />
        {[
          {
            key: "orderUpdates" as const,
            label: "Order Updates",
            desc: "Get notified when your order status changes",
          },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">{label}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{desc}</p>
            </div>
            <Switch
              checked={notif[key]}
              onCheckedChange={(v) => saveNotif({ ...notif, [key]: v })}
            />
          </div>
        ))}
      </section>

      {}
      <section className="rounded-2xl bg-red-50 border border-red-200 p-6 space-y-4">
        <h3 className="text-red-600 font-semibold">Danger Zone</h3>
        <Separator className="bg-red-200" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">Delete Account</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Permanently delete your account and all associated data</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="This will permanently delete your account, workout history, and all orders. This action cannot be undone."
        confirmText="Yes, delete my account"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
