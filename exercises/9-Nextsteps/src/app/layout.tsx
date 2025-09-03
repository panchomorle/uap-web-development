import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { cookies } from "next/headers";
import { getUserFromToken } from "../lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book Reviews - Discover and Review Books",
  description:
    "Search for books, read details, and share your reviews with the community",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side: get user from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const user = token ? await getUserFromToken(token) : null;
  console.log("Token:", token);
  console.log("User:", user);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <Header user={user} />
        <main>{children}</main>
      </body>
    </html>
  );
}
