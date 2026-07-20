"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ChevronLeft,
  Sun,
  Moon,
  Megaphone,
  BookOpen,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { PIPELINE_STEPS, stepNum } from "@/lib/pipeline";

const workspaceItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/docs", label: "Documents", icon: BookOpen },
];

const marketingRoutes = ["/library", "/calendar", "/templates"];

export function MobileHeader() {
  const { toggleMobileMenu } = useAppStore();
  return (
    <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
      <button onClick={toggleMobileMenu} className="p-1.5 rounded-md hover:bg-accent transition-colors">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary shrink-0">
          <Megaphone className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight">Zopavo</span>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, closeMobileMenu } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { closeMobileMenu(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDark = theme === "dark";

  const isActive = (href: string) => {
    // Strip query string for base path comparison
    const basePath = href.split("?")[0];
    return pathname === basePath || pathname.startsWith(basePath + "/");
  };

  // For pipeline step links that include query params, check pathname + query
  const isStepActive = (href: string) => {
    const [basePath, query] = href.split("?");
    if (!query) return pathname === basePath || pathname.startsWith(basePath + "/");
    // For query-param links (e.g. /deliverables?stage=APPROVAL), just match the base path for now
    return pathname === basePath || pathname.startsWith(basePath + "/");
  };

  // Which pipeline step is currently active (for the rail highlight)
  const activeStepNum =
    PIPELINE_STEPS.find((s) =>
      s.id === "MARKETING"
        ? marketingRoutes.some((r) => isActive(r))
        : isStepActive(s.href)
    )?.num ?? null;

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 shrink-0 overflow-hidden",
        mobileMenuOpen ? "fixed inset-y-0 left-0 z-50 w-64" : "hidden md:flex",
        "md:relative md:inset-auto md:h-full",
        sidebarCollapsed ? "md:w-14" : "md:w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border shrink-0",
          sidebarCollapsed && "justify-center px-0"
        )}
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary shrink-0">
          <Megaphone className="w-4 h-4 text-primary-foreground" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <span className="block font-semibold text-sm tracking-tight text-sidebar-foreground whitespace-nowrap leading-none">
              Zopavo
            </span>
            <span className="block text-[10px] text-muted-foreground/60 whitespace-nowrap mt-0.5">
              8-step pipeline
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Workspace */}
        <div className="space-y-px">
          {workspaceItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-100",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-accent",
                  sidebarCollapsed && "justify-center px-0 py-2.5"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="whitespace-nowrap">{label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Pipeline — 8 numbered steps with rail */}
        <div>
          {sidebarCollapsed ? (
            <div className="border-t border-sidebar-border mx-1 mb-1" />
          ) : (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
              Pipeline
            </p>
          )}
          <div className={cn(!sidebarCollapsed && "relative")}>
            {/* Vertical rail */}
            {!sidebarCollapsed && (
              <div className="absolute left-[21px] top-3 bottom-3 w-px bg-sidebar-border" />
            )}
            <div className="space-y-px">
              {PIPELINE_STEPS.map((step) => {
                const Icon = step.icon;
                const active = activeStepNum === step.num;
                return (
                  <div key={step.id}>
                    <Link
                      href={step.href}
                      title={`${stepNum(step.num)} ${step.label}`}
                      className={cn(
                        "group relative flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors duration-100",
                        active
                          ? "text-sidebar-foreground font-medium"
                          : "text-muted-foreground hover:text-sidebar-foreground",
                        sidebarCollapsed && "justify-center px-0 py-2.5 hover:bg-accent"
                      )}
                    >
                      {sidebarCollapsed ? (
                        <Icon className={cn("w-4 h-4 shrink-0", active && step.color.text)} />
                      ) : (
                        <>
                          <span
                            className={cn(
                              "relative z-10 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono font-semibold shrink-0 border transition-colors",
                              active
                                ? cn(step.color.solid, "text-white border-transparent")
                                : "bg-sidebar border-sidebar-border text-muted-foreground group-hover:border-muted-foreground/40"
                            )}
                          >
                            {step.num}
                          </span>
                          <span className="whitespace-nowrap flex-1">{step.label}</span>
                          <Icon
                            className={cn(
                              "w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity",
                              active && cn("opacity-100", step.color.text)
                            )}
                          />
                        </>
                      )}
                    </Link>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-px shrink-0">
        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-accent transition-colors",
            sidebarCollapsed && "justify-center px-0"
          )}
          title={mounted ? (isDark ? "Light mode" : "Dark mode") : ""}
        >
          <span className="w-4 h-4 shrink-0 flex items-center justify-center">
            {mounted && (isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
          </span>
          {!sidebarCollapsed && (
            <span className="whitespace-nowrap">
              {mounted ? (isDark ? "Light mode" : "Dark mode") : ""}
            </span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-accent transition-colors",
            sidebarCollapsed && "justify-center px-0"
          )}
          title={sidebarCollapsed ? "Expand" : "Collapse"}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 shrink-0 transition-transform duration-200",
              sidebarCollapsed && "rotate-180"
            )}
          />
          {!sidebarCollapsed && (
            <span className="whitespace-nowrap">Collapse</span>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}
