"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

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
  const [activeCalc, setActiveCalc] = useState<CalcType>(null);

  if (activeCalc) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setActiveCalc(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> All Calculators
        </Button>
        {activeCalc === "bmi" && <BMICalc />}
        {activeCalc === "bmr" && <BMRCalc />}
        {activeCalc === "tdee" && <TDEECalc />}
        {activeCalc === "one-rep-max" && <OneRepMaxCalc />}
        {activeCalc === "body-fat" && <BodyFatCalc />}
        {activeCalc === "water" && <WaterCalc />}
        {activeCalc === "calorie-burn" && <CalorieBurnCalc />}
        {activeCalc === "macro" && <MacroCalc />}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
          <Calculator className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Health & Body Calculators</h1>
          <p className="text-sm text-muted-foreground">Track your fitness metrics with precision</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CALCULATORS.map((calc) => (
          <Card
            key={calc.id}
            className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
            onClick={() => setActiveCalc(calc.id)}
          >
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
    </div>
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

function BMICalc() {
  const [weight, setWeight] = useState(""); const [height, setHeight] = useState(""); const [result, setResult] = useState<{ bmi: number; category: string } | null>(null);

  const calculate = () => {
    const w = parseFloat(weight); const h = parseFloat(height) / 100;
    if (!w || !h) return;
    const bmi = w / (h * h);
    let category = "Normal";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    setResult({ bmi: Math.round(bmi * 10) / 10, category });
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-blue-500" />BMI Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" /></div>
          <div><Label>Height (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" /></div>
        </div>
        <Button onClick={calculate} className="w-full">Calculate BMI</Button>
        {result && (
          <div className="grid grid-cols-2 gap-4">
            <ResultCard label="Your BMI" value={result.bmi} />
            <ResultCard label="Category" value={result.category} color={result.category === "Normal" ? "text-green-600" : "text-orange-600"} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BMRCalc() {
  const [gender, setGender] = useState("male"); const [weight, setWeight] = useState(""); const [height, setHeight] = useState(""); const [age, setAge] = useState(""); const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight); const h = parseFloat(height); const a = parseFloat(age);
    if (!w || !h || !a) return;
    const bmr = gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    setResult(Math.round(bmr));
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
        {result && <ResultCard label="Basal Metabolic Rate" value={result} unit="cal/day" />}
      </CardContent>
    </Card>
  );
}

function TDEECalc() {
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
    setResult(Math.round(bmr * parseFloat(activity)));
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
        {result && <ResultCard label="Total Daily Energy Expenditure" value={result} unit="cal/day" />}
      </CardContent>
    </Card>
  );
}

function OneRepMaxCalc() {
  const [weight, setWeight] = useState(""); const [reps, setReps] = useState(""); const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight); const r = parseFloat(reps);
    if (!w || !r || r < 1 || r > 30) return;
    const orm = w * (1 + r / 30); // Epley formula
    setResult(Math.round(orm * 10) / 10);
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BodyFatCalc() {
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
    setResult(Math.round(bf * 10) / 10);
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
        {result && <ResultCard label="Estimated Body Fat" value={result} unit="%" color={result < 20 ? "text-green-600" : result < 30 ? "text-orange-600" : "text-red-600"} />}
      </CardContent>
    </Card>
  );
}

function WaterCalc() {
  const [weight, setWeight] = useState(""); const [activity, setActivity] = useState("moderate"); const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    if (!w) return;
    let multiplier = 0.033;
    if (activity === "light") multiplier = 0.03;
    else if (activity === "active") multiplier = 0.04;
    else if (activity === "very-active") multiplier = 0.045;
    setResult(Math.round(w * multiplier * 10) / 10);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5 text-cyan-500" />Water Intake Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <ResultCard label="Daily Water Intake" value={result} unit="L" color="text-cyan-600" />
            <ResultCard label="Glasses (250ml)" value={Math.ceil(result * 4)} unit="glasses" color="text-cyan-600" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CalorieBurnCalc() {
  const [weight, setWeight] = useState(""); const [activityType, setActivityType] = useState("running"); const [durationMin, setDurationMin] = useState(""); const [result, setResult] = useState<number | null>(null);

  const MET_VALUES: Record<string, number> = {
    running: 9.8, walking: 3.8, cycling: 7.5, swimming: 8.0, hiit: 12.0, yoga: 3.0,
    weight_training: 6.0, jumping_rope: 11.0, dancing: 5.0, boxing: 9.0,
  };

  const calculate = () => {
    const w = parseFloat(weight); const d = parseFloat(durationMin);
    if (!w || !d) return;
    const met = MET_VALUES[activityType] || 5;
    setResult(Math.round(met * 3.5 * w / 200 * d));
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-amber-500" />Calorie Burn Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
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
        {result && <ResultCard label="Estimated Calories Burned" value={result} unit="cal" color="text-amber-600" />}
      </CardContent>
    </Card>
  );
}

function MacroCalc() {
  const [weight, setWeight] = useState(""); const [goalType, setGoalType] = useState("maintain"); const [tdee, setTdee] = useState(""); const [result, setResult] = useState<{ protein: number; carbs: number; fats: number; calories: number } | null>(null);

  const calculate = () => {
    let cal = parseFloat(tdee);
    if (!cal) {
      const w = parseFloat(weight);
      if (!w) return;
      cal = w * 33; // rough estimate
    }
    if (goalType === "lose") cal -= 500;
    else if (goalType === "gain") cal += 500;

    const w = parseFloat(weight) || 70;
    const protein = Math.round(w * 2); // 2g/kg
    const fats = Math.round(cal * 0.25 / 9);
    const carbCal = cal - (protein * 4) - (fats * 9);
    const carbs = Math.round(carbCal / 4);

    setResult({ protein, carbs, fats, calories: Math.round(cal) });
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Apple className="h-5 w-5 text-emerald-500" />Macro Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-4">
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
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Daily Calories" value={result.calories} unit="cal" />
            <ResultCard label="Protein" value={result.protein} unit="g" color="text-red-500" />
            <ResultCard label="Carbs" value={result.carbs} unit="g" color="text-amber-500" />
            <ResultCard label="Fats" value={result.fats} unit="g" color="text-green-500" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
