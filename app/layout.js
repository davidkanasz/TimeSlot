import { ClerkProvider } from "@clerk/nextjs";
import { skSK } from "@clerk/localizations";
import "./globals.css";

export const metadata = {
  title: "TimeSlot - Rezervačný systém",
  description: "Jednoduchý a efektívny systém na rezervovanie termínov",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={skSK}>
      <html lang="sk">
        <body suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}