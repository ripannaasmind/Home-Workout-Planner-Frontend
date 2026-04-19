"use client";

import { useState, useEffect, useCallback } from "react";
import { PremiumGate } from "@/components/PremiumGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Calculator,
  Activity,
  Droplets,
  Flame,
  Scale,
  Heart,
  Dumbbell,
  Apple,
  ChevronRight,
  ArrowLeft,
  History,
  Trash2,
  Loader2,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { calculatorApi, type CalculatorHistoryEntry } from "@/services/api";

type CalcType = "bmi" | "bmr" | "tdee" | "one-rep-max" | "body-fat" | "water" | "calorie-burn" | "macro" | null;

const CALCULATORS = [
  { id: "bmi" as CalcType, name: "BMI Calculator", desc: "Body Mass Index", icon: Scale, color: "bg-blue-500" },
  { id: "bmr" as CalcType, name: "BMR Calculator", desc: "Basal Metabolic Rate", icon: Flame, color: "bg-orange-500" },
  { id: "tdee" as CalcType, name: "TDEE Calculator", desc: "Total Daily Energy Expenditure", icon: Activity, color: "bg-green-500" },
  { id: "one-rep-max" as CalcType, name: "One-Rep Max", desc: "Estimate your 1RM", icon: Dumbbell, color: "bg-purple-500" },
  { id: "body-fat" as CalcType, name: "Body Fat Estimator", desc: "Estimate body fat %", icon: Heart, color: "bg-red-500" },
  { id: "water" as CalcType, name: "Water Intake", desc: "Daily water recommendation", icon: Droplets, color: "bg-cyan-500" },
  { id: "calorie-burn" as CalcType, name: "Calorie Burn", desc: "Calories burned per activity", icon: Flame, color: "bg-amber-500" },
  { id: "macro" as CalcType, name: "Macro Calculator", desc: "Protein, carbs, fats split", icon: Apple, color: "bg-emerald-500" },
];

