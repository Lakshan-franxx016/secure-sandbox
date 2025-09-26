"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const handleSignOut = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : "";
    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
    if (error?.code) {
      toast.error(error.code);
    } else {
      if (typeof window !== "undefined") localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
    }
  };

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        pathname === href
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">司</span>
          <span className="font-semibold tracking-wide">Sensei</span>
        </Link>
        <nav className="flex items-center gap-1">
          {link("/scan", "Scan")}
          {link("/labs", "Labs")}
          {link("/", "Home")}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="#sensei">Open Chat</a>
          </Button>
          {/* Auth actions */}
          {isPending ? null : session?.user ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">{session.user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>Logout</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/login?redirect=${encodeURIComponent(pathname || "/")}`}>Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/register?redirect=${encodeURIComponent(pathname || "/")}`}>Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}