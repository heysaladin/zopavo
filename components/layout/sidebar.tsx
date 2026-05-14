"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  CalendarDays,
  FileText,
  Zap,
  ChevronLeft,
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

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-white/5 bg-[#0d0d0d] transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2.5 px-4 py-5 border-b border-white/5",
        sidebarCollapsed && "justify-center px-0"
      )}>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm tracking-tight">HyperFlow</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-100",
                active
                  ? "bg-white/8 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
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

      {/* Collapse button */}
      <div className="p-2 border-t border-white/5">
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-xs text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-colors",
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
