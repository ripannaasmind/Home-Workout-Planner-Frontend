"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit2, Loader2, Search, Upload } from "lucide-react";
import { adminApi, Exercise } from "@/services/api";
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

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-600",
};

const emptyForm = {
  name: "",
  description: "",
  muscleGroup: "",
  equipment: "no equipment",
  difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
  image: "",
};


// ------- Admin Exercises Page Component -------
export default function AdminExercisesPage() {
  const { token } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  const fetchExercises = useCallback(() => {
    if (!token) return;
    adminApi
      .getExercises(token)
      .then((res) => setExercises(res.data))
      .catch(() => toast.error("Failed to load exercises"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const filtered = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscleGroup.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (e: Exercise) => {
    setEditTarget(e);
    setForm({
      name: e.name,
      description: e.description,
      muscleGroup: e.muscleGroup,
      equipment: e.equipment,
      difficulty: e.difficulty,
      image: (e as Exercise & { image?: string }).image ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      if (editTarget) {
        await adminApi.updateExercise(editTarget._id, form, token);
        toast.success("Exercise updated");
      } else {
        await adminApi.createExercise(form, token);
        toast.success("Exercise created");
      }
      setDialogOpen(false);
      fetchExercises();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save exercise");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    try {
      await adminApi.deleteExercise(deleteTarget._id, token);
      toast.success("Exercise deleted");
      setDeleteTarget(null);
      fetchExercises();
    } catch {
      toast.error("Failed to delete exercise");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Exercise Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the exercise library</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-white gap-2">
          <Plus className="h-4 w-4" /> New Exercise
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or muscle group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-gray-200"
        />
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No exercises found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Image</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Muscle Group</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Equipment</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Difficulty</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {(e as Exercise & { image?: string }).image ? (
                        <div className="relative h-12 w-12 flex-shrink-0 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          <Image src={(e as Exercise & { image?: string }).image!} alt={e.name} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{e.name}</td>
                    <td className="px-4 py-3 text-gray-600">{e.muscleGroup}</td>
                    <td className="px-4 py-3 text-gray-600">{e.equipment}</td>
                    <td className="px-4 py-3">
                      <Badge className={`border-0 ${difficultyColor[e.difficulty] ?? "bg-gray-100 text-gray-700"}`}>
                        {e.difficulty}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-primary" onClick={() => openEdit(e)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(e)}>
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
            <DialogTitle>{editTarget ? "Edit Exercise" : "Create Exercise"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm text-gray-700 mb-1.5 block">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-gray-200" />
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-gray-200 text-sm" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Muscle Group *</Label>
                <Input value={form.muscleGroup} onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })} placeholder="e.g. Chest, Back" className="border-gray-200" />
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-1.5 block">Equipment</Label>
                <Input value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} placeholder="e.g. dumbbells" className="border-gray-200" />
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1.5 block">Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as typeof form.difficulty })}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1.5 block">Image</Label>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative w-full h-44 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => imageFileRef.current?.click()}
                >
                  {form.image ? (
                    <Image src={form.image} alt="Exercise" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">Click to upload image</span>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() => imageFileRef.current?.click()}
                  className="w-full"
                >
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {form.image ? "Change Image" : "Upload Image"}
                </Button>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const validation = validateImageFile(file, 5);
                    if (!validation.isValid) { toast.error(validation.error); return; }
                    setUploadingImage(true);
                    try {
                      const url = await uploadImage(file);
                      setForm((prev) => ({ ...prev, image: url }));
                    } catch {
                      toast.error("Failed to upload image");
                    } finally {
                      setUploadingImage(false);
                      if (imageFileRef.current) imageFileRef.current.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.muscleGroup} className="bg-primary text-white">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editTarget ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Exercise</DialogTitle></DialogHeader>
          <p className="text-gray-600 text-sm">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
