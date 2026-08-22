"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Megaphone, LayoutGrid, Users, GitBranch, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { toggleMobileMenu } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background shrink-0">
      {/* Mobile: hamburger + logo */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="flex items-center justify-center w-9 h-9 -ml-1 rounded-md hover:bg-accent transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/board" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary shrink-0">
            <Megaphone className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Zopavo</span>
        </Link>
      </div>

      {/* Desktop: logo */}
      <div className="hidden md:block">
        <span className="font-bold text-sm tracking-widest text-foreground">ZOPAVO</span>
      </div>

      {/* Avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Z
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href="/board" className="flex items-center gap-2.5 cursor-pointer">
              <LayoutGrid className="w-4 h-4" />
              Board
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/colab" className="flex items-center gap-2.5 cursor-pointer">
              <Users className="w-4 h-4" />
              Colab
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer">
              <GitBranch className="w-4 h-4" />
              Steps
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-muted-foreground cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
