import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Empower Upper Cumberland | Breaking the Cycle of Rural Poverty",
  description: "A $25 million initiative proving rural poverty is solvable. Through coordinated services, financial bridge support, and relationship-based coaching, we help families achieve lasting economic independence.",
  keywords: ["poverty alleviation", "rural Tennessee", "TANF", "economic mobility", "family services", "Upper Cumberland"],
  openGraph: {
    title: "Empower Upper Cumberland",
    description: "A coordinated poverty alleviation system that delivers family stability & measurable economic outcomes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
