"use client";
import { signOut } from "@/lib/actions/auth-actions";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Session = typeof auth.$Infer.Session;

export default function DashboardClientPage({ session }: { session: Session }) {
  const router = useRouter();
  const user = session.user;
  const [interests, setInterests] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile/interests", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setInterests(data.interests || []);
      }
    })();
  }, []);

  function saveInterests(next: string[]) {
    startTransition(async () => {
      setInterests(next);
      await fetch("/api/profile/interests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: next }),
      });
    });
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
            <p className="opacity-70 text-sm">{user.email}</p>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 rounded bg-foreground text-background cursor-pointer hover:opacity-90 transition">Sign out</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h2 className="font-medium mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/spots/new" className="px-4 py-2 rounded border">Create spot</Link>
            <Link href="/spots/nearby" className="px-4 py-2 rounded bg-foreground text-background">Find nearby</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 space-y-3">
          <h2 className="font-medium">Your interests</h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((t) => (
              <button key={t} onClick={() => saveInterests(interests.filter(i => i !== t))} className="text-xs border rounded px-2 py-1 opacity-80 hover:opacity-100 cursor-pointer transition">{t} ✕</button>
            ))}
            {interests.length === 0 && <div className="text-sm opacity-60">No interests added yet.</div>}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add interest (comma separated)" className="flex-1 border rounded px-3 py-2 bg-transparent" />
            <button disabled={isPending} onClick={() => {
              const next = Array.from(new Set([...interests, ...input.split(',').map(s => s.trim()).filter(Boolean)]));
              setInput("");
              saveInterests(next);
            }} className="px-4 py-2 rounded bg-foreground text-background disabled:cursor-not-allowed cursor-pointer hover:opacity-90 transition">Add</button>
          </div>
          <p className="text-xs opacity-60">These interests will be used to improve search relevance.</p>
        </div>
      </div>
    </main>
  );
}