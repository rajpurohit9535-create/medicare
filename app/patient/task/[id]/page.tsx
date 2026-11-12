import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PatientTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="py-4">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/patient"
          className="p-3 rounded-2xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center min-w-[56px] min-h-[56px]"
          aria-label="Go back to Home"
        >
          <ArrowLeft className="w-8 h-8" />
        </Link>
        <h1 className="text-3xl font-extrabold text-[#1F2937]">Task Details</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 text-center">
        <p className="text-2xl font-bold text-gray-700">
          Step-by-step guidance will be wired in Phase 3.
        </p>
      </div>
    </div>
  );
}
