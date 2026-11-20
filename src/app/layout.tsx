import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'sonner';

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
  title: "MentorLagbe - Smart Tuition & Mentorship Platform",
  description: "Find your ideal tutor or share your expertise with students across Bangladesh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        
        <ToastContainer position="top-right" />
        {/* Pages use sonner's toast(); the handler must be mounted globally. */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
