"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Upload,
  Image as ImageIcon,
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { featuresApi, Feature } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ICON_OPTIONS = [
  "CheckCircle", "TrendingUp", "Trophy", "RefreshCw", "Dumbbell",
  "Activity", "Flame", "Star", "Zap", "Heart", "Shield", "Target",
];

const emptyForm = {
  title: "",
  description: "",
  imageAlt: "",
  icon: "CheckCircle",
  order: 0,
  isActive: true,
  reverse: false,
};

type FormState = typeof emptyForm;

export default function AdminFeaturesPage() {
  const { token } = useAuth();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Feature | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Feature | null>(null);
  const [deleting, setDeleting] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const fetchFeatures = useCallback(() => {
    if (!token) return;
    featuresApi
      .getAll(token)
      .then((res) => setFeatures(res.data))
      .catch(() => toast.error("Failed to load features"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...emptyForm, order: features.length });
    setImageFile(null);
    setImagePreview("");
    setDialogOpen(true);
  };

  const openEdit = (f: Feature) => {
    setEditTarget(f);
    setForm({
      title: f.title,
      description: f.description,
      imageAlt: f.imageAlt,
      icon: f.icon,
      order: f.order,
      isActive: f.isActive,
      reverse: f.reverse,
    });
    setImageFile(null);
    setImagePreview(f.image || "");
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!token) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    if (!editTarget && !imageFile) {
      toast.error("Please upload an image");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("imageAlt", form.imageAlt || form.title);
      fd.append("icon", form.icon);
      fd.append("order", String(form.order));
      fd.append("isActive", String(form.isActive));
      fd.append("reverse", String(form.reverse));
      if (imageFile) fd.append("image", imageFile);

      if (editTarget) {
        await featuresApi.update(editTarget._id, fd, token);
        toast.success("Feature updated");
      } else {
        await featuresApi.create(fd, token);
        toast.success("Feature created");
      }
      setDialogOpen(false);
      fetchFeatures();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await featuresApi.delete(deleteTarget._id, token);
      toast.success("Feature deleted");
      setDeleteTarget(null);
      fetchFeatures();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (f: Feature) => {
    if (!token) return;
    try {
      const fd = new FormData();
      fd.append("isActive", String(!f.isActive));
      await featuresApi.update(f._id, fd, token);
      fetchFeatures();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleMove = async (f: Feature, direction: "up" | "down") => {
    if (!token) return;
    const newOrder = direction === "up" ? f.order - 1 : f.order + 1;
    try {
      const fd = new FormData();
      fd.append("order", String(newOrder));
      await featuresApi.update(f._id, fd, token);
      fetchFeatures();
    } catch {
      toast.error("Failed to reorder");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Features Page</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage feature cards shown on the public features page
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Feature
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty */}
      {!loading && features.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No features yet</p>
          <p className="text-sm mt-1">Click Add Feature to get started</p>
        </div>
      )}

      {/* Feature List */}
      {!loading && features.length > 0 && (
        <div className="space-y-3">
          {features.map((f, idx) => (
            <div
              key={f._id}
              className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-white dark:bg-card transition-opacity ${
                f.isActive ? "border-gray-200 dark:border-gray-700" : "border-gray-100 dark:border-gray-800 opacity-60"
              }`}
            >
              {/* Drag handle */}
              <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 hidden sm:block" />

              {/* Image */}
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {f.image ? (
                  <Image
                    src={f.image}
                    alt={f.imageAlt || f.title}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {f.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={f.isActive ? "text-green-600 border-green-300 text-[10px]" : "text-gray-400 border-gray-300 text-[10px]"}
                  >
                    {f.isActive ? "Active" : "Hidden"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] text-gray-400">
                    Order: {f.order}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {f.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hidden sm:flex"
                  onClick={() => handleMove(f, "up")}
                  disabled={idx === 0}
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hidden sm:flex"
                  onClick={() => handleMove(f, "down")}
                  disabled={idx === features.length - 1}
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => handleToggleActive(f)}
                  title={f.isActive ? "Hide" : "Show"}
                >
                  {f.isActive ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                  onClick={() => openEdit(f)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-lg border border-gray-200 dark:border-gray-800 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                  onClick={() => setDeleteTarget(f)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Feature" : "Add Feature"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Feature Image (Person / Fitness Photo) *</Label>
              <div
                onClick={() => imageRef.current?.click()}
                className="relative cursor-pointer group rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                      <span className="text-white text-sm ml-2">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Click to upload image</span>
                    <span className="text-xs">JPG, PNG, WebP — max 5MB</span>
                  </div>
                )}
              </div>
              <input
                ref={imageRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                placeholder="e.g. Custom Tailored Workouts"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe this feature..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Image Alt */}
            <div className="space-y-1.5">
              <Label>Image Alt Text</Label>
              <Input
                placeholder="e.g. Person doing workout"
                value={form.imageAlt}
                onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))}
              />
            </div>

            {/* Icon + Order */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((ic) => (
                      <SelectItem key={ic} value={ic}>
                        {ic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
                <Label>Visible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.reverse}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, reverse: v }))}
                />
                <Label>Reverse Layout</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editTarget ? "Save Changes" : "Create Feature"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Feature?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &quot;{deleteTarget?.title}&quot; will be permanently removed from the features page.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
