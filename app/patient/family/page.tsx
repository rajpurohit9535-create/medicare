"use client";

import { useState } from "react";
import Image from "next/image";
import { SpeakButton } from "@/components/patient/SpeakButton";
import {
  MapPin,
  Heart,
  Phone,
  MessageCircle,
  Home,
  Users,
  CheckCircle,
  Volume2,
  Sparkles,
} from "lucide-react";
import { speech } from "@/lib/speech";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  relationDetails: string;
  residence: string;
  avatarColor: string;
  initials: string;
  phone: string;
  presetMessages: string[];
}

const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "ravi",
    name: "Ravi Sharma",
    relation: "Your Eldest Son",
    relationDetails:
      "Ravi is your eldest son. He lives in this house with you. He manages your medicines every morning and evening, and brings you fresh jasmine flowers from the market.",
    residence: "Lives at home with you (Upstairs bedroom)",
    avatarColor: "bg-blue-600 text-white",
    initials: "RS",
    phone: "+91 98765 43210",
    presetMessages: [
      "I love you Ravi",
      "Please come sit with me",
      "Can you bring me a cup of warm water?",
    ],
  },
  {
    id: "priya",
    name: "Priya Sharma",
    relation: "Your Daughter-in-law (Ravi's Wife)",
    relationDetails:
      "Priya is Ravi's wife and your daughter-in-law. She lives here with you and takes care of the kitchen. She prepares your favorite soft idlis and filter coffee, and walks with you in the garden.",
    residence: "Lives at home with you",
    avatarColor: "bg-amber-600 text-white",
    initials: "PS",
    phone: "+91 98765 43211",
    presetMessages: [
      "Thank you for the delicious food, Priya",
      "Shall we walk in the garden?",
      "Can I have a cup of coffee?",
    ],
  },
  {
    id: "arjun",
    name: "Arjun Sharma",
    relation: "Your Grandson (Ravi & Priya's Son)",
    relationDetails:
      "Arjun is your 12-year-old grandson. He is in the 7th grade. He loves playing carrom with you on the verandah and hearing your stories about growing up in Mysuru.",
    residence: "Lives at home with you (Leaves for school at 8 AM)",
    avatarColor: "bg-emerald-600 text-white",
    initials: "AS",
    phone: "+91 98765 43212",
    presetMessages: [
      "Good luck in school today, Arjun!",
      "Let's play carrom this evening",
      "I have a story for you",
    ],
  },
  {
    id: "meera",
    name: "Meera Rao",
    relation: "Your Daughter",
    relationDetails:
      "Meera is your younger daughter. She is married to Suresh and lives in Mysuru (2 hours away). She video calls you every Sunday at 4:00 PM and visits on festivals.",
    residence: "Mysuru, Karnataka",
    avatarColor: "bg-purple-600 text-white",
    initials: "MR",
    phone: "+91 98765 43213",
    presetMessages: [
      "Thinking of you, Meera",
      "Call me on Sunday at 4",
      "Sending big hugs and blessings",
    ],
  },
];

