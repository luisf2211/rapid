"use client";

import { cn } from "@/lib/utils";
import { ANNOTATION_TOOLS, type AnnotationTool } from "./types";

interface AnnotationToolbarProps {
  activeTool: AnnotationTool;
  onToolChange: (tool: AnnotationTool) => void;
}

/** Iconos SVG inline para cada herramienta */
function ToolIcon({ tool }: { tool: AnnotationTool }) {
  const size = 18;
  const shared = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (tool) {
    case "crossMark":
      return (
        <svg {...shared}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      );
    case "circle":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
    case "scratch":
      return (
        <svg {...shared}>
          <path d="M 3 16 Q 7 10 11 14 Q 15 18 19 8" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...shared}>
          <line x1="5" y1="19" x2="19" y2="5" />
          <polyline points="12,5 19,5 19,12" />
        </svg>
      );
    case "crack":
      return (
        <svg {...shared}>
          <path d="M 12 3 L 14 9 L 20 10 L 15 14 L 17 21 L 12 17 L 7 21 L 9 14 L 4 10 L 10 9 Z" />
        </svg>
      );
    case "text":
      return (
        <svg {...shared}>
          <path d="M 6 4 L 18 4" />
          <path d="M 12 4 L 12 20" />
          <path d="M 8 20 L 16 20" />
        </svg>
      );
    case "eraser":
      return (
        <svg {...shared}>
          <path d="M 20 20 L 7 20 L 3 16 Q 2 15 3 14 L 14 3 Q 15 2 16 3 L 21 8 Q 22 9 21 10 L 12 19" />
          <path d="M 14 3 L 21 10" />
        </svg>
      );
  }
}

/**
 * Barra de herramientas de anotación para el diagrama de inspección.
 * Disposición horizontal, compacta, con iconos y label corto.
 */
export function AnnotationToolbar({ activeTool, onToolChange }: AnnotationToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Herramientas de anotación"
      className="flex flex-wrap items-center gap-1 p-1.5 rounded-lg bg-rapid-surface-soft border border-rapid-border"
    >
      {ANNOTATION_TOOLS.map(({ tool, label, description }) => {
        const isActive = activeTool === tool;
        const isEraser = tool === "eraser";
        return (
          <button
            key={tool}
            type="button"
            title={description}
            aria-pressed={isActive}
            onClick={() => onToolChange(tool)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
              isActive && !isEraser && "bg-rapid-green text-white shadow-sm",
              isActive && isEraser && "bg-red-500 text-white shadow-sm",
              !isActive && "text-rapid-text-muted hover:bg-white hover:text-rapid-text",
            )}
          >
            <ToolIcon tool={tool} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
