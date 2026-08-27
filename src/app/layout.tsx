import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import ThemeInitializer from "@/components/common/ThemeInitializer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DirtyNest",
  description: "AI-Powered Cyber Deck & Command Center",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DirtyNest",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07070B",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("antialiased dark", inter.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
    >
      <head />
      <body className="min-h-screen flex flex-col">
        <ThemeInitializer />
        <TooltipProvider delayDuration={300}>
          {children}
        </TooltipProvider>
        <Toaster richColors position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
