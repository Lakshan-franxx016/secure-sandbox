"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Lab = {
  id: number;
  slug: string;
  title: string;
  level: "novice" | "adept" | "master";
  tag: string;
  steps: string[];
  estimatedMinutes?: number | null;
  objectives?: string[] | null;
};

export default function LabsPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<string>("all");
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function loadLabs() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (level) params.set("level", level);
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const res = await fetch(`/api/labs?${params.toString()}`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `Request failed (${res.status})`);
        }
        const data: Lab[] = await res.json();
        if (!ignore) setLabs(data);
      } catch (e: any) {
        if (!ignore && e.name !== "AbortError") setError(e.message || "Failed to load labs");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    // Debounce a bit for query typing
    const t = setTimeout(loadLabs, 250);
    return () => {
      ignore = true;
      controller.abort();
      clearTimeout(t);
    };
  }, [query, level]);

  const shown = useMemo(() => labs, [labs]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-5xl bg-secondary/50">
        <CardHeader>
          <CardTitle>Sandboxed Practice Labs</CardTitle>
          <CardDescription>Replayable simulations with step-by-step guidance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search labs..." />
            <div className="sm:col-span-2 flex gap-2">
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="novice">Novice</SelectItem>
                  <SelectItem value="adept">Adept</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-background/60 animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 w-2/3 bg-muted rounded" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[...Array(4)].map((__, j) => (
                      <div key={j} className="h-3 w-full bg-muted rounded" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {shown.map((lab) => (
                <Card key={lab.slug} className="bg-background/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      {lab.title}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{lab.level}</Badge>
                        <Badge variant="outline">{lab.tag}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ol className="list-decimal pl-5 text-sm text-muted-foreground">
                      {lab.steps?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                    <div className="pt-2">
                      <Button variant="outline" size="sm">Start Simulation</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!shown.length && !loading && !error && (
                <div className="col-span-full text-sm text-muted-foreground">No labs found.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}