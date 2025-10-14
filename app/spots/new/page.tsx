import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateSpotForm from "@/app/components/CreateSpotForm";
import { createSpot } from "./actions";
import { headers } from "next/headers";

export default async function NewSpotPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/auth");
  }
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Create a new Spot</h1>
      <CreateSpotForm action={createSpot} />
    </div>
  );
}
