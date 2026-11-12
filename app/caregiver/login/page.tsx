"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Heart, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function CaregiverLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setError(signInError.message || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Check user role
      const user = data.user;
      const role =
        user?.app_metadata?.role || user?.user_metadata?.role;

      if (role && role !== "caregiver") {
        await supabase.auth.signOut();
        setError("This account is not registered as a caregiver.");
        setIsLoading(false);
        return;
      }

      // Check if caregiver has any linked patient
      const { data: links } = await supabase
        .from("caregiver_patients")
        .select("patient_id")
        .eq("caregiver_id", user?.id)
        .limit(1);

      if (!links || links.length === 0) {
        router.push("/caregiver/onboarding");
      } else {
        router.push("/caregiver");
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D32] flex items-center justify-center text-white shadow-sm">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#1F2937]">
            CareCompanion
          </span>
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-[#1F2937]">
          Caregiver Sign In
        </h1>
        <p className="mt-2 text-center text-sm text-[#4B5563]">
          Manage and monitor your loved one&apos;s daily routine with calm confidence.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-[#E5E7EB] sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#374151]"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="caregiver@example.com"
                  className="block w-full pl-11 pr-3.5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] text-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#374151]"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-3.5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] text-sm text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-[#2E7D32] hover:bg-[#256629] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E7D32] transition disabled:opacity-50"
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3 text-center text-sm">
            <p className="text-gray-600">
              New caregiver?{" "}
              <Link
                href="/caregiver/signup"
                className="font-semibold text-[#2E7D32] hover:underline"
              >
                Create your account
              </Link>
            </p>
            <p className="text-gray-500 text-xs">
              Setting up a patient device?{" "}
              <Link
                href="/patient/login"
                className="font-medium text-gray-700 hover:text-black underline"
              >
                Open Patient Mode
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
