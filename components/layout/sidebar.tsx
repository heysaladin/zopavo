"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Library,
  CalendarDays,
  FileText,
  ChevronLeft,
  Sun,
  Moon,
  Megaphone,
  Inbox,
  FileSignature,
  FolderKanban,
  ClipboardCheck,
  Code2,
  FlaskConical,
  PackageCheck,
  BookOpen,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const phases = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/docs", label: "Documents", icon: BookOpen },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/library", label: "Library", icon: Library },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/templates", label: "Templates", icon: FileText },
    ],
  },
  {
    label: "Inquiry",
    items: [{ href: "/inquiries", label: "Inquiries", icon: Inbox }],
  },
  {
    label: "Deal",
    items: [{ href: "/deals", label: "Deals", icon: FileSignature }],
  },
  {
    label: "Project Management",
    items: [{ href: "/projects", label: "Projects", icon: FolderKanban }],
  },
  {
    label: "Approval",
    items: [{ href: "/approval", label: "Approval", icon: ClipboardCheck }],
  },
  {
    label: "Development",
    items: [{ href: "/development", label: "Dev Board", icon: Code2 }],
  },
  {
    label: "QC",
    items: [{ href: "/qc", label: "QC Reports", icon: FlaskConical }],
  },
  {
    label: "Handover",
    items: [{ href: "/handover", label: "Handover", icon: PackageCheck }],
  },
];

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
        sidebarCollapsed ? "md:w-14" : "md:w-56"
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
          <span className="font-semibold text-sm tracking-tight text-sidebar-foreground whitespace-nowrap">
            Zopavo
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-3">
        {phases.map((phase, i) => (
          <div key={i}>
            {phase.label && (
              sidebarCollapsed
                ? <div className="border-t border-sidebar-border mx-1 mb-1 mt-1" />
                : <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
                    {phase.label}
                  </p>
            )}
            <div className="space-y-px">
              {phase.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
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
                    {!sidebarCollapsed && (
                      <span className="whitespace-nowrap">{label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
