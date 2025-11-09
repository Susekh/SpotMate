"use client";

import { useState } from "react";
import GeoAutofillButton from "./GeoAutofillButton";
import { X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function CreateSpotForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📸 Handle File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 10 - selectedFiles.length;
    const newFiles = files.slice(0, remainingSlots);

    if (newFiles.length === 0) {
      toast.error("Maximum 10 photos allowed");
      return;
    }

    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const uploadPromises = newFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        return data.result.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedUrls((prev) => [...prev, ...urls]);
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload some images. Please try again.");

      // Rollback failed uploads from preview
      setSelectedFiles((prev) => prev.slice(0, -newFiles.length));
      setPreviewUrls((prev) => {
        const removed = prev.slice(-newFiles.length);
        removed.forEach((url) => URL.revokeObjectURL(url));
        return prev.slice(0, -newFiles.length);
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 🗑️ Remove Selected Image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    toast("Image removed", { icon: "🗑️" });
  };

  // 🧾 Handle Form Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isUploading) {
      toast.error("Please wait until all images are uploaded");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    uploadedUrls.forEach((url) => formData.append("gallery[]", url));

    try {
      await toast.promise(action(formData), {
        loading: "Creating spot...",
        success: "Spot created successfully 🎉",
        error: "Failed to create spot. Please try again.",
      });

      // Clean up preview URLs
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    } catch (error) {
      console.error("Submit error:", error);
      // handled by toast.promise automatically
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
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

      {/* Gallery Upload */}
      <div>
        <label className="block text-sm font-semibold mb-1 text-neutral-200">
          Gallery Photos (max 10)
        </label>
        <div className="relative">
          <input
            type="file"
            id="gallery-upload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading || selectedFiles.length >= 10}
            className="hidden"
          />
          <label
            htmlFor="gallery-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer bg-neutral-900 hover:bg-neutral-800 transition ${
              isUploading || selectedFiles.length >= 10
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-purple-500 mb-2 animate-spin" />
                <span className="text-sm text-neutral-400">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <span className="text-sm text-neutral-400">
                  Click to upload photos
                </span>
                <span className="text-xs text-neutral-500 mt-1">
                  {selectedFiles.length}/10 photos{" "}
                  {selectedFiles.length >= 10 && "(Max reached)"}
                </span>
              </>
            )}
          </label>
        </div>

        {/* Preview Grid */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  height={100}
                  width={100}
                  className="w-full h-24 object-cover rounded-lg border border-neutral-700"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={isUploading}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                {uploadedUrls[index] && (
                  <div className="absolute bottom-1 right-1 bg-green-600 text-white rounded-full p-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
        disabled={isUploading || isSubmitting}
        className="w-full px-6 py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 active:bg-purple-900 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
        {isSubmitting ? "Creating Spot..." : "Create Spot"}
      </button>
    </form>
  );
}
