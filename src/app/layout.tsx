import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "재무 분석 서비스 | 누구나 쉽게 이해하는 재무 데이터",
  description: "국내 상장기업의 재무제표를 차트로 시각화하고 AI가 쉽게 설명해 드립니다. OpenDART 실시간 데이터 기반.",
  keywords: "재무제표, 재무분석, 주식, 투자, OpenDART, 재무상태표, 손익계산서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
