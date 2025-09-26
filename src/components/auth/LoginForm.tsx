"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const LoginForm = () => {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/labs";
  const registered = search.get("registered") === "true";
  const { data: session } = useSession();

  useEffect(() => {
    if (registered) {
      toast.success("Account created! Please sign in.");
    }
  }, [registered]);

  useEffect(() => {
    if (session?.user) {
      router.push(redirect);
    }
  }, [session, router, redirect]);

  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe,
      callbackURL: redirect,
    });
    setLoading(false);
    if (error?.code) {
      toast.error("Invalid email or password. Please try again.");
      return;
    }
    router.push(redirect);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto w-full max-w-md bg-background/70">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Access Sensei, scans, and labs.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="off"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={form.rememberMe}
                onCheckedChange={(v) => setForm((s) => ({ ...s, rememberMe: Boolean(v) }))}
              />
              <Label htmlFor="remember">Remember me</Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              No account? <a className="underline" href={`/register?redirect=${encodeURIComponent(redirect)}`}>Register</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;