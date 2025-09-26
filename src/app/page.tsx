"use client";

import Link from "next/link";
import SenseiChat from "@/components/SenseiChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, FlaskConical, Brain } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Anime-inspired backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(99,102,241,0.15),transparent_60%),radial-gradient(900px_500px_at_85%_-5%,rgba(236,72,153,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981359-219d6364c9c8?q=80&w=2070&auto=format&fit=crop')] opacity-[0.08] bg-cover bg-center mix-blend-screen" />
      </div>

      <section className="container mx-auto px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Anime-dark UI • Remediation-first
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-indigo-300 via-sky-300 to-fuchsia-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-6xl">
            Sensei — Self-Training AI for Safe Web Security
          </h1>
          <p className="mt-4 text-balance text-muted-foreground">
            Two personas. One mission. Scan safely, remediate first, and master defenses in sandboxed labs with replayable simulations.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/scan">Start a Safe Scan</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/labs">Enter Labs</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <Card className="bg-secondary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" /> Safe URL Scanning</CardTitle>
              <CardDescription>Consent-gated, simulation-first scans compatible with OWASP ZAP.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Queue scans, respect legal constraints, and replay results. Map findings to OWASP Top 10.
            </CardContent>
          </Card>
          <Card className="bg-secondary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4" /> Dual Personas</CardTitle>
              <CardDescription>Deep Mind and Kyōju — switch tone and guidance style instantly.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Cryptic analysis or professorial walkthroughs tailored to your task and skill level.
            </CardContent>
          </Card>
          <Card className="bg-secondary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><FlaskConical className="h-4 w-4" /> Sandboxed Labs</CardTitle>
              <CardDescription>Hands-on challenges with difficulty filters and interactive tutorials.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Practice fixes and validate with replayable simulations before going live.
            </CardContent>
          </Card>
        </div>

        <Separator className="my-10" />

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Chat with Sensei</h2>
            <p className="text-sm text-muted-foreground">Switch personas, plan scans, and get remediation-first advice. Ask about OWASP Top 10 mappings and risk heatmaps.</p>
            <SenseiChat />
          </div>
          <div className="space-y-4">
            <Card className="bg-background/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Workflow Overview</CardTitle>
                <CardDescription>From target intake to remediation validation.</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>Provide target URL with explicit consent and accept terms.</li>
                  <li>Queue a simulation scan; review findings mapped to OWASP Top 10.</li>
                  <li>Study AI-enhanced fixes; prioritize via the risk heatmap.</li>
                  <li>Practice in labs; replay simulations until tests pass.</li>
                </ol>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm"><Link href="/scan">Open Scanner</Link></Button>
                  <Button asChild size="sm" variant="outline"><Link href="/results/test">View Sample Report</Link></Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Personas</CardTitle>
                <CardDescription>Choose your guide.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="secondary">Deep Mind — cryptic, analytical</Badge>
                <Badge variant="outline">Kyōju — patient, tutorial-first</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}