"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Brain, BookOpen } from "lucide-react";

export type Persona = "deep-mind" | "kyoju";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  persona: Persona;
  timestamp: number;
};

function genId() { return Math.random().toString(36).slice(2, 9); }

const personaStyle: Record<Persona, { name: string; tone: string; icon: JSX.Element; gradient: string }> = {
  "deep-mind": { name: "Deep Mind", tone: "wise, analytical, succinct yet deep", icon: <Brain className="h-4 w-4" />, gradient: "from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20" },
  "kyoju": { name: "Kyōju", tone: "patient, step-by-step, tutorial-first", icon: <BookOpen className="h-4 w-4" />, gradient: "from-emerald-500/20 via-sky-500/10 to-purple-500/20" },
};

function synthesizeReply(input: string, persona: Persona): string {
  const prefix = persona === "deep-mind" ? "[Deep Mind]" : "[Kyōju]";

  // Lightweight intent scan
  const t = input.toLowerCase();
  const isScan = /(zap|owasp|scan|scanner|recon)/.test(t);
  const isVuln = /(sql|xss|csrf|ssrf|rce|sqli|xxe|cors)/.test(t);
  const isCode = /(code|typescript|javascript|python|regex|function|class)/.test(t);
  const isMath = /(\d+\s*[+\-*/^]|integral|derivative|probability|combinatorics|algebra|equation)/.test(t);
  const isLab = /(lab|exercise|practice|challenge|walkthrough|tutorial)/.test(t);

  function block(title: string, body: string) {
    return `\n\n${title}:\n${body}`;
  }

  let understanding = `I hear: "${input.trim()}". I will respond clearly and adapt to your level.`;
  let steps = "";
  let example = "";
  let next = "";

  if (isScan) {
    steps = `1) Define scope and get explicit written authorization.\n2) Use simulation mode first; never generate live traffic without permission.\n3) Map findings to OWASP Top 10 and prioritize remediation-first actions.\n4) Record evidence and safe repro steps; avoid destructive payloads.`;
    example = `Simulated workflow:\n- Queue target: https://target.example (with consent)\n- Checks: headers (HSTS, X-CTO, CSP), input encoding (XSS), auth/session flags, CORS policy\n- Output: risk heatmap + concrete fixes (e.g., set 'X-Content-Type-Options: nosniff', CSP strict-dynamic, HttpOnly+SameSite cookies).`;
    next = `Want me to create a mini lab to practice secure headers or XSS defenses, or guide you to the Scan page to enqueue a simulated run?`;
  } else if (isVuln) {
    steps = `1) Identify vulnerable sinks/sources; prefer allowlists and parameterization.\n2) Add defense-in-depth: CSP, output encoding, prepared statements, SameSite cookies, SSRF allowlists.\n3) Reproduce safely in a sandbox; write unit tests to lock fixes.`;
    example = `Example (parameterized query - SQLi):\n- Bad: "SELECT * FROM users WHERE id = " + userInput\n- Good: db.select('users').where({ id: param(':id') })`;
    next = `Shall I generate a small lab with failing tests you can fix, or walk line-by-line through your code?`;
  } else if (isCode) {
    steps = `1) Restate the goal. 2) Draft a minimal, working example. 3) Explain the why. 4) Add tests. 5) Optimize only if needed.`;
    example = `Tiny TS helper:\nfunction clamp(n: number, min: number, max: number) {\n  return Math.min(max, Math.max(min, n));\n}`;
    next = `Share your snippet or constraints and I'll refactor it with reasoning and tests.`;
  } else if (isMath) {
    steps = `1) Parse the problem. 2) Choose a method. 3) Solve step-by-step. 4) Verify. 5) Generalize.`;
    example = `Example: Solve 2x + 6 = 10 → 2x = 4 → x = 2. Check: 2*2+6=10.`;
    next = `Give me the exact expression or constraints; I'll show all steps and a quick check.`;
  } else if (isLab) {
    steps = `We'll build a hands-on exercise: define objective → starting scaffold → hints → solution → review.`;
    example = `Lab idea: Fix missing security headers. Goal: Add HSTS, X-CTO, CSP. Hints: start with a Content-Security-Policy that blocks inline scripts; add Strict-Transport-Security with preload.`;
    next = `Prefer a web headers lab, an XSS encoding lab, or a CORS hardening lab?`;
  } else {
    steps = `1) Clarify your goal. 2) Propose a plan. 3) Provide a concise solution. 4) Offer extensions for deeper learning.`;
    example = `I can draft a study path (OWASP Top 10 → hands-on labs → remediation patterns) and adapt examples to your stack.`;
    next = `Tell me your current level and target (e.g., "junior dev securing a Next.js app").`;
  }

  const closing = persona === "deep-mind"
    ? "I will be concise but thorough. Ready when you are."
    : "I'll guide you patiently and adjust the pace. Ask anything—even " +
      "for hints before the full answer.";

  return `${prefix} Mentor mode engaged.`
    + block("Understanding", understanding)
    + block("Answer / Steps", steps)
    + block("Example", example)
    + block("Next steps", next)
    + `\n\nCheck-for-understanding: Shall I proceed with a mini lab, a code review, or a simulated scan walkthrough?\n${closing}`;
}

export default function SenseiChat({ inline }: { inline?: boolean }) {
  const [persona, setPersona] = useState<Persona>("deep-mind");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intro: Message = {
      id: genId(), role: "assistant", timestamp: Date.now(), persona,
      text: persona === "deep-mind"
        ? "I am Sensei — Deep Mind. Speak your aim, and I will respond with precise steps and insight."
        : "Sensei (Kyōju) at your service. Tell me what you wish to learn; we will proceed step-by-step with examples.",
    };
    setMessages([intro]);
  }, []);

  useEffect(() => {
    // Auto scroll
    areaRef.current?.scrollTo({ top: areaRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const headerGlow = useMemo(() => personaStyle[persona].gradient, [persona]);

  function send() {
    const content = text.trim();
    if (!content) return;
    const user: Message = { id: genId(), role: "user", text: content, persona, timestamp: Date.now() };
    setMessages((m) => [...m, user]);
    setText("");
    // Fake thinking delay
    setTimeout(() => {
      const reply: Message = { id: genId(), role: "assistant", text: synthesizeReply(content, persona), persona, timestamp: Date.now() };
      setMessages((m) => [...m, reply]);
    }, 400);
  }

  return (
    <Card id="sensei" className={`relative overflow-hidden border-muted/40 bg-gradient-to-br ${headerGlow}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(99,102,241,0.06),transparent_40%),radial-gradient(800px_circle_at_90%_0,rgba(236,72,153,0.06),transparent_40%)]" />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><span className="tracking-wide">Sensei</span></span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">{personaStyle[persona].icon}{personaStyle[persona].name}</Badge>
            <Select value={persona} onValueChange={(v: Persona) => setPersona(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deep-mind">Deep Mind</SelectItem>
                <SelectItem value="kyoju">Kyōju</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="relative z-10">
        <ScrollArea className="h-64" viewportRef={areaRef}>
          <div className="space-y-3 pr-2">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className={"inline-block max-w-[90%] rounded-md px-3 py-2 text-sm " + (m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-secondary-foreground") }>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="relative z-10 gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask Sensei about scans, reports, or labs..." onKeyDown={(e) => e.key === "Enter" && send()} />
        <Button onClick={send}>Send</Button>
      </CardFooter>
    </Card>
  );
}