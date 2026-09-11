import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quota Dock — AI Usage Widget",
  description:
    "Dock-style widget tracking Cursor, Claude, ChatGPT, and Grok usage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
