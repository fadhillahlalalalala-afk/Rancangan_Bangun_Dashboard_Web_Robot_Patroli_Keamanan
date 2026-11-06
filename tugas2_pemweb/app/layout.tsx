import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Dashboard Robot Patroli Keamanan",
  description: "Pantau robot patroli dan kelola jadwal patroli keamanan.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a className="skip" href="#konten">Lewati ke konten utama</a>
        <header className="topbar">
          <div className="topbar-inner">
            <span className="brand">Patrol Dashboard</span>
            <Nav />
          </div>
        </header>
        <main id="konten">{children}</main>
      </body>
    </html>
  );
}
