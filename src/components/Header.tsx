
"use client";

import Link from "next/link";
import { GitMerge, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import UserNav from "./UserNav";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/history", label: "History" },
    { href: "/dashboard", label: "Dashboard", auth: true },
  ];

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <Link href="/" className="flex items-center justify-center mr-auto" aria-label="PathFinder Home">
        <GitMerge className="h-6 w-6 text-primary" />
        <span className="font-semibold text-xl ml-2">PathFinder</span>
      </Link>
      <nav className="hidden md:flex items-center gap-4 sm:gap-6 mr-4">
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
      <div className="flex items-center gap-2">
        {loading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : user ? (
            <UserNav />
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px]">
            <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
              <SheetClose asChild>
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold text-foreground mb-4"
                >
                  <GitMerge className="h-6 w-6 text-primary" />
                  <span>PathFinder</span>
                </Link>
              </SheetClose>
              {navLinks.map((link) => {
                if (link.auth && !user) return null;
                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "transition-colors hover:text-primary",
                        pathname === link.href
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
            {!loading && !user && (
              <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/login">Login</Link>
                    </Button>
                </SheetClose>
                <SheetClose asChild>
                    <Button asChild className="w-full">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </SheetClose>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
