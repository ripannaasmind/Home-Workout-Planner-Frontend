import { Header } from "@/components/layout/Header";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="relative min-h-screen flex flex-col"
            style={{
                backgroundImage: "url('/bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="flex flex-col h-screen overflow-hidden">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <DashboardSidebar />
                    <main className="flex-1 min-w-0 p-6 overflow-y-auto">{children}</main>
                </div>
            </div>
        </div>
    );
}