export default function CalculatorsPage() {
  const { token } = useAuth();
  const [activeCalc, setActiveCalc] = useState<CalcType>(null);
  const [tab, setTab] = useState<"calculators" | "history">("calculators");
  const [history, setHistory] = useState<CalculatorHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const res = await calculatorApi.getHistory(token);
      setHistory(res.data);
    } catch { /* ignore */ }
    setHistoryLoading(false);
  }, [token]);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab, loadHistory]);

  if (activeCalc) {
    return (
      <PremiumGate feature="Fitness Calculators">
      <div className="space-y-6 max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setActiveCalc(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> All Calculators
        </Button>
        {activeCalc === "bmi" && <BMICalc token={token || ""} onSaved={loadHistory} />}
        {activeCalc === "bmr" && <BMRCalc token={token || ""} onSaved={loadHistory} />}
        {activeCalc === "tdee" && <TDEECalc token={token || ""} onSaved={loadHistory} />}
        {activeCalc === "one-rep-max" && <OneRepMaxCalc token={token || ""} onSaved={loadHistory} />}
        {activeCalc === "body-fat" && <BodyFatCalc token={token || ""} onSaved={loadHistory} />}
        {activeCalc === "water" && <WaterCalc token={token || ""} onSaved={loadHistory} />}
        {activeCalc === "calorie-burn" && <CalorieBurnCalc token={token || ""} onSaved={loadHistory} />}
        {activeCalc === "macro" && <MacroCalc token={token || ""} onSaved={loadHistory} />}
      </div>
      </PremiumGate>
    );
  }

  const deleteEntry = async (id: string) => {
    if (!token) return;
    try { await calculatorApi.deleteEntry(id, token); } catch { /* ignore */ }
    setHistory((prev) => prev.filter((h) => h._id !== id));
  };

  return (
    <PremiumGate feature="Fitness Calculators">
    <div className="space-y-6 max-w-4xl mx-auto page-fade">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Calculator className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Health & Body Calculators</h1>
          <p className="text-sm text-muted-foreground">Track your fitness metrics with precision</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {(["calculators", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all capitalize ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {t === "calculators" ? <Calculator className="h-4 w-4" /> : <History className="h-4 w-4" />}
            {t === "calculators" ? "Calculators" : "History"}
          </button>
        ))}
      </div>

      {tab === "calculators" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CALCULATORS.map((calc) => (
            <Card key={calc.id} className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group" onClick={() => setActiveCalc(calc.id)}>
              <CardContent className="p-5">
                <div className={`h-10 w-10 ${calc.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <calc.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{calc.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{calc.desc}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {historyLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : history.length === 0 ? (
            <div className="bg-white dark:bg-card rounded-2xl border p-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">No calculator history yet</p>
              <p className="text-sm text-muted-foreground mt-1">Use a calculator to see your results saved here.</p>
            </div>
          ) : (
            history.map((entry) => (
              <div key={entry._id} className="bg-white dark:bg-card rounded-xl border p-4 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{entry.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(entry.createdAt).toLocaleString()}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(entry.results).map(([k, v]) => (
                      <Badge key={k} variant="secondary" className="text-xs">{k}: {String(v)}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry._id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
    </PremiumGate>
  );
}

/* ──────────── Individual Calculator Components ──────────── */

function ResultCard({ label, value, unit, color = "text-primary" }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${color} mt-1`}>{value}{unit && <span className="text-sm ml-1">{unit}</span>}</p>
    </div>
  );
}

function GenderToggle({ gender, setGender }: { gender: string; setGender: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Gender</Label>
      <div className="flex gap-2">
        {["male", "female"].map((g) => (
          <button key={g} onClick={() => setGender(g)}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${gender === g ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700"}`}>{g}</button>
        ))}
      </div>
    </div>
  );
}

/* ──────────── Suggestion Helpers ──────────── */
function getBMISuggestions(category: string): string[] {
  if (category === "Underweight") return [
    "Increase calorie intake with nutrient-dense foods",
    "Focus on strength training to build muscle mass",
    "Eat 3 main meals + 2-3 protein-rich snacks daily",
    "Track calories to ensure you are eating enough",
  ];
  if (category === "Normal") return [
    "You are in a healthy range – keep it up!",
    "Aim for 150 min of moderate cardio per week",
    "Mix strength training and cardio for best fitness",
    "Stay consistent with a balanced diet and exercise routine",
  ];
  if (category === "Overweight") return [
    "Start with low-impact cardio: walking, cycling, swimming",
    "Aim for a 500 cal/day deficit to lose ~0.5 kg/week",
    "Do 3-5 workouts per week mixing cardio + strength training",
    "Reduce processed foods, sugary drinks, and late-night snacking",
    "Try our AI Workout Planner for a personalized fat-loss routine",
  ];
  return [
    "Begin with 30 min walking daily – great low-impact start",
    "Try swimming or cycling to minimize joint stress",
    "Consult a doctor before starting high-intensity exercise",
    "Aim for a moderate calorie deficit (300-500 cal/day)",
    "Try our AI Workout Planner for a beginner-friendly plan",
  ];
}

function getBMRSuggestions(bmr: number): string[] {
  return [
    "Your BMR is the calories your body burns at complete rest",
    "Never eat below your BMR – it slows your metabolism",
    bmr < 1400
      ? "Low BMR: build muscle through strength training to raise it"
      : bmr < 2000
        ? "Average BMR: maintain with balanced diet and regular exercise"
        : "High BMR: your body burns more at rest – fuel it well",
    "Strength training is the best long-term way to increase BMR",
  ];
}

function getTDEESuggestions(tdee: number): string[] {
  return [
    `Lose weight: eat ~${tdee - 500} cal/day (0.5 kg/week deficit)`,
    `Maintain weight: eat ~${tdee} cal/day`,
    `Gain muscle: eat ~${tdee + 500} cal/day`,
    "Combine TDEE tracking with resistance training for best results",
    "Recalculate TDEE every 4-6 weeks as your weight changes",
  ];
}

function getOneRMSuggestions(orm: number): string[] {
  return [
    `Strength zone: lift ${Math.round(orm * 0.9)}+ kg for 1-3 reps`,
    `Hypertrophy zone: lift ${Math.round(orm * 0.7)}-${Math.round(orm * 0.85)} kg for 6-12 reps`,
    `Endurance zone: lift ${Math.round(orm * 0.5)}-${Math.round(orm * 0.65)} kg for 15+ reps`,
    "Never attempt a true 1RM without a spotter",
    "Progress gradually – add 2.5-5 kg every 1-2 weeks",
  ];
}

function getBodyFatSuggestions(gender: string, bf: number): string[] {
  const male = gender === "male";
  if (male ? bf < 6 : bf < 14) return [
    "You are at essential fat levels – not healthy to go lower",
    "Increase healthy fat intake: avocado, nuts, olive oil",
    "Focus on maintenance rather than further fat loss",
    "Ensure adequate calories to support organ function",
  ];
  if (male ? bf < 14 : bf < 21) return [
    "Athletic range – excellent level, keep it up!",
    "Maintain with balanced strength + cardio training",
    "Ensure adequate protein intake (1.6-2.2 g per kg bodyweight)",
    "Prioritize recovery: 7-9 hours sleep, manage stress",
  ];
  if (male ? bf < 18 : bf < 25) return [
    "Fitness range – you are doing great!",
    "Continue with regular cardio and strength training",
    "A slight caloric deficit can help you reach the athletic range",
    "Focus on compound lifts: squats, deadlifts, bench press",
  ];
  if (male ? bf < 25 : bf < 32) return [
    "Average range – regular exercise is recommended",
    "Aim for 3-4 cardio sessions + 2-3 strength sessions per week",
    "Monitor calorie intake and reduce processed foods",
    "Small consistent improvements compound over time",
  ];
  return [
    "Start with low-impact exercise: walking, swimming, cycling",
    "Aim for a 300-500 cal/day deficit from diet + exercise",
    "Strength training helps – more muscle means higher fat burn",
    "Consider a fitness professional for a personalized plan",
  ];
}

function getWaterSuggestions(): string[] {
  return [
    "Drink a large glass of water first thing in the morning",
    "Drink 500 ml water 30 min before workouts",
    "Replace lost fluids: add ~500 ml per hour of exercise",
    "Pale yellow urine = good hydration; dark yellow = drink more",
    "Limit alcohol and excess caffeine – they both dehydrate",
  ];
}

function getCalorieBurnSuggestions(activity: string): string[] {
  const activityTips: Record<string, string> = {
    running: "Running 3-4×/week is excellent for cardiovascular health",
    hiit: "HIIT burns 25-30% more calories than steady-state cardio",
    weight_training: "Strength training boosts metabolism for 24-48 h after the session",
    swimming: "Swimming is low-impact – great choice for joint health",
    cycling: "Cycling at moderate intensity burns fat very efficiently",
    yoga: "Add 1-2 cardio sessions weekly to complement your yoga",
    walking: "Increase pace or add incline to burn significantly more",
    jumping_rope: "Jump rope is one of the highest calorie-burn activities per minute",
    dancing: "Dance cardio is fun and highly sustainable – keep going!",
    boxing: "Boxing builds both strength and cardiovascular fitness",
  };
  return [
    activityTips[activity] || "Great activity choice – stay consistent!",
    "Aim for 150-300 min of moderate cardio per week (WHO guideline)",
    "Combine cardio with strength training for best fat-loss results",
    "Track your workouts to stay accountable and measure progress",
  ];
}

function getMacroSuggestions(goal: string): string[] {
  const goalTip = goal === "lose"
    ? "Prioritize protein to preserve muscle while in a caloric deficit"
    : goal === "gain"
      ? "Prioritize protein + carbs to fuel muscle growth and recovery"
      : "Keep macros balanced to maintain your current physique";
  return [
    goalTip,
    "Protein sources: chicken, fish, eggs, Greek yogurt, legumes",
    "Carb sources: oats, rice, sweet potato, fruits, vegetables",
    "Fat sources: avocado, nuts, olive oil, fatty fish",
    "Eat protein within 30-60 min after your workout",
  ];
}

function SuggestionCard({ title = "Suggestions & Tips", items, ctaLabel, ctaHref, cta2Label, cta2Href }: {
  title?: string;
  items: string[];
  ctaLabel?: string;
  ctaHref?: string;
  cta2Label?: string;
  cta2Href?: string;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm font-semibold text-primary">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="text-primary mt-0.5 shrink-0">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
      {(ctaLabel && ctaHref) && (
        <div className="flex gap-2">
          <Link href={ctaHref} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all">
            {ctaLabel} <ExternalLink className="h-3 w-3" />
          </Link>
          {cta2Label && cta2Href && (
            <Link href={cta2Href} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-lg border border-primary/50 text-primary hover:bg-primary/10 transition-all">
              {cta2Label} <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function BMICalc({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [gender, setGender] = useState("male"); const [weight, setWeight] = useState(""); const [height, setHeight] = useState(""); const [result, setResult] = useState<{ bmi: number; category: string } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight); const h = parseFloat(height) / 100;
    if (!w || !h) return;
    const bmi = w / (h * h);
    // WHO BMI categories are the same for both genders
    let category = "Normal";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    const r = { bmi: Math.round(bmi * 10) / 10, category };
    setResult(r);
    if (token) calculatorApi.save({ type: "bmi", label: "BMI Calculator", inputs: { gender, weight: w, height: parseFloat(height) }, results: { BMI: r.bmi, Category: r.category } }, token).then(onSaved).catch(() => {});
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-blue-500" />BMI Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <GenderToggle gender={gender} setGender={setGender} />
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" /></div>
          <div><Label>Height (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" /></div>
        </div>
        <Button onClick={calculate} className="w-full">Calculate BMI</Button>
        {result && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ResultCard label="Your BMI" value={result.bmi} />
              <ResultCard label="Category" value={result.category} color={result.category === "Normal" ? "text-green-600" : result.category === "Underweight" ? "text-blue-600" : "text-orange-600"} />
            </div>
            <SuggestionCard
              items={getBMISuggestions(result.category)}
              ctaLabel="Browse Workouts"
              ctaHref="/dashboard/workouts"
              cta2Label={["Overweight", "Obese"].includes(result.category) ? "AI Workout Plan" : undefined}
              cta2Href={["Overweight", "Obese"].includes(result.category) ? "/dashboard/ai-workout" : undefined}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BMRCalc({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [gender, setGender] = useState("male"); const [weight, setWeight] = useState(""); const [height, setHeight] = useState(""); const [age, setAge] = useState(""); const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight); const h = parseFloat(height); const a = parseFloat(age);
    if (!w || !h || !a) return;
    const bmr = gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const r = Math.round(bmr);
    setResult(r);
    if (token) calculatorApi.save({ type: "bmr", label: "BMR Calculator", inputs: { gender, weight: w, height: h, age: a }, results: { "BMR (cal/day)": r } }, token).then(onSaved).catch(() => {});
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" />BMR Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <GenderToggle gender={gender} setGender={setGender} />
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" /></div>
          <div><Label>Height (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" /></div>
          <div><Label>Age</Label><Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" /></div>
        </div>
        <Button onClick={calculate} className="w-full">Calculate BMR</Button>
        {result && (
          <>
            <ResultCard label="Basal Metabolic Rate" value={result} unit="cal/day" />
            <SuggestionCard items={getBMRSuggestions(result)} ctaLabel="Start a Workout" ctaHref="/dashboard/workouts" />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TDEECalc({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [gender, setGender] = useState("male"); const [weight, setWeight] = useState(""); const [height, setHeight] = useState(""); const [age, setAge] = useState(""); const [activity, setActivity] = useState("1.55"); const [result, setResult] = useState<number | null>(null);

  const ACTIVITIES = [
    { value: "1.2", label: "Sedentary" }, { value: "1.375", label: "Light (1-3 days)" },
    { value: "1.55", label: "Moderate (3-5 days)" }, { value: "1.725", label: "Active (6-7 days)" },
    { value: "1.9", label: "Very Active (2x/day)" },
  ];

  const calculate = () => {
    const w = parseFloat(weight); const h = parseFloat(height); const a = parseFloat(age);
    if (!w || !h || !a) return;
    const bmr = gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const r = Math.round(bmr * parseFloat(activity));
    setResult(r);
    const actLabel = ACTIVITIES.find(ac => ac.value === activity)?.label || activity;
    if (token) calculatorApi.save({ type: "tdee", label: "TDEE Calculator", inputs: { gender, weight: w, height: h, age: a, activity: actLabel }, results: { "TDEE (cal/day)": r } }, token).then(onSaved).catch(() => {});
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-green-500" />TDEE Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <GenderToggle gender={gender} setGender={setGender} />
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" /></div>
          <div><Label>Height (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" /></div>
          <div><Label>Age</Label><Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" /></div>
        </div>
        <div className="space-y-2">
          <Label>Activity Level</Label>
          <div className="grid grid-cols-1 gap-1">
            {ACTIVITIES.map((a) => (
              <button key={a.value} onClick={() => setActivity(a.value)}
                className={`py-2 px-3 rounded-lg border text-xs font-medium text-left transition-all ${activity === a.value ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700"}`}>{a.label}</button>
            ))}
          </div>
        </div>
        <Button onClick={calculate} className="w-full">Calculate TDEE</Button>
        {result && (
          <>
            <ResultCard label="Total Daily Energy Expenditure" value={result} unit="cal/day" />
            <SuggestionCard items={getTDEESuggestions(result)} ctaLabel="Start a Workout" ctaHref="/dashboard/workouts" />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function OneRepMaxCalc({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [weight, setWeight] = useState(""); const [reps, setReps] = useState(""); const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight); const r = parseFloat(reps);
    if (!w || !r || r < 1 || r > 30) return;
    const orm = w * (1 + r / 30);
    const val = Math.round(orm * 10) / 10;
    setResult(val);
    if (token) calculatorApi.save({ type: "one-rep-max", label: "One-Rep Max Calculator", inputs: { weight: w, reps: r }, results: { "1RM (kg)": val } }, token).then(onSaved).catch(() => {});
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-purple-500" />One-Rep Max Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Weight Lifted (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="80" /></div>
          <div><Label>Reps Performed</Label><Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="5" /></div>
        </div>
        <Button onClick={calculate} className="w-full">Calculate 1RM</Button>
        {result && (
          <div className="space-y-3">
            <ResultCard label="Estimated 1RM" value={result} unit="kg" />
            <div className="grid grid-cols-3 gap-2">
              {[{ pct: 0.95, label: "95%" }, { pct: 0.90, label: "90%" }, { pct: 0.85, label: "85%" },
                { pct: 0.80, label: "80%" }, { pct: 0.75, label: "75%" }, { pct: 0.70, label: "70%" }
              ].map((p) => (
                <div key={p.label} className="p-2 rounded bg-gray-50 dark:bg-gray-800/50 text-center">
                  <p className="text-xs text-muted-foreground">{p.label}</p>
                  <p className="text-sm font-semibold">{Math.round(result * p.pct)} kg</p>
                </div>
              ))}
            </div>
            <SuggestionCard items={getOneRMSuggestions(result)} ctaLabel="Browse Workouts" ctaHref="/dashboard/workouts" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BodyFatCalc({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [gender, setGender] = useState("male"); const [waist, setWaist] = useState(""); const [neck, setNeck] = useState(""); const [height, setHeight] = useState(""); const [hip, setHip] = useState(""); const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(waist); const n = parseFloat(neck); const h = parseFloat(height);
    if (!w || !n || !h) return;
    let bf: number;
    if (gender === "male") {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      const hp = parseFloat(hip);
      if (!hp) return;
      bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.22100 * Math.log10(h)) - 450;
    }
    const val = Math.round(bf * 10) / 10;
    setResult(val);
    if (token) calculatorApi.save({ type: "body-fat", label: "Body Fat Estimator", inputs: { gender, waist: w, neck: n, height: h, ...(gender === "female" ? { hip: parseFloat(hip) } : {}) }, results: { "Body Fat (%)": val } }, token).then(onSaved).catch(() => {});
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" />Body Fat Estimator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <GenderToggle gender={gender} setGender={setGender} />
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Waist (cm)</Label><Input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="85" /></div>
          <div><Label>Neck (cm)</Label><Input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} placeholder="38" /></div>
          <div><Label>Height (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" /></div>
          {gender === "female" && <div><Label>Hip (cm)</Label><Input type="number" value={hip} onChange={(e) => setHip(e.target.value)} placeholder="95" /></div>}
        </div>
        <Button onClick={calculate} className="w-full">Estimate Body Fat</Button>
        {result && (
          <>
            <ResultCard label="Estimated Body Fat" value={result} unit="%" color={result < 20 ? "text-green-600" : result < 30 ? "text-orange-600" : "text-red-600"} />
            <SuggestionCard items={getBodyFatSuggestions(gender, result)} ctaLabel="Browse Workouts" ctaHref="/dashboard/workouts" />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function WaterCalc({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [gender, setGender] = useState("male"); const [weight, setWeight] = useState(""); const [activity, setActivity] = useState("moderate"); const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    if (!w) return;
    // Males need ~35ml/kg, females ~31ml/kg at moderate activity
    const base = gender === "male"
      ? { light: 0.031, moderate: 0.035, active: 0.040, "very-active": 0.045 }
      : { light: 0.027, moderate: 0.031, active: 0.035, "very-active": 0.040 };
    const multiplier = base[activity as keyof typeof base] ?? 0.033;
    const val = Math.round(w * multiplier * 10) / 10;
    setResult(val);
    if (token) calculatorApi.save({ type: "water", label: "Water Intake Calculator", inputs: { gender, weight: w, activity }, results: { "Water (L/day)": val, "Glasses (250ml)": Math.ceil(val * 4) } }, token).then(onSaved).catch(() => {});
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5 text-cyan-500" />Water Intake Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <GenderToggle gender={gender} setGender={setGender} />
        <div><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" /></div>
        <div className="space-y-2">
          <Label>Activity Level</Label>
          <div className="flex flex-wrap gap-2">
            {[{ v: "light", l: "Light" }, { v: "moderate", l: "Moderate" }, { v: "active", l: "Active" }, { v: "very-active", l: "Very Active" }].map((a) => (
              <button key={a.v} onClick={() => setActivity(a.v)}
                className={`py-2 px-4 rounded-lg border text-xs font-medium transition-all ${activity === a.v ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700"}`}>{a.l}</button>
            ))}
          </div>
        </div>
        <Button onClick={calculate} className="w-full">Calculate Water Intake</Button>
        {result && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ResultCard label="Daily Water Intake" value={result} unit="L" color="text-cyan-600" />
              <ResultCard label="Glasses (250ml)" value={Math.ceil(result * 4)} unit="glasses" color="text-cyan-600" />
            </div>
            <SuggestionCard items={getWaterSuggestions()} ctaLabel="Start a Workout" ctaHref="/dashboard/workouts" />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CalorieBurnCalc({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [gender, setGender] = useState("male"); const [weight, setWeight] = useState(""); const [activityType, setActivityType] = useState("running"); const [durationMin, setDurationMin] = useState(""); const [result, setResult] = useState<number | null>(null);

  const MET_VALUES: Record<string, number> = {
    running: 9.8, walking: 3.8, cycling: 7.5, swimming: 8.0, hiit: 12.0, yoga: 3.0,
    weight_training: 6.0, jumping_rope: 11.0, dancing: 5.0, boxing: 9.0,
  };

  const calculate = () => {
    const w = parseFloat(weight); const d = parseFloat(durationMin);
    if (!w || !d) return;
    const met = MET_VALUES[activityType] || 5;
    // Males burn ~10% more than females due to higher muscle mass
    const factor = gender === "male" ? 3.5 : 3.15;
    const val = Math.round(met * factor * w / 200 * d);
    setResult(val);
    if (token) calculatorApi.save({ type: "calorie-burn", label: "Calorie Burn Calculator", inputs: { gender, weight: w, activity: activityType, duration_min: d }, results: { "Calories Burned": val } }, token).then(onSaved).catch(() => {});
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-amber-500" />Calorie Burn Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <GenderToggle gender={gender} setGender={setGender} />
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" /></div>
          <div><Label>Duration (min)</Label><Input type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="30" /></div>
        </div>
        <div className="space-y-2">
          <Label>Activity</Label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(MET_VALUES).map((a) => (
              <button key={a} onClick={() => setActivityType(a)}
                className={`py-1.5 px-3 rounded-full border text-xs font-medium capitalize transition-all ${activityType === a ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700"}`}>{a.replace(/_/g, " ")}</button>
            ))}
          </div>
        </div>
        <Button onClick={calculate} className="w-full">Calculate Calories Burned</Button>
        {result && (
          <>
            <ResultCard label="Estimated Calories Burned" value={result} unit="cal" color="text-amber-600" />
            <SuggestionCard items={getCalorieBurnSuggestions(activityType)} ctaLabel="Browse Workouts" ctaHref="/dashboard/workouts" />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MacroCalc({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [gender, setGender] = useState("male"); const [weight, setWeight] = useState(""); const [goalType, setGoalType] = useState("maintain"); const [tdee, setTdee] = useState(""); const [result, setResult] = useState<{ protein: number; carbs: number; fats: number; calories: number } | null>(null);

  const calculate = () => {
    let cal = parseFloat(tdee);
    if (!cal) {
      const w = parseFloat(weight);
      if (!w) return;
      // Male base: ~35 cal/kg, Female base: ~30 cal/kg
      cal = w * (gender === "male" ? 35 : 30);
    }
    if (goalType === "lose") cal -= 500;
    else if (goalType === "gain") cal += 500;

    const w = parseFloat(weight) || 70;
    // Male protein: 2.0g/kg, Female protein: 1.7g/kg
    const protein = Math.round(w * (gender === "male" ? 2.0 : 1.7));
    const fats = Math.round(cal * 0.25 / 9);
    const carbCal = cal - (protein * 4) - (fats * 9);
    const carbs = Math.round(carbCal / 4);
    const r = { protein, carbs, fats, calories: Math.round(cal) };
    setResult(r);
    if (token) calculatorApi.save({ type: "macro", label: "Macro Calculator", inputs: { gender, weight: w, goal: goalType }, results: { "Calories": r.calories, "Protein (g)": r.protein, "Carbs (g)": r.carbs, "Fats (g)": r.fats } }, token).then(onSaved).catch(() => {});
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Apple className="h-5 w-5 text-emerald-500" />Macro Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <GenderToggle gender={gender} setGender={setGender} />
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" /></div>
          <div><Label>TDEE (cal/day, optional)</Label><Input type="number" value={tdee} onChange={(e) => setTdee(e.target.value)} placeholder="2200" /></div>
        </div>
        <div className="space-y-2">
          <Label>Goal</Label>
          <div className="flex gap-2">
            {[{ v: "lose", l: "Lose Weight" }, { v: "maintain", l: "Maintain" }, { v: "gain", l: "Gain Muscle" }].map((g) => (
              <button key={g.v} onClick={() => setGoalType(g.v)}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${goalType === g.v ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700"}`}>{g.l}</button>
            ))}
          </div>
        </div>
        <Button onClick={calculate} className="w-full">Calculate Macros</Button>
        {result && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Daily Calories" value={result.calories} unit="cal" />
              <ResultCard label="Protein" value={result.protein} unit="g" color="text-red-500" />
              <ResultCard label="Carbs" value={result.carbs} unit="g" color="text-amber-500" />
              <ResultCard label="Fats" value={result.fats} unit="g" color="text-green-500" />
            </div>
            <SuggestionCard items={getMacroSuggestions(goalType)} ctaLabel="Browse Workouts" ctaHref="/dashboard/workouts" />
          </>
        )}
      </CardContent>
    </Card>
  );
}
