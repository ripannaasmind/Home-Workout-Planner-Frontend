import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50 p-4 gap-6 font-sans">
            <DashboardSidebar />
            <main className="flex-1 w-full">{children}</main>
        </div>
    );
}
