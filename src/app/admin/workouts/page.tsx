"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit2, Loader2, Search, Upload } from "lucide-react";
import { adminApi, Workout } from "@/services/api";
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
  difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
  duration: 30,
  category: "",
  estimatedCalories: 200,
  image: "",
};


// ------- Admin Workouts Page Component -------
export default function AdminWorkoutsPage() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Workout | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);

  const fetchWorkouts = useCallback(() => {
    if (!token) return;
    adminApi
      .getWorkouts(token)
      .then((res) => setWorkouts(res.data))
      .catch(() => toast.error("Failed to load workouts"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const filtered = workouts.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (w: Workout) => {
    setEditTarget(w);
    setForm({
      name: w.name,
      description: w.description,
      difficulty: w.difficulty,
      duration: w.duration,
      category: w.category,
      estimatedCalories: w.estimatedCalories ?? 200,
      image: (w as Workout & { image?: string }).image ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      if (editTarget) {
        await adminApi.updateWorkout(editTarget._id, form, token);
        toast.success("Workout updated");
      } else {
        await adminApi.createWorkout(form, token);
        toast.success("Workout created");
      }
      setDialogOpen(false);
      fetchWorkouts();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save workout");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    try {
      await adminApi.deleteWorkout(deleteTarget._id, token);
      toast.success("Workout deleted");
      setDeleteTarget(null);
      fetchWorkouts();
    } catch {
      toast.error("Failed to delete workout");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Workout Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create and manage workout library</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-white gap-2">
          <Plus className="h-4 w-4" /> New Workout
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white dark:bg-card border-gray-200 dark:border-gray-800"
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No workouts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Image</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Difficulty</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Duration</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Exercises</th>
                  <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      {(w as Workout & { image?: string }).image ? (
                        <div className="relative h-12 w-12 flex-shrink-0 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                          <Image src={(w as Workout & { image?: string }).image!} alt={w.name} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-800">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{w.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{w.category}</td>
                    <td className="px-4 py-3">
                      <Badge className={`border-0 ${difficultyColor[w.difficulty] ?? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"}`}>
                        {w.difficulty}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{w.duration} min</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{w.exercises?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-colors" onClick={() => openEdit(w)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg border border-gray-200 dark:border-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-50 dark:hover:bg-red-500/100/100 hover:text-white hover:border-red-500 transition-colors" onClick={() => setDeleteTarget(w)}>
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
            <DialogTitle>{editTarget ? "Edit Workout" : "Create Workout"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-200 mb-1.5 block">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-gray-200 dark:border-gray-800" />
            </div>
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-200 mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-gray-200 dark:border-gray-800 text-sm" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-200 mb-1.5 block">Category *</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. HIIT, Yoga" className="border-gray-200 dark:border-gray-800" />
              </div>
              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-200 mb-1.5 block">Difficulty *</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as typeof form.difficulty })}>
                  <SelectTrigger className="border-gray-200 dark:border-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-200 mb-1.5 block">Duration (min)</Label>
                <Input type="number" min={1} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="border-gray-200 dark:border-gray-800" />
              </div>
              <div>
                <Label className="text-sm text-gray-700 dark:text-gray-200 mb-1.5 block">Est. Calories</Label>
                <Input type="number" min={0} value={form.estimatedCalories} onChange={(e) => setForm({ ...form, estimatedCalories: Number(e.target.value) })} className="border-gray-200 dark:border-gray-800" />
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-200 mb-1.5 block">Image</Label>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative w-full h-44 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => imageFileRef.current?.click()}
                >
                  {form.image ? (
                    <Image src={form.image} alt="Workout" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm">Click to upload image</span>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white dark:bg-card/70 flex items-center justify-center">
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
            <Button onClick={handleSave} disabled={saving || !form.name || !form.category} className="bg-primary text-white">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editTarget ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Workout</DialogTitle></DialogHeader>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
