"use client";

import Link from "next/link";
import { GitMerge } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center mr-6" aria-label="PathFinder Home">
        <GitMerge className="h-6 w-6 text-primary" />
        <span className="font-semibold text-xl ml-2">PathFinder</span>
      </Link>
      <nav className="flex items-center gap-4 sm:gap-6 ml-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === link.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
