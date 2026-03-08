"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";
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


// ------- Profile Page Component -------
export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    if (user) {
      if (!name) setName(user.name);
      if (avatarPreview === undefined) setAvatarPreview(user.avatar);
    }
    
  }, [user?._id]);

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
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!user) return;
    setSaving(true);

    
    const updatedUser = { ...user, name: name.trim(), avatar: avatarPreview };
    updateUser(updatedUser);
    
    localStorage.setItem("fithome-user", JSON.stringify(updatedUser));

    toast.success("Profile updated successfully");

    
    if (token) {
      try {
        const res = await userApi.updateProfile(
          { name: name.trim(), avatar: avatarPreview },
          token
        );
        
        updateUser({ ...updatedUser, ...res.data });
        localStorage.setItem("fithome-user", JSON.stringify({ ...updatedUser, ...res.data }));
      } catch {
        
      }
    }

    setSaving(false);
  };

  const isDirty = name.trim() !== (user?.name ?? "") || avatarPreview !== user?.avatar;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your personal information</p>
      </div>

      {}
      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h3 className="text-gray-800 font-semibold mb-4">Profile Photo</h3>
        <Separator className="bg-gray-100 mb-4" />
        <div className="flex items-center gap-6">
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-gray-800 font-semibold">{name || user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-primary/10 text-primary border-0 capitalize">
                {user?.role ?? "user"}
              </Badge>
              {user?.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {uploadingAvatar ? "Uploading..." : "Upload new photo"}
            </Button>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP · max 5 MB</p>
          </div>
        </div>
      </section>

      {}
      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h3 className="text-gray-800 font-semibold mb-4">Personal Information</h3>
        <Separator className="bg-gray-100 mb-4" />
        <div className="space-y-4">
          <div>
            <Label className="text-gray-600 mb-1.5 block text-sm">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="bg-white border-gray-200 text-gray-800"
            />
          </div>
          <div>
            <Label className="text-gray-600 mb-1.5 block text-sm">Email Address</Label>
            <Input
              value={user?.email ?? ""}
              readOnly
              className="bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Email address cannot be changed.{" "}
              <a href="/dashboard/settings" className="text-primary hover:underline">
                Manage in Settings
              </a>
            </p>
          </div>
          <div>
            <Label className="text-gray-600 mb-1.5 block text-sm">Account Role</Label>
            <Input
              value={user?.role === "admin" ? "Administrator" : "Member"}
              readOnly
              className="bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed capitalize"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </section>
    </div>
  );
}
