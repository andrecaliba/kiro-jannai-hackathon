"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/store";
import { CATEGORIES, isProtected } from "@/lib/constants";
import ItemCard from "@/components/ItemCard";

const GENERIC_LABELS: Record<string, string> = {
  Electronics: "Lost electronic device",
  "Bags and Wallets": "Lost bag or wallet",
  "ID and Cards": "Lost ID or card",
  Accessories: "Lost accessory",
  Documents: "Lost document",
};

function getGenericLabel(category: string): string {
  return GENERIC_LABELS[category] ?? "Lost item";
}

function ItemsCatalogInner() {
  const searchParams = useSearchParams();
  const { items, filters, setFilters, resetFilters } = useStore();

  // On mount, read `type` query param and apply as filter
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "lost" || typeParam === "found") {
      setFilters({ type: typeParam });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive filtered items applying all active filters simultaneously
  const filteredItems = items.filter((item) => {
    // Type filter
    if (filters.type && item.type !== filters.type) return false;

    // Category filter
    if (filters.category && item.category !== filters.category) return false;

    // Status filter
    if (filters.status && item.status !== filters.status) return false;

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const protected_ = isProtected(item);
      if (protected_) {
        // Match against generic label only
        const label = getGenericLabel(item.category).toLowerCase();
        if (!label.includes(query)) return false;
      } else {
        // Match against title or description
        const inTitle = item.title.toLowerCase().includes(query);
        const inDescription = item.description.toLowerCase().includes(query);
        if (!inTitle && !inDescription) return false;
      }
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Items Catalog</h1>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        {/* Text search */}
        <input
          type="text"
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ust-gold focus:border-transparent"
        />

        {/* Type select */}
        <select
          value={filters.type}
          onChange={(e) =>
            setFilters({ type: e.target.value as "" | "lost" | "found" })
          }
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ust-gold focus:border-transparent bg-white"
        >
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        {/* Category select */}
        <select
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ust-gold focus:border-transparent bg-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Status select */}
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({
              status: e.target.value as "" | "open" | "claimed" | "resolved",
            })
          }
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ust-gold focus:border-transparent bg-white"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="claimed">Claimed</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Clear Filters button */}
        <button
          onClick={resetFilters}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Clear Filters
        </button>
      </div>

      {/* Filtered item count */}
      <p className="text-sm text-gray-600 mb-4">
        {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
      </p>

      {/* Items grid or empty state */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-700 text-lg font-medium mb-2">No items found</p>
          <p className="text-gray-500 text-sm">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-gray-700">Loading...</div>}>
      <ItemsCatalogInner />
    </Suspense>
  );
}
