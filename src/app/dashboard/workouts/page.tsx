import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, PlayCircle } from "lucide-react";

const workouts = [
    {
        id: "hiit-burn",
        title: "HIIT Burn",
        duration: "45 min",
        intensity: "High",
        category: "Cardio",
        image: "/hiit.jpg",
        completed: true,
        scheduledDate: "Apr 25 • 9:00 AM",
    },
    {
        id: "muscle-building",
        title: "Muscle Building",
        duration: "60 min",
        intensity: "Medium",
        category: "Strength",
        image: "/muscle building.jpg",
        completed: true,
        scheduledDate: "Apr 22 • 7:00 AM",
    },
    {
        id: "core-strength",
        title: "Core Strength",
        duration: "30 min",
        intensity: "Medium",
        category: "Core",
        image: "/hiit.jpg",
        completed: false,
        scheduledDate: "Apr 28 • 8:00 AM",
    },
    {
        id: "full-body-stretch",
        title: "Full Body Stretch",
        duration: "20 min",
        intensity: "Low",
        category: "Flexibility",
        image: "/muscle building.jpg",
        completed: false,
        scheduledDate: "Apr 30 • 6:30 AM",
    },
];

export default function WorkoutsPage() {
    return (
        <div className="flex flex-col h-full bg-[#f4f7f4] rounded-3xl p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-foreground">Workouts</h1>
                <p className="text-muted-foreground mt-1">Track your fitness programs and upcoming sessions.</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Completed", value: "12", color: "bg-emerald-50 text-emerald-600" },
                    { label: "Scheduled", value: "2", color: "bg-blue-50 text-blue-600" },
                    { label: "Active Programs", value: "2", color: "bg-teal-50 text-teal-600" },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.color} rounded-3xl p-5 border border-border/50`}>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm font-medium mt-1 opacity-80">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Workout cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                {workouts.map((workout) => (
                    <div key={workout.id} className="bg-white rounded-3xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-36 w-full">
                            <Image src={workout.image} alt={workout.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-3 left-4 text-white">
                                <h3 className="font-bold text-base drop-shadow">{workout.title}</h3>
                                <p className="text-xs text-white/80">{workout.scheduledDate}</p>
                            </div>
                            {workout.completed && (
                                <Badge className="absolute top-3 right-3 bg-[#5d8b63] text-white text-xs border-0">
                                    Completed
                                </Badge>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{workout.duration}</span>
                                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" />{workout.intensity}</span>
                                <Badge variant="outline" className="text-xs">{workout.category}</Badge>
                            </div>
                            <Button asChild size="sm" className="rounded-full bg-[#5d8b63] hover:bg-[#4a724f] text-white px-4 text-xs gap-1.5">
                                <Link href={`/workouts/${workout.id}`}>
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    {workout.completed ? "View Details" : "Start Workout"}
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
