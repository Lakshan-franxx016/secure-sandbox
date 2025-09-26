"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const RegisterForm = () => {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/labs";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await authClient.signUp.email({
      email: form.email,
      name: form.name,
      password: form.password,
    });
    setLoading(false);

    if (error?.code) {
      const map: Record<string, string> = { USER_ALREADY_EXISTS: "Email already registered" };
      toast.error(map[error.code] || "Registration failed");
      return;
    }

    toast.success("Account created! Please sign in.");
    router.push(`/login?registered=true&redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto w-full max-w-md bg-background/70">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create your Sensei account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                required
                value={form.confirm}
                onChange={(e) => setForm((s) => ({ ...s, confirm: e.target.value }))}
                placeholder="••••••••"
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Already have an account? <a className="underline" href={`/login?redirect=${encodeURIComponent(redirect)}`}>Sign in</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;