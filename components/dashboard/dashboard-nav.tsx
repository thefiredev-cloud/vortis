"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  TrendingUp,
  Star,
  FileText,
  Settings,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn, designTokens } from "@/lib/design-tokens";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analyze",
    href: "/dashboard/analyze",
    icon: TrendingUp,
  },
  {
    label: "Watchlist",
    href: "/dashboard/watchlist",
    icon: Star,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-black/50 backdrop-blur-xl safe-area-inset-top">
        <div className={designTokens.container.default}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <h1 className={cn("text-xl font-bold", designTokens.gradient.text.primary)}>
                Vortis
              </h1>
            </Link>

            {/* Desktop: User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                    userButtonPopoverCard: "bg-slate-900/95 backdrop-blur-xl border border-slate-700",
                    userButtonPopoverActionButton: "hover:bg-white/5",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>

            {/* Mobile: Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors touch-manipulation"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-slate-300" />
              ) : (
                <Menu className="h-6 w-6 text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-slate-900/98 backdrop-blur-xl border-l border-slate-700 z-50 md:hidden overflow-y-auto safe-area-inset">
            {/* Mobile Menu Header */}
            <div className="border-b border-slate-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className={cn("text-lg font-bold", designTokens.gradient.text.primary)}>
                  Vortis
                </h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-slate-300" />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10",
                      userButtonPopoverCard: "bg-slate-900/95 backdrop-blur-xl border border-slate-700",
                    },
                  }}
                  afterSignOutUrl="/"
                />
                <div>
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm text-white truncate max-w-[200px]">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Menu Items */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-manipulation",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("hidden md:block", className)}>
      <div className={cn("sticky top-20", designTokens.card.base)}>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-manipulation",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
