import type { Metadata } from "next";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLabsConfigStatus } from "@/lib/labs-admin";

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
  title: "Codepet Labs",
  description:
    "An AI-native software lab exploring educational tools around the Pika ecosystem.",
  icons: {
    icon: "/images/paw-icon.svg",
    apple: "/images/paw-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authReady = getLabsConfigStatus().ready;
  const content = (
    <>
      <SiteHeader authReady={authReady} />
      {children}
      <SiteFooter />
    </>
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {authReady ? <AuthKitProvider>{content}</AuthKitProvider> : content}
      </body>
    </html>
  );
}
