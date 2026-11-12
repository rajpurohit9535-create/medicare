import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CaregiverMessagesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/caregiver"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Patient Messages</h1>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500">
          <p className="text-base font-semibold">
            Caregiver messaging thread and preset replies will be built in Phase 5.
          </p>
        </div>
      </div>
    </div>
  );
}

