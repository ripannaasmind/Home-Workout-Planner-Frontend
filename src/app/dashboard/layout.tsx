import { Header } from "@/components/layout/Header";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";


// ------- Dashboard Layout Component -------
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
            <div className="flex flex-col flex-1">
                <Header />
                <div className="flex flex-1">
                    <DashboardSidebar />
                    <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6">{children}</main>
                </div>
            </div>
        </div>
    );
}
