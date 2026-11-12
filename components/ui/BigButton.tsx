import React from "react";

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "soft";
  children: React.ReactNode;
}

export function BigButton({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: BigButtonProps) {
  const baseClasses =
    "w-full min-h-[64px] px-6 py-4 rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 transition shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-[#2E7D32] hover:bg-[#256629] text-white", // calm green for Done
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-gray-300",
    danger: "bg-[#C62828] hover:bg-[#B71C1C] text-white shadow-md", // Red for Help
    soft: "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300", // Soft amber
  }[variant];

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
