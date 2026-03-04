import Image from "next/image";
import { Button } from "@/components/ui/button";

export function UpcomingWorkout() {
    return (
        <div className="mb-8 bg-white rounded-3xl p-4 shadow-sm border border-border">
            <h3 className="text-xl font-semibold mb-4 px-2">Upcoming Workouts</h3>
            <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4">
                <Image
                    src="/images/workouts/hiit-burn.jpg"
                    alt="HIIT Burn"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            <div className="flex items-center justify-between px-2">
                <div>
                    <h4 className="text-lg font-bold text-foreground">HIIT Burn</h4>
                    <p className="text-muted-foreground text-sm">April 25 • 9:00 AM</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-foreground mb-1">Aprl 25</p>
                    <div className="flex gap-1 justify-end mb-2">
                        <span className="w-2 h-2 rounded-full bg-primary/20"></span>
                        <span className="w-2 h-2 rounded-full bg-primary/20"></span>
                        <span className="w-2 h-2 rounded-full bg-primary/20"></span>
                    </div>
                </div>
            </div>

            <div className="px-2 mt-4">
                <Button className="w-auto rounded-full bg-[#5d8b63] hover:bg-[#4a724f] text-white px-6">
                    View Workout
                </Button>
            </div>
        </div>
    );
}
