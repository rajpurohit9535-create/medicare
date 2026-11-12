import { Volume2 } from "lucide-react";
import { SpeakButton } from "@/components/patient/SpeakButton";

export default function PatientTodayTimelinePage() {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">
            Today&apos;s Plan
          </h1>
          <p className="text-xl text-[#4B5563] mt-1">
            Your full daily routine at a glance.
          </p>
        </div>
        <SpeakButton textToSpeak="Today's Plan. Here is your full daily routine." size="lg" />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 text-center">
        <p className="text-2xl font-bold text-gray-700">
          Daily Routine Timeline will be rendered in Phase 3.
        </p>
      </div>
    </div>
  );
}
