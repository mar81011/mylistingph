"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

type ListingPhotoProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
};

/** Direct img — avoids broken /_next/image optimizer on Vercel for external URLs. */
export function ListingPhoto({
  src,
  alt,
  className = "",
  fill,
  priority,
}: ListingPhotoProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-200 text-slate-400 ${
          fill ? "absolute inset-0 h-full w-full" : ""
        } ${className}`.trim()}
        aria-hidden
      >
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  const classes = fill
    ? `absolute inset-0 h-full w-full object-cover ${className}`.trim()
    : className;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={classes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
