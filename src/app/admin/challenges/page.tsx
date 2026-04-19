"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { challengesApi, type Challenge } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Trophy,
  Plus,
  Trash2,
  Edit,
  Users,
  Target,
  Calendar,
  Loader2,
  X,
  Save,
} from "lucide-react";

const TYPES = ["workout_count", "calorie_burn", "active_minutes", "streak", "custom"];
const CATEGORIES = ["strength", "cardio", "flexibility", "endurance", "weight_loss", "general"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const emptyForm = {
  title: "", description: "", type: "workout_count", category: "general", targetValue: 10,
  targetUnit: "workouts", startDate: "", endDate: "", maxParticipants: 0, difficulty: "beginner",
  isActive: true, isPublic: true, rewards: { xpPoints: 100, badge: "" },
};

export default function AdminChallengesPage() {
  const { token } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await challengesApi.getAll({ limit: 50 });
      setChallenges(res.data);
    } catch {
      toast.error("Failed to load challenges");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadChallenges(); }, [loadChallenges]);

  const openCreate = () => {
    setEditId(null);
    const today = new Date();
    const nextMonth = new Date(today); nextMonth.setMonth(nextMonth.getMonth() + 1);
    setForm({ ...emptyForm, startDate: today.toISOString().split("T")[0], endDate: nextMonth.toISOString().split("T")[0] });
    setShowForm(true);
  };

  const openEdit = (c: Challenge) => {
    setEditId(c._id);
    setForm({
      title: c.title, description: c.description || "", type: c.type, category: c.category,
      targetValue: c.targetValue, targetUnit: c.targetUnit, startDate: c.startDate?.split("T")[0] || "",
      endDate: c.endDate?.split("T")[0] || "", maxParticipants: c.maxParticipants, difficulty: c.difficulty,
      isActive: c.isActive, isPublic: c.isPublic, rewards: c.rewards || { xpPoints: 100, badge: "" },
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!token || !form.title || !form.startDate || !form.endDate) {
      toast.error("Fill in required fields"); return;
    }
    setSaving(true);
    try {
      if (editId) {
        await challengesApi.update(editId, form as unknown as Partial<Challenge>, token);
        toast.success("Challenge updated");
      } else {
        await challengesApi.create(form as unknown as Partial<Challenge>, token);
        toast.success("Challenge created");
      }
      setShowForm(false);
      loadChallenges();
    } catch {
      toast.error("Failed to save challenge");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Delete this challenge?")) return;
    try {
      await challengesApi.delete(id, token);
      toast.success("Challenge deleted");
      loadChallenges();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Challenges</h1>
            <p className="text-sm text-muted-foreground">Create and manage fitness challenges</p>
          </div>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Create Challenge</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : challenges.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No challenges yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first fitness challenge</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Challenge</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((c) => (
            <Card key={c._id} className="hover:border-orange-300 dark:hover:border-orange-700 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{c.title}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(c._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="capitalize text-xs">{c.difficulty}</Badge>
                  <Badge className="capitalize text-xs bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">{c.category}</Badge>
                  {c.isActive ? <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge> : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" />{c.targetValue} {c.targetUnit}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.participants?.length || 0}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.endDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-lg my-8 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{editId ? "Edit" : "Create"} Challenge</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="30 Day Push-up Challenge" /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Complete push-ups every day for 30 days" /></div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <select className="w-full h-9 rounded-md border px-3 text-sm bg-transparent" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select className="w-full h-9 rounded-md border px-3 text-sm bg-transparent" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Target Value *</Label><Input type="number" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })} /></div>
                <div><Label>Target Unit</Label><Input value={form.targetUnit} onChange={(e) => setForm({ ...form, targetUnit: e.target.value })} placeholder="workouts" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div><Label>End Date *</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select className="w-full h-9 rounded-md border px-3 text-sm bg-transparent" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div><Label>Max Participants (0=unlimited)</Label><Input type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })} /></div>
              </div>

              <div><Label>XP Reward</Label><Input type="number" value={form.rewards.xpPoints} onChange={(e) => setForm({ ...form, rewards: { ...form.rewards, xpPoints: Number(e.target.value) } })} /></div>

              <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : editId ? "Update Challenge" : "Create Challenge"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
