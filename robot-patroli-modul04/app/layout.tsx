import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const NAMA_PRODUK = "Web Robot Patroli Keamanan";

export const metadata: Metadata = {
  title: { default: NAMA_PRODUK, template: `%s | ${NAMA_PRODUK}` },
  description: "Pantau dan kelola robot patroli keamanan gedung, parkir, dan pagar.",
};

const tautan = [
  { href: "/", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/tentang", label: "Tentang" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a href="#konten" className="sr-only focus:not-sr-only">Lewati ke konten</a>
        <SiteHeader namaProduk={NAMA_PRODUK} tautan={tautan} />
        {children}
        <SiteFooter namaProduk={NAMA_PRODUK} />
      </body>
    </html>
  );
}
