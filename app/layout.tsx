import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JONG 翁梓铭 — Music Producer / Singer-Songwriter / AIMV Director",
  description: "翁梓铭 JONG 的个人作品集：音乐制作、唱作、演唱与 AIMV 视觉导演作品。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "history.scrollRestoration='manual';if(location.hash){history.replaceState(null,'',location.pathname+location.search)}scrollTo(0,0);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('motion-boot');setTimeout(()=>document.documentElement.classList.remove('motion-boot'),8000)}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
