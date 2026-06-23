"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

type PhotoUploadProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    if (photos.length + files.length > 10) {
      setError("Maximum 10 photos allowed.");
      return;
    }

    setUploading(true);
    setError(null);

    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        break;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be under 5MB.");
        break;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        newUrls.push(dataUrl);
      } catch {
        setError("Failed to read image.");
        break;
      }
    }

    if (newUrls.length) {
      onChange([...photos, ...newUrls]);
    }

    setUploading(false);
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((url, i) => (
          <div
            key={`${url.slice(0, 32)}-${i}`}
            className="relative aspect-square overflow-hidden rounded-lg border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-xs text-white">
                Cover
              </span>
            )}
          </div>
        ))}

        {photos.length < 10 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="mt-2 text-xs text-slate-500">Add photos</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-slate-500">
        Add up to 10 photos. First photo is used when sharing on Facebook.
      </p>
    </div>
  );
}
