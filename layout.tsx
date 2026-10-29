import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Annai Foods | Order Online",
  description: "Place your Annai Foods order online and confirm it on WhatsApp."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
