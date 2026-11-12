"use client";

import { AlertTriangle, LifeBuoy, Clock, CheckCircle } from "lucide-react";

export interface AlertItem {
  id: string;
  patient_id: string;
  type: "help" | "missed_task" | "inactive";
  message: string | null;
  created_at: string;
  resolved_at: string | null;
}

interface AlertBannerProps {
  alert: AlertItem;
  patientName?: string;
  onResolve: (alertId: string) => void;
}

export function AlertBanner({
  alert,
  patientName = "Patient",
  onResolve,
}: AlertBannerProps) {
  const isHelp = alert.type === "help";

  return (
    <div
      role="alert"
      className={`p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border-2 ${
        isHelp
          ? "bg-red-50 border-red-400 text-red-950"
          : "bg-amber-50 border-amber-300 text-amber-950"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            isHelp ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"
          }`}
        >
          {isHelp ? (
            <LifeBuoy className="w-7 h-7 stroke-[2.5]" />
          ) : (
            <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
          )}
        </div>
        <div>
          <h4 className="text-lg font-bold">
            {isHelp
              ? `EMERGENCY HELP REQUESTED: ${patientName}`
              : `MISSED TASK ALERT: ${patientName}`}
          </h4>
          <p className="text-sm font-medium mt-0.5 opacity-90">
            {alert.message ||
              (isHelp
                ? "The patient pressed the I Need Help button."
                : "A scheduled task was not marked done on time.")}
          </p>
          <div className="flex items-center gap-1 text-xs opacity-75 mt-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onResolve(alert.id)}
        className={`px-5 py-2.5 rounded-xl font-bold text-sm shrink-0 flex items-center gap-2 shadow-sm transition ${
          isHelp
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-amber-600 hover:bg-amber-700 text-white"
        }`}
      >
        <CheckCircle className="w-4 h-4" />
        Mark Resolved
      </button>
    </div>
  );
}
