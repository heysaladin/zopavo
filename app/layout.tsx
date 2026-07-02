import type { Metadata } from "next";
import "./globals.css";
import { Sidebar, MobileHeader } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";

export const metadata: Metadata = {
  title: "Zopavo",
  description: "End-to-end project management — from marketing to handover.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto min-w-0 h-full flex flex-col">
              <MobileHeader />
              {children}
            </main>
          </div>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
