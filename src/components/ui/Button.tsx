import React from "react";

type ButtonVariant = "primary" | "danger" | "outline";

interface ButtonProps {
  children: React.ReactNode;
  variant: ButtonVariant;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ust-gold text-ust-black hover:bg-yellow-400",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "bg-transparent border border-white text-white hover:bg-white/10",
};

export default function Button({
  children,
  variant,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
