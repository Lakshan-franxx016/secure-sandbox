"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const SKEY_R = "sensei.scans";

type Finding = { id: string; title: string; owasp: string; risk: number; fix: string };

type Result = { id: string; url: string; completedAt: number; findings: Finding[] };

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const all: Result[] = JSON.parse(localStorage.getItem(SKEY_R) || "[]");
    const r = all.find((x) => x.id === id) || null;
    setResult(r);
  }, [id]);

  const heat = useMemo(() => {
    if (!result) return [] as { level: number; count: number }[];
    const buckets = [0,0,0,0,0];
    result.findings.forEach(f => buckets[f.risk] = (buckets[f.risk]||0) + 1);
    return buckets.map((count, level) => ({ level, count }));
  }, [result]);

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Report not found</CardTitle>
            <CardDescription>Try running a scan first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href="/scan">Go to Scan</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-4xl bg-secondary/50">
        <CardHeader>
          <CardTitle>Remediation-First Report</CardTitle>
          <CardDescription>Target: {result.url} — Completed {new Date(result.completedAt).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground">Risk Heatmap</h3>
            <div className="grid grid-cols-5 gap-2">
              {heat.map(({ level, count }) => (
                <div key={level} className="flex flex-col items-center gap-2">
                  <div className="text-xs">L{level}</div>
                  <div className="h-10 w-full rounded-md" style={{ backgroundColor: `oklch(${35 + level*12}% ${0.05 + level*0.05} ${20 + level*40})` }} title={`${count} issue(s) at level ${level}`} />
                  <div className="text-xs text-muted-foreground">{count}</div>
                </div>
              ))}
            </div>
          </section>
          <Separator />
          <section className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">Findings mapped to OWASP Top 10</h3>
            {result.findings.map((f) => (
              <Card key={f.id} className="bg-background/60">
                <CardContent className="grid gap-2 p-4 sm:grid-cols-12">
                  <div className="sm:col-span-7">
                    <div className="font-medium">{f.title}</div>
                    <div className="text-xs text-muted-foreground">{f.owasp}</div>
                  </div>
                  <div className="sm:col-span-2 flex items-center"><Badge variant={f.risk >= 4 ? "default" : f.risk >= 2 ? "secondary" : "outline"}>Risk {f.risk}</Badge></div>
                  <div className="sm:col-span-3 text-sm"><span className="font-semibold">Fix:</span> {f.fix}</div>
                </CardContent>
              </Card>
            ))}
          </section>
          <Separator />
          <section className="space-y-2">
            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">Sensei Recommendations</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Prioritize high-risk items first; verify fixes in a replayable simulation before production.</li>
              <li>Add unit tests for each remediation: header presence, encoder usage, and CORS policy checks.</li>
              <li>Enable Content Security Policy with nonce-based scripts and strict-dynamic for modern frameworks.</li>
            </ul>
          </section>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href="/scan">Back to Scan</Link></Button>
            <Button asChild><Link href="/labs">Practice in Labs</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}