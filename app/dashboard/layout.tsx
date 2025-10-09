import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { OrbBackground } from "@/components/ui/orb-background";
import { DashboardNav, DashboardSidebar } from "@/components/dashboard/dashboard-nav";
import { designTokens } from "@/lib/design-tokens";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className={designTokens.layout.page}>
      <OrbBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Navigation */}
        <DashboardNav />

        {/* Main Content Area */}
        <div className={designTokens.container.default}>
          <div className={designTokens.grid.dashboard}>
            {/* Sidebar Navigation - Hidden on mobile */}
            <DashboardSidebar className="lg:col-span-1" />

            {/* Page Content */}
            <main className="lg:col-span-3 py-8">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
