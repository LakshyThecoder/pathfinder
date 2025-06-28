
"use client";

import Link from "next/link";
import { GitMerge } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import UserNav from "./UserNav";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/history", label: "History", auth: true },
    { href: "/dashboard", label: "Dashboard", auth: true },
  ];

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center mr-6" aria-label="PathFinder Home">
        <GitMerge className="h-6 w-6 text-primary" />
        <span className="font-semibold text-xl ml-2">PathFinder</span>
      </Link>
      <nav className="hidden md:flex items-center gap-4 sm:gap-6">
        {navLinks.map((link) => {
            if (link.auth && !user) return null;
            return (
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
            )
        })}
      </nav>
      <div className="flex items-center gap-4 ml-auto">
        {loading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : user ? (
            <UserNav />
        ) : (
            <>
                <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </>
        )}
      </div>
    </header>
  );
}
