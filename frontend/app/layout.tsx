import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstaCity",
  description: "Turn your Instagram profile into a living 3D city."
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
