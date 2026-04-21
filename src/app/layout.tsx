import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "지맥(G-Maek) - 풍수지리 처방전",
  description: "당신의 터를 분석하고 행운의 인테리어를 처방해 드립니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* 카카오맵 SDK - 발급받은 API 키를 나중에 .env에 넣으세요 */}
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&libraries=services,clusterer,drawing&autoload=false`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
