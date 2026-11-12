"use client";

import { usePathname } from "next/navigation";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { BottomNav } from "@/components/patient/BottomNav";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/patient/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F2937] flex flex-col justify-between selection:bg-green-200">
      <PatientHeader />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-28">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

