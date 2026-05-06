"use client";

import Link from "next/link";
import { Item } from "@/types";
import { isProtected } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface ItemCardProps {
  item: Item;
}

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ItemCard({ item }: ItemCardProps) {
  const protected_ = isProtected(item);
  const displayTitle = protected_ ? getGenericLabel(item.category) : item.title;

  return (
    <Link href={`/items/${item.id}`} className="block group">
      <Card className="p-4 h-full flex flex-col transition-shadow group-hover:shadow-md">
        {/* Image / Placeholder */}
        <div className="h-40 rounded-lg overflow-hidden mb-3 flex-shrink-0">
          {!protected_ && item.image_url ? (
            <img
              src={item.image_url}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-ust-gold to-yellow-300" />
          )}
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {item.type === "lost" ? (
            <Badge variant="red">Lost</Badge>
          ) : (
            <Badge variant="blue">Found</Badge>
          )}
          {item.status === "open" && <Badge variant="green">open</Badge>}
          {item.status === "claimed" && <Badge variant="amber">claimed</Badge>}
          {item.status === "resolved" && <Badge variant="gray">resolved</Badge>}
          {protected_ && <Badge variant="amber">Protected</Badge>}
        </div>

        {/* Category pill */}
        <div className="mb-2">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {item.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-snug">
          {displayTitle}
        </h3>

        {/* Description (only for unprotected items) */}
        {!protected_ && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-1">
            {item.description}
          </p>
        )}

        {/* Spacer when description is hidden */}
        {protected_ && <div className="flex-1" />}

        {/* Location and date */}
        <div className="mt-auto pt-2 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="font-medium text-gray-500">Location</span>
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="font-medium text-gray-500">Date</span>
            <span>{formatDate(item.date)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
