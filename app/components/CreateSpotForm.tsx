import GeoAutofillButton from "./GeoAutofillButton";

export default function CreateSpotForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={action}
      className="space-y-6 bg-neutral-950 text-neutral-100 p-6 rounded-3xl shadow-xl border border-neutral-800"
    >
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-neutral-200">
          Title
        </label>
        <input
          name="title"
          required
          placeholder="Enter spot title"
          className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-neutral-200">
          Description
        </label>
        <textarea
          name="description"
          required
          rows={3}
          placeholder="Describe the spot"
          className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-neutral-200">
          Tags (comma separated)
        </label>
        <input
          name="tags"
          placeholder="e.g. cafe, study, chill"
          className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
        />
      </div>

      {/* Latitude & Longitude */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-neutral-200">
            Latitude
          </label>
          <input
            name="lat"
            type="number"
            step="any"
            required
            placeholder="e.g. 28.7041"
            className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-neutral-200">
            Longitude
          </label>
          <input
            name="lng"
            type="number"
            step="any"
            required
            placeholder="e.g. 77.1025"
            className="w-full border border-neutral-700 rounded-lg px-4 py-2 bg-neutral-900 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
          />
        </div>
      </div>

      {/* Geo Autofill */}
      <GeoAutofillButton />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-6 py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 active:bg-purple-900 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        Create Spot
      </button>
    </form>
  );
}
