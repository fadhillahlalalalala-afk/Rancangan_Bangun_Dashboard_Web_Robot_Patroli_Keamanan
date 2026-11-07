"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Ringkasan" },
  { href: "/robots", label: "Robot" },
  { href: "/patroli", label: "Patroli" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="Navigasi utama">
      {LINKS.map((l) => {
        const aktif = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={aktif ? "page" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
