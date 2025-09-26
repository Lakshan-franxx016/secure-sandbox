import { db } from '@/db';
import { labs } from '@/db/schema';

async function main() {
    const sampleLabs = [
        {
            slug: "xss-101",
            title: "XSS 101 — Escaping Basics",
            level: "novice",
            tag: "xss",
            steps: ["Reflect input", "Render unsafely", "Apply encoder", "Verify fix"],
            estimatedMinutes: null,
            objectives: null,
            createdAt: new Date('2024-01-10T09:00:00Z').getTime(),
            updatedAt: new Date('2024-01-10T09:00:00Z').getTime(),
        },
        {
            slug: "sql-params",
            title: "SQLi — Parameterize Queries",
            level: "adept",
            tag: "injection",
            steps: ["Find concatenated query", "Introduce placeholders", "Bind parameters", "Add regression test"],
            estimatedMinutes: null,
            objectives: null,
            createdAt: new Date('2024-01-15T14:30:00Z').getTime(),
            updatedAt: new Date('2024-01-15T14:30:00Z').getTime(),
        },
        {
            slug: "cors-hardening",
            title: "CORS Policy Hardening",
            level: "adept",
            tag: "misconfig",
            steps: ["Detect wildcard origin", "Implement allowlist", "Drop credentials for *", "Verify preflight"],
            estimatedMinutes: null,
            objectives: null,
            createdAt: new Date('2024-01-22T11:15:00Z').getTime(),
            updatedAt: new Date('2024-01-22T11:15:00Z').getTime(),
        },
        {
            slug: "csrf-defense",
            title: "CSRF Tokens & SameSite",
            level: "master",
            tag: "csrf",
            steps: ["Identify unsafe POST", "Add double-submit token", "Set SameSite=strict", "Automate test"],
            estimatedMinutes: null,
            objectives: null,
            createdAt: new Date('2024-02-01T16:45:00Z').getTime(),
            updatedAt: new Date('2024-02-01T16:45:00Z').getTime(),
        }
    ];

    await db.insert(labs).values(sampleLabs);
    
    console.log('✅ Labs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});