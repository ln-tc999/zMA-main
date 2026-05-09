import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "zMAAI — Find the best yield route",
  description:
    "zMAAI discovers the best confidential vault opportunities using Zama FHE and deposits in one click.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: theme bootstrap must run before paint
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('iex-ai-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full text-main flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
