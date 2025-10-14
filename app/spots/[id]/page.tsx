import { headers } from "next/headers";
import Comments from "@/app/components/Comments";

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/spots/${id}`, {
    headers: await headers(),
    cache: "no-store",
  });

  if (!res.ok) {
    return <div className="p-6 text-center text-red-500">Failed to load spot.</div>;
  }

  const data = await res.json();
  const spot = data.spot as {
    _id: string;
    title: string;
    description: string;
    tags?: string[];
    location?: { type: string; coordinates: [number, number] };
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      {/* Title & Description */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {spot.title}
        </h1>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-5 shadow-sm">
          <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {spot.description}
          </p>
        </div>

        {spot.tags && spot.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spot.tags.map((t) => (
              <span
                key={t}
                className="text-xs border border-neutral-300 dark:border-neutral-600 rounded-full px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition hover:border-purple-400"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          Comments
        </h2>
        <Comments spotId={spot._id} />
      </div>

      {/* Location */}
      {spot.location && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
            Location
          </h2>
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow">
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${spot.location.coordinates[1]},${spot.location.coordinates[0]}&z=15&output=embed`}
            />
          </div>
          <div>
            <a
              className="underline text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:opacity-80 transition"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps/dir/?api=1&destination=${spot.location.coordinates[1]},${spot.location.coordinates[0]}`}
            >
              Open directions in Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
