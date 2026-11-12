import { Check, Clock, AlertTriangle } from "lucide-react";

interface StatusChipProps {
  status: "pending" | "done" | "snoozed" | "missed";
  isPatientView?: boolean;
  className?: string;
}

export function StatusChip({
  status,
  isPatientView = false,
  className = "",
}: StatusChipProps) {
  if (status === "done") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-bold bg-green-100 text-green-800 ${className}`}
      >
        <Check className="w-5 h-5 stroke-[2.5]" />
        Done
      </span>
    );
  }

  if (status === "snoozed") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-bold bg-amber-100 text-amber-800 ${className}`}
      >
        <Clock className="w-5 h-5" />
        {isPatientView ? "Remind later" : "Snoozed"}
      </span>
    );
  }

  if (status === "missed") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-bold ${
          isPatientView
            ? "bg-amber-100 text-amber-900"
            : "bg-red-100 text-red-800"
        } ${className}`}
      >
        <AlertTriangle className="w-5 h-5" />
        {isPatientView ? "Still to do" : "Missed"}
      </span>
    );
  }

  // Pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-medium bg-gray-100 text-gray-700 ${className}`}
    >
      <Clock className="w-5 h-5" />
      Upcoming
    </span>
  );
}
