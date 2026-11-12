import { SpeakButton } from "@/components/patient/SpeakButton";

export default function PatientFamilyPage() {
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">
            Talk to Family
          </h1>
          <p className="text-xl text-[#4B5563] mt-1">
            Call or send quick messages to your loved ones.
          </p>
        </div>
        <SpeakButton textToSpeak="Talk to Family. Tap to call or send a message." size="lg" />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 text-center">
        <p className="text-2xl font-bold text-gray-700">
          Preset one-tap messages and family photo contacts will be built in Phase 5.
        </p>
      </div>
    </div>
  );
}
