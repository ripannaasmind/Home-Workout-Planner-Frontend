import React from "react";

export function DashboardHeader() {
    return (
        <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
            <div className="mt-4">
                <h2 className="text-2xl text-foreground font-medium">Welcome back, Justin!</h2>
                <p className="text-muted-foreground mt-1">
                    Here&apos;s a quick overview of your fitness journey.
                </p>
            </div>
        </div>
    );
}
