"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Edit2, Loader2, Search, Upload, Dumbbell } from "lucide-react";
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

const CATEGORIES = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "flexibility", label: "Flexibility" },
  { value: "balance", label: "Balance" },
  { value: "hiit", label: "HIIT" },
  { value: "full_body", label: "Full Body" },
  { value: "upper_body", label: "Upper Body" },
  { value: "lower_body", label: "Lower Body" },
  { value: "core", label: "Core" },
  { value: "other", label: "Other" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  advanced: "bg-red-100 text-red-600 border-red-200",
};

const emptyForm = {
  name: "",
  description: "",
  difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
  duration: 30,
  category: "strength",
  estimatedCalories: 200,
  image: "",
};


// ------- Admin Workouts Page Component -------
export default function AdminWorkoutsPage() {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Workout | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  const filtered = workouts.filter((w) => {
    const matchSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.category || "").toLowerCase().includes(search.toLowerCase());
    const matchDiff = filterDiff === "all" || w.difficulty === filterDiff;
    const matchCat = filterCat === "all" || w.category === filterCat;
    return matchSearch && matchDiff && matchCat;
  });

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
      category: w.category || "strength",
      estimatedCalories: w.estimatedCalories ?? 200,
      image: (w as Workout & { image?: string }).image ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    if (!form.name.trim()) { toast.error("Workout name is required"); return; }
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
    setDeleting(true);
    try {
      await adminApi.deleteWorkout(deleteTarget._id, token);
      toast.success("Workout deleted");
      setDeleteTarget(null);
      fetchWorkouts();
    } catch {
      toast.error("Failed to delete workout");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage the workout library shown on the public workouts page
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Workout
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search workouts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterDiff} onValueChange={setFilterDiff}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white dark:bg-card border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No workouts found</p>
            <p className="text-sm mt-1">Click Add Workout to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium w-16">Image</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Level</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Duration</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Exercises</th>
                  <th className="text-left px-4 py-3 text-gray-500 dark:text-gray-400 font-medium hidden lg:table-cell">Calories</th>
                  <th className="text-right px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((w) => {
                  const img = (w as Workout & { image?: string }).image;
                  const catLabel = CATEGORIES.find((c) => c.value === w.category)?.label ?? w.category;
                  return (
                    <tr key={w._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        {img ? (
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <Image src={img} alt={w.name} fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Dumbbell className="h-5 w-5 text-primary/50" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 dark:text-white">{w.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 hidden sm:block">{w.description}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-gray-600 dark:text-gray-300">{catLabel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[11px] ${difficultyColor[w.difficulty] ?? ""}`}>
                          {w.difficulty}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-gray-300">
                        {w.duration} min
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-gray-300">
                        {w.exercises?.length ?? 0}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600 dark:text-gray-300">
                        {w.estimatedCalories ?? 0} kcal
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                            onClick={() => openEdit(w)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg border border-gray-200 dark:border-gray-700 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                            onClick={() => setDeleteTarget(w)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Workout" : "Add Workout"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div
                className="relative w-full h-44 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center cursor-pointer hover:border-primary transition-colors group"
                onClick={() => imageFileRef.current?.click()}
              >
                {form.image ? (
                  <>
                    <Image src={form.image} alt="Cover" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                      <span className="text-white text-sm ml-2">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Click to upload cover image</span>
                    <span className="text-xs">JPG, PNG, WebP — max 5MB</span>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-card/80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
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

            {/* Name */}
            <div className="space-y-1.5">
              <Label>Workout Name *</Label>
              <Input
                placeholder="e.g. Morning Full Body Blast"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this workout..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Category + Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty *</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as typeof form.difficulty })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration + Calories */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Est. Calories Burned</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.estimatedCalories}
                  onChange={(e) => setForm({ ...form, estimatedCalories: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="bg-primary text-white">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editTarget ? "Save Changes" : "Create Workout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Workout</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
