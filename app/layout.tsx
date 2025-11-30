import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "RentIQ - Find Your Perfect Rental",
  description: "List every rental in the country and make each one searchable by credit score, income requirement, and co-signer options.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SessionProviderWrapper>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

