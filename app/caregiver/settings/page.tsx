import Link from "next/link";
import { ArrowLeft, LogOut, Users, Key } from "lucide-react";

export default function CaregiverSettingsPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Caregiver Settings</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Family & Patient Configuration</h2>
            <p className="text-sm text-gray-500">
              Manage patient contact cards, change PIN, and update home orientation address.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
            <Link
              href="/caregiver/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-sm text-gray-700 hover:bg-gray-50"
            >
              <Users className="w-4 h-4" />
              Pair Another Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
