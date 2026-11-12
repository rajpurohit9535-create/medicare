import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function CaregiverTasksPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/caregiver"
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
              <p className="text-sm text-gray-500">
                Plan daily routines, dosage notes, and step-by-step guidance.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E7D32] text-white text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Task
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500">
          <p className="text-base font-semibold">
            Caregiver Task Management will be fully built in Phase 2.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Includes starter templates, repeat days, icon picker, and live patient preview.
          </p>
        </div>
      </div>
    </div>
  );
}
