import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
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
    <html lang="en">
      <body className={`${geist.variable} font-sans bg-[#0A1512] text-white`}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1 bg-[#0F1F1B]">
            <Header />
            <main className="flex-1 overflow-auto pb-16 bg-[#0F1F1B]">
              {children}
            </main>
          </div>
        </div>
        <BottomBar />
      </body>
    </html>
  );
}