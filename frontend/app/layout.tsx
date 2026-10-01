import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "MeetSpace | Office Meeting Room Booking",
  description: "MeetSpace office meeting room booking system."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} ${ibmPlexMono.variable}`}>
        {/* Skip to main content — WCAG 2.1 Level A */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

