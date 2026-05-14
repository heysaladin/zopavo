import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "HyperFlow — Creator Posting Assistant",
  description: "The calm, fast posting assistant for solo creators and designers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-zinc-100 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-w-0">
            {children}
          </main>
        </div>
        <ToastProvider />
      </body>
    </html>
  );
}
