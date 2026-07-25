"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

/** Ignora mayúsculas y tildes para que "lija" encuentre "Lija de Agua". */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Select con búsqueda: filtra por cualquier palabra del texto tecleado. */
export function Combobox({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Buscar...",
  emptyMessage = "Sin resultados",
  className,
}: ComboboxProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return options;
    return options.filter((o) => {
      const haystack = normalize(`${o.label} ${o.sublabel ?? ""}`);
      return terms.every((t) => haystack.includes(t));
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onBlur]);

  /** Primer índice seleccionable desde `from` en la dirección `step`. */
  function nextEnabled(from: number, step: number): number {
    for (let i = from; i >= 0 && i < filtered.length; i += step) {
      if (!filtered[i].disabled) return i;
    }
    return Math.min(Math.max(from, 0), Math.max(filtered.length - 1, 0));
  }

  function select(option: ComboboxOption) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = e.key === "ArrowDown" ? 1 : -1;
      setHighlight((h) => nextEnabled(h + step, step));
    } else if (e.key === "Enter") {
      if (open && filtered[highlight]) {
        e.preventDefault();
        select(filtered[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={open ? query : selected?.label ?? ""}
          placeholder={selected ? selected.label : placeholder}
          onFocus={() => {
            setOpen(true);
            setHighlight(nextEnabled(0, 1));
          }}
          // El input conserva el foco tras elegir: sin esto, un segundo clic no reabre la lista.
          onClick={() => {
            setOpen(true);
            setHighlight(nextEnabled(0, 1));
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={onKeyDown}
          className="form-input pr-9"
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rapid-text-muted" />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-rapid-border bg-rapid-surface shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-rapid-text-muted">
              {emptyMessage}
            </li>
          ) : (
            filtered.map((option, idx) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(option);
                }}
                className={cn(
                  "px-3 py-2 text-sm",
                  option.disabled
                    ? "cursor-not-allowed text-rapid-text-muted-soft"
                    : "cursor-pointer text-rapid-text",
                  idx === highlight && !option.disabled && "bg-rapid-green-soft",
                )}
              >
                <span className="block">{option.label}</span>
                {option.sublabel && (
                  <span className="block text-xs text-rapid-text-muted">
                    {option.sublabel}
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
