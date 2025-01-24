import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "DirtyNest - AI Conversations",
  description: "Supercharge AI Conversations with different AI models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans`}>
        <ThemeProvider>
          <TooltipProvider>
            <div className="flex h-screen bg-background text-foreground">
              <Sidebar />
              <div className="flex flex-col flex-1 bg-card">
                <Header />
                <main className="flex-1 overflow-auto pb-16 bg-card">
                  {children}
                </main>
              </div>
              <BottomBar />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}