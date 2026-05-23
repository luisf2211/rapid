"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
}

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: Tab[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="card p-1.5 mb-4 flex flex-wrap gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap",
                isActive
                  ? "bg-rapid-black text-white"
                  : "text-rapid-text-muted hover:bg-rapid-bg hover:text-rapid-text",
              )}
            >
              {t.label}
              {typeof t.count === "number" && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-rapid-green text-rapid-black"
                      : "bg-rapid-bg text-rapid-text-muted",
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div>{activeTab?.content}</div>
    </div>
  );
}
