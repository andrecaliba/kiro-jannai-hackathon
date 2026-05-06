import React from "react";

type BadgeVariant = "red" | "blue" | "amber" | "green" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
  gray: "bg-gray-100 text-gray-700",
};

export default function Badge({ children, variant }: BadgeProps) {
  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
