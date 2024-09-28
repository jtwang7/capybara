import type { Metadata } from "next";
import localFont from "next/font/local";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "./globals.css";
import NavlinkBar from "./_ui/navlink-bar";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Capybara",
  description: "Have fun, Enjoy life!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <UserProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased w-screen h-screen`}
        >
          <NavlinkBar />
          {children}
          <Toaster />
        </body>
      </UserProvider>
    </html>
  );
}
