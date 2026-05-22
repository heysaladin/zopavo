"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Library,
  CalendarDays,
  FileText,
  Zap,
  ChevronLeft,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: Library },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/templates", label: "Templates", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { theme, setTheme } = useTheme();

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-sidebar-border bg-sidebar transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border",
        sidebarCollapsed && "justify-center px-0"
      )}>
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary shrink-0">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">HyperFlow</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-px">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-100",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-accent",
                sidebarCollapsed && "justify-center px-0 py-2.5"
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-px">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-accent transition-colors",
            sidebarCollapsed && "justify-center px-0"
          )}
          title={sidebarCollapsed ? "Toggle theme" : undefined}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 shrink-0" />
          )}
          {!sidebarCollapsed && (
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          )}
        </button>

        {/* Collapse */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-accent transition-colors",
            sidebarCollapsed && "justify-center px-0"
          )}
        >
          <ChevronLeft className={cn("w-4 h-4 shrink-0 transition-transform", sidebarCollapsed && "rotate-180")} />
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
