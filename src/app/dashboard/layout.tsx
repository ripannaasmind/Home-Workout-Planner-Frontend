import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="flex min-h-screen p-4 gap-6 font-sans bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bg.png')" }}
        >
            <DashboardSidebar />
            <main className="flex-1 w-full">{children}</main>
        </div>
    );
}
