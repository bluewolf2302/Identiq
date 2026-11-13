import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { IdentiqProvider } from "@/components/IdentiqProvider";
import { AppShell } from "@/components/AppShell";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Identiq — Multimodal Brand Governance Platform",
  description:
    "Evidence-driven brand governance platform for verifying campaign copy, visual assets, terminology, and compliance claims.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FAF8F6] text-[#141414]">
        <IdentiqProvider>
          <AppShell>{children}</AppShell>
        </IdentiqProvider>
      </body>
    </html>
  );
}
