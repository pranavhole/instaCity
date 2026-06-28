import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/providers";
import { brandName } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: brandName,
  description: "Turn a public profile into a neon 3D city.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
