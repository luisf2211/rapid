"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

const SEARCH_DEBOUNCE_MS = 300;

interface InventorySearchBarProps {
  initialQuery: string;
  initialFilter: string;
  initialCategory: string;
  categories: string[];
  placeholder: string;
  filterOptions: { value: string; label: string }[];
  compact?: boolean;
}

/** Filtros del inventario: escribir ya filtra, sin apretar un botón. */
export function InventorySearchBar({
  initialQuery,
  initialFilter,
  initialCategory,
  categories,
  placeholder,
  filterOptions,
  compact = false,
}: InventorySearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  function pushParams(next: {
    q?: string;
    filter?: string;
    category?: string;
  }) {
    const params = new URLSearchParams();
    const q = next.q ?? query;
    const filter = next.filter ?? initialFilter;
    const category = next.category ?? initialCategory;
    if (q.trim()) params.set("q", q.trim());
    if (filter && filter !== "all") params.set("filter", filter);
    if (category) params.set("category", category);
    const search = params.toString();
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    });
  }

  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => pushParams({ q: value }),
      SEARCH_DEBOUNCE_MS,
    );
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasFilters =
    Boolean(query.trim()) || initialFilter !== "all" || Boolean(initialCategory);

  const selectClass = compact
    ? "form-input py-1.5 text-sm w-auto"
    : "form-input w-auto min-w-[11rem]";

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-2"
          : "card p-4 mb-4 flex flex-wrap items-center gap-3"
      }
    >
      <div className={compact ? "relative w-56" : "relative flex-1 min-w-[14rem]"}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rapid-text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={
            compact
              ? "form-input py-1.5 pl-9 text-sm w-full"
              : "form-input pl-9 w-full"
          }
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-rapid-text-muted" />
        )}
      </div>

      {categories.length > 0 && (
        <select
          value={initialCategory}
          onChange={(e) => pushParams({ category: e.target.value })}
          aria-label="Categoría"
          className={selectClass}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      <select
        value={initialFilter}
        onChange={(e) => pushParams({ filter: e.target.value })}
        aria-label="Estado"
        className={selectClass}
      >
        {filterOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            pushParams({ q: "", filter: "all", category: "" });
          }}
          className={compact ? "btn-secondary text-sm py-1.5" : "btn-secondary"}
        >
          <X className="h-4 w-4" /> Limpiar
        </button>
      )}
    </div>
  );
}
