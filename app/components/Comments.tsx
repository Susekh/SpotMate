"use client";
import { useEffect, useState, useTransition } from "react";

type Comment = {
    _id: string;
    userId: string;
    content: string;
    createdAt: string;
};

export default function Comments({ spotId }: { spotId: string }) {
    const [isPending, startTransition] = useTransition();
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function load() {
        const res = await fetch(`/api/spots/${spotId}/comments`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Failed to load comments");
            return;
        }
        setComments(data.comments || []);
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spotId]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            const res = await fetch(`/api/spots/${spotId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to add comment");
                return;
            }
            setContent("");
            await load();
        });
    }

    return (
        <div className="space-y-4">
            <form onSubmit={onSubmit} className="flex gap-2">
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 bg-transparent"
                    placeholder="Add a comment"
                />
                <button disabled={isPending} className="px-4 py-2 rounded bg-foreground text-background disabled:cursor-not-allowed cursor-pointer hover:opacity-90 transition">
                    {isPending ? "Posting..." : "Post"}
                </button>
            </form>
            <div className="space-y-3">
                {comments.map((c) => (
                    <div key={c._id} className="border rounded p-3">
                        <p className="text-sm">{c.content}</p>
                        <p className="text-xs opacity-60 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                    </div>
                ))}
                {comments.length === 0 && <p className="text-sm opacity-70">No comments yet.</p>}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}


