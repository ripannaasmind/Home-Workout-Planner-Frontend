import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, CalendarDays, Flame } from "lucide-react";
import Link from "next/link";

export function UpcomingWorkout() {
    return (
        <div className="mb-8 bg-white rounded-3xl p-4 shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4 px-2">Upcoming Workouts</h3>
            <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4">
                <Image
                    src="/hiit.jpg"
                    alt="HIIT Burn"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-4 text-white">
                    <h4 className="text-lg font-bold drop-shadow">HIIT Burn</h4>
                    <p className="text-sm text-white/80 drop-shadow">April 25 • 9:00 AM</p>
                </div>
            </div>

            <div className="flex items-center justify-between px-2 mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        Apr 25
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        45 min
                    </span>
                    <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        High Intensity
                    </span>
                </div>
            </div>

            <div className="px-2">
                <Button asChild className="w-auto rounded-full bg-[#5d8b63] hover:bg-[#4a724f] text-white px-6">
                    <Link href="/workouts/hiit-burn">View Workout</Link>
                </Button>
            </div>
        </div>
    );
}
