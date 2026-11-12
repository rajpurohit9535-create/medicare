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
    "w-full min-h-[64px] px-5 sm:px-6 py-4 rounded-2xl text-xl sm:text-2xl font-bold flex items-center justify-center gap-3 transition-transform duration-100 shadow-sm active:scale-[0.97] cursor-pointer touch-manipulation select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const variantClasses = {
    primary:
      "bg-[#2E7D32] hover:bg-[#256629] text-white focus:ring-4 focus:ring-green-300/50 shadow-md", // calm green for Done
    secondary:
      "bg-white hover:bg-gray-100 text-gray-800 border-2 border-gray-300 focus:ring-4 focus:ring-gray-200",
    danger:
      "bg-[#C62828] hover:bg-[#B71C1C] text-white shadow-lg focus:ring-4 focus:ring-red-300/50", // Red for Help
    soft:
      "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 focus:ring-4 focus:ring-amber-200", // Soft amber
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
