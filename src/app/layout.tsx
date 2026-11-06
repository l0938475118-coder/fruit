import type { Metadata } from "next";
import { Noto_Serif_TC, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import LuckyDraw from "@/components/LuckyDraw";
import WelcomeGate from "@/components/WelcomeGate";

const serif = Noto_Serif_TC({
  variable: "--font-serif-tc",
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  preload: false,
});

const sans = Noto_Sans_TC({
  variable: "--font-sans-tc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "福爾摩沙果園｜台灣水果誌",
  description: "認識台灣的特色水果與四季產季",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <LuckyDraw />
        <WelcomeGate />
      </body>
    </html>
  );
}
