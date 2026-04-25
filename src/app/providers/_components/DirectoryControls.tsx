"use client";

import { useMemo, useState } from "react";
import type { Provider } from "@/lib/types";
import { ProviderCard } from "./ProviderCard";

type SortKey = "trending" | "price-asc" | "name-asc";

export function DirectoryControls({ providers }: { providers: Provider[] }) {
  const categories = useMemo(() => {
    const set = new Set(providers.map((p) => p.category));
    return ["All", ...Array.from(set).sort()];
  }, [providers]);

  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("trending");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = providers.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "trending") {
        return b.bulkBuyersThisMonth - a.bulkBuyersThisMonth;
      }
      if (sort === "price-asc") {
        return a.basePricePerCallUsdc - b.basePricePerCallUsdc;
      }
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [providers, category, sort, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl border border-arc-border bg-arc-surface/40 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search providers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-xs rounded-md border border-arc-border bg-arc-bg px-3 py-2 text-sm text-arc-text placeholder:text-arc-muted focus:border-arc-glow focus:outline-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  category === c
                    ? "border-arc-glow bg-arc-glow/10 text-arc-text"
                    : "border-arc-border bg-arc-bg text-arc-muted hover:border-arc-glow/50 hover:text-arc-text"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-xs text-arc-muted">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-arc-border bg-arc-bg px-2 py-1.5 text-sm text-arc-text focus:border-arc-glow focus:outline-none"
          >
            <option value="trending">Trending</option>
            <option value="price-asc">Price: low to high</option>
            <option value="name-asc">Name: A–Z</option>
          </select>
        </div>
      </div>

      <div className="mt-3 text-xs text-arc-muted">
        {filtered.length} {filtered.length === 1 ? "provider" : "providers"}
        {category !== "All" && ` in ${category}`}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-arc-border bg-arc-surface/40 p-10 text-center text-arc-muted">
          No providers match your filters.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}
