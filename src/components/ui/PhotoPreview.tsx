"use client";

import { useState } from "react";
import { ExternalLink, ImageOff } from "lucide-react";
import { resolvePhotoUrl } from "@/lib/photos";
import { Lightbox } from "@/components/ui/Lightbox";

interface PhotoPreviewProps {
  src: string;
  alt: string;
  className?: string;
  /** Permite abrir la imagen en grande al hacer clic. */
  expandable?: boolean;
}

export function PhotoPreview({
  src,
  alt,
  className,
  expandable = false,
}: PhotoPreviewProps) {
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
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

  // eslint-disable-next-line @next/next/no-img-element
  const image = (
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );

  if (!expandable) return image;

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={`Ampliar ${alt}`}
        className="absolute inset-0 cursor-zoom-in"
      >
        {image}
      </button>
      {expanded && (
        <Lightbox src={resolved} alt={alt} onClose={() => setExpanded(false)} />
      )}
    </>
  );
}
