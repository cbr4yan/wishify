import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wishify - Crea tu lista de regalos",
  description: "Crea tu lista de regalos y compártela. Otros pueden reservar anónimamente lo que van a regalar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
