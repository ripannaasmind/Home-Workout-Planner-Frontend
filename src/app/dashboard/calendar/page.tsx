"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { PremiumGate } from "@/components/PremiumGate";
import { calendarApi, workoutsApi, type WorkoutSchedule } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  Trash2,
  Clock,
  Dumbbell,
  Loader2,
  History,
} from "lucide-react";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface SimpleWorkout { _id: string; name: string; category: string }

export default function CalendarPage() {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [workouts, setWorkouts] = useState<SimpleWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [formData, setFormData] = useState({ title: "", description: "", startTime: "09:00", endTime: "10:00", color: "#6366f1", workout: "", notes: "" });
  const [tab, setTab] = useState<"calendar" | "history">("calendar");
  const [historyData, setHistoryData] = useState<WorkoutSchedule[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadSchedules = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    try {
      const res = await calendarApi.getSchedule(start, end, token);
      setSchedules(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [token, year, month]);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const res = await calendarApi.getCompleted(token);
      setHistoryData(res.data);
    } catch { /* ignore */ }
    setHistoryLoading(false);
  }, [token]);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab, loadHistory]);

  useEffect(() => {
    if (!token) return;
    workoutsApi.getAll({ limit: 100 }).then((res) => {
      setWorkouts(res.data?.map((w: { _id?: string; id?: string; name: string; category: string }) => ({ _id: w._id || w.id || "", name: w.name, category: w.category })) || []);
    }).catch(() => {});
  }, [token]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getSchedulesForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return schedules.filter((s) => s.date?.startsWith(dateStr));
  };

  const openForm = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setFormData({ title: "", description: "", startTime: "09:00", endTime: "10:00", color: "#6366f1", workout: "", notes: "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!token || !formData.title || !selectedDate) return;
    try {
      await calendarApi.create({
        title: formData.title,
        description: formData.description,
        date: new Date(selectedDate).toISOString(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        color: formData.color,
        workout: formData.workout || undefined,
        notes: formData.notes,
      } as Partial<WorkoutSchedule>, token);
      setShowForm(false);
      loadSchedules();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await calendarApi.delete(id, token);
      loadSchedules();
    } catch { /* ignore */ }
  };

  const handleComplete = async (id: string) => {
    if (!token) return;
    try {
      await calendarApi.markComplete(id, token);
      loadSchedules();
    } catch { /* ignore */ }
  };

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <PremiumGate feature="Workout Calendar">
    <div className="space-y-6 max-w-5xl mx-auto page-fade">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-linear-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
          <CalendarDays className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workout Calendar</h1>
          <p className="text-sm text-muted-foreground">Plan and schedule your workouts</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {(["calendar", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all capitalize ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t === "calendar" ? <CalendarDays className="h-4 w-4" /> : <History className="h-4 w-4" />}
            {t === "calendar" ? "Calendar" : "Completed History"}
          </button>
        ))}
      </div>

      {tab === "history" && (
        <div className="space-y-3">
          {historyLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : historyData.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-2xl border p-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">No completed workouts yet</p>
              <p className="text-sm text-muted-foreground mt-1">Mark scheduled workouts as complete to see them here.</p>
            </div>
          ) : (
            historyData.map((s) => (
              <div key={s._id} className="bg-white dark:bg-card rounded-xl border p-4 flex items-start gap-4"
                style={{ borderLeftWidth: 4, borderLeftColor: s.color || "#6366f1" }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <p className="font-semibold text-sm">{s.title}</p>
                  </div>
                  {s.description && <p className="text-xs text-muted-foreground mt-0.5 ml-6">{s.description}</p>}
                  <div className="flex gap-3 mt-1 ml-6 text-xs text-muted-foreground">
                    <span><CalendarDays className="inline h-3 w-3 mr-0.5" />{new Date(s.date).toLocaleDateString()}</span>
                    <span><Clock className="inline h-3 w-3 mr-0.5" />{s.startTime} – {s.endTime}</span>
                    {s.completedAt && <span>Done: {new Date(s.completedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "calendar" && (<>

      {/* Calendar Nav */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {/* Day headers */}
              {DAYS.map((day) => (
                <div key={day} className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-xs font-semibold text-muted-foreground">{day}</div>
              ))}
              {/* Calendar cells */}
              {calendarCells.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="bg-white dark:bg-gray-900 min-h-[90px] p-1" />;

                const daySchedules = getSchedulesForDate(day);
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

                return (
                  <div
                    key={day}
                    className={`bg-white dark:bg-gray-900 min-h-[90px] p-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isToday ? "ring-2 ring-inset ring-primary" : ""}`}
                    onClick={() => openForm(day)}
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className={`text-xs font-medium ${isToday ? "bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center" : "text-muted-foreground"}`}>{day}</span>
                      {daySchedules.length > 0 && <Badge variant="secondary" className="text-[10px] h-4 px-1">{daySchedules.length}</Badge>}
                    </div>
                    <div className="mt-0.5 space-y-0.5">
                      {daySchedules.slice(0, 2).map((s) => (
                        <div
                          key={s._id}
                          className="text-[10px] px-1 py-0.5 rounded truncate text-white font-medium"
                          style={{ backgroundColor: s.color || "#6366f1" }}
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          {s.isCompleted && <Check className="h-2.5 w-2.5 inline mr-0.5 align-middle" />}{s.title}
                        </div>
                      ))}
                      {daySchedules.length > 2 && <p className="text-[10px] text-muted-foreground px-1">+{daySchedules.length - 2} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      {(() => {
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const todaySchedules = schedules.filter((s) => s.date?.startsWith(todayStr));
        if (todaySchedules.length === 0) return null;

        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Today&apos;s Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todaySchedules.map((s) => (
                <div key={s._id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderLeftWidth: 4, borderLeftColor: s.color || "#6366f1" }}>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${s.isCompleted ? "line-through text-muted-foreground" : ""}`}>{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.startTime} - {s.endTime}</p>
                  </div>
                  <div className="flex gap-1">
                    {!s.isCompleted && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => handleComplete(s._id)}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(s._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })()}

      {/* Add Schedule Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Plus className="h-5 w-5" />Schedule Workout</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Date: {selectedDate}</p>
              <div><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Morning Workout" /></div>
              <div><Label>Description</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Time</Label><Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} /></div>
                <div><Label>End Time</Label><Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} /></div>
              </div>
              {workouts.length > 0 && (
                <div className="space-y-2">
                  <Label>Link Workout (optional)</Label>
                  <select
                    className="w-full h-9 rounded-md border border-gray-200 dark:border-gray-700 px-3 text-sm bg-transparent"
                    value={formData.workout}
                    onChange={(e) => setFormData({ ...formData, workout: e.target.value })}
                  >
                    <option value="">No workout linked</option>
                    {workouts.map((w) => (
                      <option key={w._id} value={w._id}>{w.name} ({w.category})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setFormData({ ...formData, color: c })}
                      className={`h-7 w-7 rounded-full transition-all ${formData.color === c ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div><Label>Notes</Label><Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes" /></div>
              <Button onClick={handleSave} className="w-full" disabled={!formData.title}>
                <Dumbbell className="h-4 w-4 mr-2" />Schedule Workout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      </>)}
    </div>
    </PremiumGate>
  );
}
