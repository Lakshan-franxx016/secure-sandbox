"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Simple local storage helpers
const SKEY_Q = "sensei.scanQueue";
const SKEY_R = "sensei.scans";

type JobStatus = "queued" | "running" | "completed" | "failed";

type ScanJob = { id: string; url: string; createdAt: number; status: JobStatus; resultId?: string };

function rid() { return Math.random().toString(36).slice(2, 10); }

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function save<T>(key: string, value: T) { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)); }

// Mock OWASP ZAP-like result
function createResult(url: string) {
  const id = rid();
  const findings = [
    { id: rid(), title: "XSS: Unescaped user input", owasp: "A03:2021-Injection", risk: 4, fix: "Encode output, adopt CSP 'strict-dynamic', use trusted templating." },
    { id: rid(), title: "Missing Security Headers", owasp: "A05:2021-Security Misconfiguration", risk: 3, fix: "Add HSTS, X-Content-Type-Options, Frame-Options/COOP/COEP, CSP." },
    { id: rid(), title: "Permissive CORS", owasp: "A05:2021-Security Misconfiguration", risk: 3, fix: "Restrict origins, drop credentials for '*' , validate preflight." },
  ];
  return { id, url, completedAt: Date.now(), findings };
}

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [terms, setTerms] = useState(false);
  const [ack, setAck] = useState(false);
  const [queue, setQueue] = useState<ScanJob[]>([]);

  useEffect(() => {
    setQueue(load(SKEY_Q, [] as ScanJob[]));
  }, []);

  useEffect(() => { save(SKEY_Q, queue); }, [queue]);

  // Worker simulation
  useEffect(() => {
    const tick = setInterval(() => {
      setQueue((prev) => {
        const next = [...prev];
        const running = next.find((j) => j.status === "running");
        if (running) return next; // one at a time
        const job = next.find((j) => j.status === "queued");
        if (!job) return next;
        job.status = "running";
        // complete in ~1.2s
        setTimeout(() => {
          const result = createResult(job.url);
          const results = load(SKEY_R, [] as any[]);
          results.push(result);
          save(SKEY_R, results);
          setQueue((cur) => cur.map((j) => j.id === job.id ? { ...j, status: "completed", resultId: result.id } : j));
        }, 1200);
        return next;
      });
    }, 800);
    return () => clearInterval(tick);
  }, []);

  function enqueue() {
    try {
      const u = new URL(url);
      if (!/^https?:/.test(u.protocol)) throw new Error("Invalid protocol");
    } catch {
      alert("Enter a valid http(s) URL");
      return;
    }
    if (!consent || !terms || !ack) { alert("You must provide legal consent and accept terms, and acknowledge simulation mode."); return; }
    const job: ScanJob = { id: rid(), url, createdAt: Date.now(), status: "queued" };
    setQueue((q) => [job, ...q]);
    setUrl("");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-3xl bg-secondary/50">
        <CardHeader>
          <CardTitle>Safe URL Scan (OWASP ZAP compatible)</CardTitle>
          <CardDescription>Queue a safe reconnaissance scan. Requires explicit legal consent and terms acceptance. Simulated locally — no network calls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://target.example" /></div>
            <Button onClick={enqueue} className="w-full">Queue Scan</Button>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
            <Label htmlFor="consent" className="text-sm text-muted-foreground">I own the target or have explicit written permission to scan it. I agree to safe, non-destructive checks only.</Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="terms" checked={terms} onCheckedChange={(v) => setTerms(!!v)} />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">I accept the Terms and confirm all scans run in simulation mode. No live traffic is generated.</Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="sim-ack" checked={ack} onCheckedChange={(v) => setAck(!!v)} />
            <Label htmlFor="sim-ack" className="text-sm text-muted-foreground">I acknowledge that all scans operate strictly in simulation mode and no live traffic is generated.</Label>
          </div>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">Queue</h3>
            <div className="space-y-2">
              {queue.length === 0 && <p className="text-sm text-muted-foreground">No jobs yet. Add a URL above.</p>}
              {queue.map((j) => (
                <Card key={j.id} className="bg-background/60">
                  <CardContent className="flex items-center justify-between gap-3 p-4 text-sm">
                    <div className="truncate">
                      <div className="truncate font-medium">{j.url}</div>
                      <div className="text-xs text-muted-foreground">{new Date(j.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={j.status === "completed" ? "default" : j.status === "running" ? "secondary" : "outline"}>{j.status}</Badge>
                      {j.status === "completed" && j.resultId && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/results/${j.resultId}`}>View Report</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">This UI is designed to be compatible with remediation-first reporting and OWASP Top 10 mapping. Integrate with ZAP APIs server-side later.</CardFooter>
      </Card>
    </div>
  );
}