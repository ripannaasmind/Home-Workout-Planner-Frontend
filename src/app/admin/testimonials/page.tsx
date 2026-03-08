"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit2, Loader2, Star, Upload } from "lucide-react";
import { adminApi, Testimonial } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { uploadImage, validateImageFile } from "@/services/imageUploadService";

const emptyForm = {
  name: "",
  role: "",
  comment: "",
  rating: 5,
  avatar: "",
  size: "medium" as "small" | "medium" | "large",
};


// ------- Admin Testimonials Page Component -------
export default function AdminTestimonialsPage() {
  const { token } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const fetchTestimonials = useCallback(() => {
    adminApi
      .getTestimonials()
      .then((res) => setTestimonials(res.data))
      .catch(() => toast.error("Failed to load testimonials"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditTarget(t);
    setForm({
      name: t.name,
      role: t.role,
      comment: t.comment,
      rating: t.rating,
      avatar: t.avatar ?? "",
      size: t.size ?? "medium",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const id = editTarget?._id || String(editTarget?.id ?? "");
      if (editTarget && id) {
        await adminApi.updateTestimonial(id, form, token);
        toast.success("Testimonial updated");
      } else {
        await adminApi.createTestimonial(form, token);
        toast.success("Testimonial created");
      }
      setDialogOpen(false);
      fetchTestimonials();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    const id = deleteTarget._id || String(deleteTarget.id ?? "");
    try {
      await adminApi.deleteTestimonial(id, token);
      toast.success("Testimonial deleted");
      setDeleteTarget(null);
      fetchTestimonials();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user testimonials</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-white gap-2">
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No testimonials found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Avatar</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Rating</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Size</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Comment</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t, i) => (
                  <tr key={t._id || String(t.id) || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {t.avatar ? (
                        <div className="relative h-11 w-11 flex-shrink-0 rounded-full border-2 border-gray-200 shadow-sm overflow-hidden">
                          <Image src={t.avatar} alt={t.name} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center border-2 border-gray-200">
                          <span className="text-primary font-semibold text-sm">{t.name.charAt(0)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{t.name}</td>
                    <td className="px-4 py-3 text-gray-600">{t.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-700">{t.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-gray-100 text-gray-600 border-0">{t.size}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{t.comment}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-gray-500 hover:bg-primary hover:text-white transition-colors" onClick={() => openEdit(t)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors" onClick={() => setDeleteTarget(t)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-gray-200" />
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Role *</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Fitness Enthusiast" className="border-gray-200" />
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1.5 block">Avatar</Label>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative h-28 w-28 rounded-full border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => avatarFileRef.current?.click()}
                >
                  {form.avatar ? (
                    <Image src={form.avatar} alt="Avatar" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <Upload className="h-6 w-6" />
                      <span className="text-xs text-center">Upload</span>
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={() => avatarFileRef.current?.click()}
                  className="w-full"
                >
                  {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {form.avatar ? "Change Avatar" : "Upload Avatar"}
                </Button>
                <input
                  ref={avatarFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const validation = validateImageFile(file, 5);
                    if (!validation.isValid) { toast.error(validation.error); return; }
                    setUploadingAvatar(true);
                    try {
                      const url = await uploadImage(file);
                      setForm((prev) => ({ ...prev, avatar: url }));
                    } catch {
                      toast.error("Failed to upload image");
                    } finally {
                      setUploadingAvatar(false);
                      if (avatarFileRef.current) avatarFileRef.current.value = "";
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1.5 block">Comment *</Label>
              <Textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="border-gray-200 text-sm" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Rating (1-5)</Label>
                <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="border-gray-200" />
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Display Size</Label>
                <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v as typeof form.size })}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.role || !form.comment} className="bg-primary text-white">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editTarget ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Testimonial</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete the testimonial from <strong>{deleteTarget?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
