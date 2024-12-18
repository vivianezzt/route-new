import type { Metadata } from "next";
import {Mulish} from "next/font/google";
import "./globals.css";

const mulish = Mulish({
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "New Route",
  description: "Aplicação de rastreamento de encomendas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${mulish.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
