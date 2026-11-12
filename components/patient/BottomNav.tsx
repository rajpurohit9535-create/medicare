"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, LifeBuoy } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/patient", icon: Home },
    { label: "Today", href: "/patient/today", icon: Calendar },
    { label: "Family", href: "/patient/family", icon: Users },
    { label: "Help", href: "/patient/help", icon: LifeBuoy, isHelp: true },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 bg-white border-t-2 border-gray-200 z-50 shadow-lg safe-area-bottom"
    >
      <div className="max-w-2xl mx-auto grid grid-cols-4 h-20">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/patient" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          if (item.isHelp) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-h-[64px] transition ${
                  isActive
                    ? "bg-red-700 text-white"
                    : "bg-[#C62828] text-white hover:bg-red-700 active:bg-red-800"
                }`}
              >
                <Icon className="w-8 h-8 stroke-[2.5]" />
                <span className="text-lg font-black tracking-wide mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[64px] transition ${
                isActive
                  ? "bg-green-50 text-[#2E7D32] border-t-4 border-[#2E7D32]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100"
              }`}
            >
              <Icon
                className={`w-7 h-7 ${isActive ? "stroke-[2.5] text-[#2E7D32]" : "text-gray-600"}`}
              />
              <span
                className={`text-base font-bold mt-0.5 ${
                  isActive ? "text-[#2E7D32]" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

