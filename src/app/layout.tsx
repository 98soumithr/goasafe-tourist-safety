import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoaSafe Admin — Tourist Safety & Taxi Grievance System",
  description: "Admin dashboard for the Goa Tourist Safety & Taxi Grievance AI system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
