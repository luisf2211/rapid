"use client";

import { useState } from "react";
import { ExternalLink, ImageOff } from "lucide-react";
import { resolvePhotoUrl } from "@/lib/photos";

interface PhotoPreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export function PhotoPreview({ src, alt, className }: PhotoPreviewProps) {
  const [failed, setFailed] = useState(false);
  const resolved = resolvePhotoUrl(src);

  if (!resolved || failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-rapid-bg text-rapid-text-muted p-2">
        <ImageOff className="w-5 h-5 opacity-50" />
        <span className="text-[10px] uppercase tracking-wider text-center">
          Sin preview
        </span>
        {src && (
          <a
            href={resolved || src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-rapid-green-dark hover:underline truncate max-w-full px-1"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            Abrir URL
          </a>
        )}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
