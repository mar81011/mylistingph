"use client";

import { useState } from "react";
import { Copy, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/utils";

type ShareButtonsProps = {
  slug: string;
  title: string;
};

export function ShareButtons({ slug, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `${getSiteUrl()}/listings/${slug}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copied ? "Copied!" : "Copy link"}
      </Button>
      <a
        href={fbShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${title} on Facebook`}
      >
        <Button variant="outline" size="sm" type="button">
          <Share2 className="h-4 w-4 text-blue-600" />
          Share on Facebook
        </Button>
      </a>
    </div>
  );
}