export default function PatientFamilyPage() {
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const homeAddress = "42 Shanti Nilayam, 4th Cross, Indiranagar, Bengaluru, Karnataka 560038";

  const handleSimulateCall = (member: FamilyMember) => {
    const text = `Calling ${member.name}, ${member.relation}. Please wait...`;
    speech.speak(text);
    setCallStatus(text);
    setTimeout(() => {
      setCallStatus(null);
    }, 4500);
  };

  const handleSendMessage = (member: FamilyMember, msg: string) => {
    const speechText = `Message sent to ${member.name}: "${msg}"`;
    speech.speak(speechText);
    setSentMessage(speechText);
    setTimeout(() => {
      setSentMessage(null);
    }, 4000);
  };

  return (
    <div className="py-2 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">
            My Family &amp; Home
          </h1>
          <p className="text-lg sm:text-xl text-[#4B5563] mt-1">
            See your loved ones, how they are related, and where you live.
          </p>
        </div>
        <SpeakButton
          textToSpeak="My Family and Home. Here you can see your home address, your family photo, and who lives with you."
          size="lg"
        />
      </div>

      {/* Reassuring Callout Banner */}
      {callStatus && (
        <div className="p-4 rounded-2xl bg-green-100 border-2 border-green-500 text-green-950 font-bold text-xl flex items-center gap-3 animate-pulse">
          <Phone className="w-6 h-6 text-green-700" />
          <span>{callStatus}</span>
        </div>
      )}

      {sentMessage && (
        <div className="p-4 rounded-2xl bg-blue-100 border-2 border-blue-500 text-blue-950 font-bold text-xl flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-6 h-6 text-blue-700" />
          <span>{sentMessage}</span>
        </div>
      )}

      {/* 1. HOME ADDRESS SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#2E7D32]/25 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-[#2E7D32] flex items-center justify-center shrink-0">
              <Home className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-[#2E7D32] uppercase tracking-wider">
                Your Home Address
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] mt-0.5">
                42 Shanti Nilayam
              </h2>
            </div>
          </div>
          <SpeakButton
            textToSpeak={`Your home address is 42 Shanti Nilayam, 4th Cross, Indiranagar, Bengaluru. You live here with your son Ravi, your daughter-in-law Priya, and your grandson Arjun.`}
            size="md"
          />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {homeAddress}
              </p>
              <p className="text-sm sm:text-base text-gray-600 mt-1 font-medium">
                Near Indiranagar Metro Station &amp; Defense Colony Park
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#2E7D32] font-bold">
          <CheckCircle className="w-5 h-5" />
          <span>You are safe at home. Your family is right here with you.</span>
        </div>
      </div>

      {/* 2. FAMILY PORTRAIT / GROUP PHOTO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Our Family Photo
              </h2>
              <p className="text-sm sm:text-base text-gray-500">
                Diwali Celebration at Shanti Nilayam
              </p>
            </div>
          </div>
          <SpeakButton
            textToSpeak="This is your family portrait taken during Diwali at Shanti Nilayam. You are seated in the center wearing your green silk saree, surrounded by your son Ravi, daughter-in-law Priya, and grandson Arjun."
            size="md"
          />
        </div>

        {/* Family Portrait Illustration / Canvas Banner */}
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-200 shadow-inner bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-6 sm:p-10 flex flex-col items-center justify-center text-center">
          {/* Decorative Warm Lights Banner */}
          <div className="flex items-center gap-2 mb-4 text-amber-800 text-sm font-bold bg-white/80 px-4 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Family Reunion • Indiranagar Home</span>
          </div>

          {/* Graphical Avatars Representing the Family Together */}
          <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6 my-4">
            {/* Ravi */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-600 text-white text-2xl sm:text-3xl font-extrabold flex items-center justify-center border-4 border-white shadow-md">
                RS
              </div>
              <span className="mt-2 text-sm font-bold text-gray-800">Ravi (Son)</span>
            </div>

            {/* Amma (Center) */}
            <div className="flex flex-col items-center -translate-y-2">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#2E7D32] text-white text-3xl sm:text-4xl font-extrabold flex items-center justify-center border-4 border-amber-300 shadow-xl ring-4 ring-[#2E7D32]/20">
                AMMA
              </div>
              <span className="mt-2 text-base font-extrabold text-[#2E7D32]">You (Amma)</span>
            </div>

            {/* Priya */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-600 text-white text-2xl sm:text-3xl font-extrabold flex items-center justify-center border-4 border-white shadow-md">
                PS
              </div>
              <span className="mt-2 text-sm font-bold text-gray-800">Priya (Daughter-in-law)</span>
            </div>

            {/* Arjun */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600 text-white text-xl sm:text-2xl font-extrabold flex items-center justify-center border-4 border-white shadow-md">
                AS
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-gray-800">Arjun (Grandson)</span>
            </div>
          </div>

          <p className="text-base sm:text-lg text-amber-950 font-bold max-w-lg mt-3 leading-relaxed">
            &ldquo;A wonderful day together with sweets, smiles, and laughter in our living room.&rdquo;
          </p>
        </div>
      </div>

      {/* 3. INDIVIDUAL FAMILY MEMBERS WITH HOW THEY ARE RELATED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Who Everyone Is
          </h2>
          <SpeakButton
            textToSpeak="Here are the people in your family, who they are, and how they take care of you."
            size="md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FAMILY_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-green-300 shadow-xs transition space-y-4"
            >
              {/* Member Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-16 h-16 rounded-2xl ${member.avatarColor} font-black text-2xl flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">
                      {member.name}
                    </h3>
                    <span className="inline-block mt-0.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-green-100 text-[#2E7D32]">
                      {member.relation}
                    </span>
                  </div>
                </div>

                <SpeakButton
                  textToSpeak={`${member.name}. ${member.relation}. ${member.relationDetails}`}
                  size="md"
                />
              </div>

              {/* Exact Relation Details */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-800 text-base sm:text-lg leading-relaxed font-medium">
                {member.relationDetails}
              </div>

              {/* Where they live */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-semibold">
                <Home className="w-4 h-4 text-gray-400" />
                <span>{member.residence}</span>
              </div>

              {/* Quick Communication Buttons */}
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateCall(member)}
                  className="w-full min-h-[50px] rounded-xl bg-[#2E7D32] hover:bg-[#256629] active:scale-95 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xs cursor-pointer touch-manipulation transition"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call {member.name.split(" ")[0]}</span>
                </button>

                {/* Preset Messages Dropdown/Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {member.presetMessages.map((msg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(member, msg)}
                      className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-green-50 active:scale-95 text-xs font-semibold text-gray-700 hover:text-[#2E7D32] border border-gray-200 transition text-left cursor-pointer touch-manipulation"
                    >
                      &ldquo;{msg}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
