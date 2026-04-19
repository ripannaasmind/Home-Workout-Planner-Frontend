"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { aiApi, type AIWorkoutResult } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Dumbbell,
  Timer,
  Flame,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Target,
  Clock,
  Zap,
  Settings,
  Lock,
  Activity,
  Leaf,
  Stethoscope,
  Lightbulb,
} from "lucide-react";

const GOALS = [
  { value: "lose_weight", label: "Lose Weight", Icon: Flame },
  { value: "build_muscle", label: "Build Muscle", Icon: Dumbbell },
  { value: "stay_fit", label: "Stay Fit", Icon: Activity },
  { value: "increase_flexibility", label: "Flexibility", Icon: Leaf },
  { value: "increase_stamina", label: "Stamina", Icon: Zap },
  { value: "rehabilitation", label: "Rehabilitation", Icon: Stethoscope },
];

const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"] as const;

const EQUIPMENT_OPTIONS = [
  "none",
  "dumbbell",
  "barbell",
  "resistance_band",
  "pull_up_bar",
  "bench",
  "kettlebell",
  "yoga_mat",
];

const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
  "full_body",
  "glutes",
];

export default function AIWorkoutPage() {
  const { token, user } = useAuth();
  const [aiStatus, setAiStatus] = useState<boolean | null>(null);
  const [goal, setGoal] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("beginner");
  const [duration, setDuration] = useState(30);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIWorkoutResult | null>(null);
  const [error, setError] = useState("");
  const [showWarmup, setShowWarmup] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  useEffect(() => {
    aiApi
      .getStatus()
      .then((res) => setAiStatus(res.data?.enabled === true))
      .catch(() => setAiStatus(false));
  }, []);

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const toggleMuscle = (item: string) => {
    setTargetMuscles((prev) =>
      prev.includes(item) ? prev.filter((m) => m !== item) : [...prev, item]
    );
  };

  const handleGenerate = async () => {
    if (!goal || !fitnessLevel || !duration) {
      setError("Please fill in all required fields");
      return;
    }
    if (!token) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await aiApi.generateWorkout(
        {
          goal,
          fitnessLevel,
          duration,
          equipment: equipment.length ? equipment : undefined,
          targetMuscles: targetMuscles.length ? targetMuscles : undefined,
          preferences: preferences || undefined,
        },
        token
      );
      if (res.data) {
        setResult(res.data);
      } else {
        setError("Workout generated but result was empty. Please try again.");
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Failed to generate workout";
      // Turn ugly Vercel / API JSON into a readable message
      let msg = raw;
      try {
        const parsed = JSON.parse(raw);
        msg = parsed?.error?.message || parsed?.message || raw;
      } catch { /* not JSON */ }
      if (msg.includes("FUNCTION_INVOCATION_TIMEOUT") || msg.includes("timed out")) {
        msg = "The server took too long to respond. The server may be waking up — please try again in a moment.";
      } else if (msg.includes("rate-limit") || msg.includes("429")) {
        msg = "AI service is temporarily busy. Please try again in a few seconds.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Workout Generator</h1>
          <p className="text-sm text-muted-foreground">Get a personalized workout plan powered by AI</p>
        </div>
      </div>

      {/* Status: checking */}
      {aiStatus === null && (
        <Card>
          <CardContent className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking AI availability…</span>
          </CardContent>
        </Card>
      )}

      {/* Status: not configured */}
      {aiStatus === false && (
        <Card className="border-dashed border-2 border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">AI Workout Generator Not Configured</h2>
              <p className="text-muted-foreground max-w-md">
                The AI feature has not been enabled yet. An administrator needs to add the AI API key and enable it from the admin settings.
              </p>
            </div>
            {(user as { role?: string })?.role === "admin" && (
              <Button asChild className="gap-2">
                <Link href="/admin/settings">
                  <Settings className="h-4 w-4" />
                  Go to Admin Settings
                </Link>
              </Button>
            )}
            {(user as { role?: string })?.role !== "admin" && (
              <p className="text-sm text-muted-foreground">Please contact your administrator to enable this feature.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main content — only shown when AI is configured */}
      {aiStatus === true && (<>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Customize Your Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Goal Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fitness Goal *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    goal === g.value
                      ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary-dark dark:text-primary"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  <g.Icon className="h-4 w-4" />
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fitness Level */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fitness Level *</Label>
            <div className="flex gap-2">
              {FITNESS_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setFitnessLevel(level)}
                  className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium capitalize transition-all ${
                    fitnessLevel === level
                      ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary-dark dark:text-primary"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Duration (minutes) *</Label>
            <div className="flex items-center gap-3">
              {[15, 20, 30, 45, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                    duration === d
                      ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary-dark dark:text-primary"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Available Equipment</Label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq}
                  onClick={() => toggleEquipment(eq)}
                  className={`py-1.5 px-3 rounded-full border text-xs font-medium capitalize transition-all ${
                    equipment.includes(eq)
                      ? "border-primary bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  {eq.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Target Muscles */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Muscles</Label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => toggleMuscle(muscle)}
                  className={`py-1.5 px-3 rounded-full border text-xs font-medium capitalize transition-all ${
                    targetMuscles.includes(muscle)
                      ? "border-primary bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                >
                  {muscle.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Additional Preferences</Label>
            <Input
              placeholder="e.g., Low impact, no jumping, focus on posture..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 px-4 py-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !goal || !fitnessLevel}
            className="w-full bg-primary hover:bg-primary-dark text-white"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating… This may take up to 30 seconds
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Workout
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <div ref={resultRef} className="space-y-4">
          <Card className="border-primary/20 dark:border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{result.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                </div>
                <Badge variant="outline" className="capitalize">{result.difficulty}</Badge>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {result.estimatedDuration} min
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Flame className="h-4 w-4 text-orange-500" />
                  ~{result.estimatedCalories} cal
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Target className="h-4 w-4 text-blue-500" />
                  {result.category?.replace(/_/g, " ")}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  {result.exercises?.length} exercises
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Warm-up */}
          {result.warmup && (
            <Card>
              <button
                onClick={() => setShowWarmup(!showWarmup)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <Timer className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Warm-up</p>
                    <p className="text-xs text-muted-foreground">{result.warmup.duration} min • {result.warmup.exercises?.length} exercises</p>
                  </div>
                </div>
                {showWarmup ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showWarmup && (
                <CardContent className="pt-0 space-y-2">
                  {result.warmup.exercises?.map((ex, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <span className="text-xs font-bold text-green-600 mt-0.5">{i + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">{ex.duration}s • {ex.instructions}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Main Exercises */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dumbbell className="h-5 w-5 text-primary" />
                Exercises
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.exercises?.map((ex, i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/30 dark:hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary-dark">{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{ex.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{ex.muscleGroup}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {ex.sets > 0 && <Badge variant="secondary">{ex.sets} sets</Badge>}
                      {ex.reps > 0 && <Badge variant="secondary">{ex.reps} reps</Badge>}
                      {ex.duration > 0 && <Badge variant="secondary">{ex.duration}s</Badge>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{ex.instructions}</p>
                  {ex.tips && <p className="text-xs text-primary mt-1 flex items-start gap-1"><Lightbulb className="h-3 w-3 shrink-0 mt-0.5" />{ex.tips}</p>}
                  {ex.restTime > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Rest: {ex.restTime}s</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cool-down */}
          {result.cooldown && (
            <Card>
              <button
                onClick={() => setShowCooldown(!showCooldown)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <Timer className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">Cool-down</p>
                    <p className="text-xs text-muted-foreground">{result.cooldown.duration} min • {result.cooldown.exercises?.length} exercises</p>
                  </div>
                </div>
                {showCooldown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showCooldown && (
                <CardContent className="pt-0 space-y-2">
                  {result.cooldown.exercises?.map((ex, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <span className="text-xs font-bold text-blue-600 mt-0.5">{i + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">{ex.duration}s • {ex.instructions}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Notes */}
          {result.notes && (
            <Card className="bg-primary/5 dark:bg-primary/5 border-primary/20 dark:border-primary/20">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-primary-dark dark:text-primary flex items-center gap-1.5"><Lightbulb className="h-4 w-4" />Trainer Notes</p>
                <p className="text-sm text-primary dark:text-primary/80 mt-1">{result.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </>)}
    </div>
  );
}
