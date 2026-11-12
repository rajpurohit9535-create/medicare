export interface StarterTemplate {
  id: string;
  title: string;
  icon: string;
  category: "medicine" | "meal" | "hygiene" | "activity" | "rest" | "social" | "general";
  time_of_day: string;
  repeat_days: number[];
  steps: string[];
  caregiver_note: string;
  encouragement: string;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "morning-tablet",
    title: "Take morning tablet",
    icon: "pill",
    category: "medicine",
    time_of_day: "08:00",
    repeat_days: [1, 2, 3, 4, 5, 6, 7],
    steps: [
      "Take the white tablet from the morning box",
      "Drink a full glass of water",
    ],
    caregiver_note: "Tablet is in the blue Monday pill box on the kitchen counter.",
    encouragement: "Keeping your body healthy and strong!",
  },
  {
    id: "breakfast",
    title: "Breakfast",
    icon: "utensils",
    category: "meal",
    time_of_day: "08:30",
    repeat_days: [1, 2, 3, 4, 5, 6, 7],
    steps: [
      "Sit at the dining table",
      "Enjoy your warm breakfast and chutney",
      "Drink warm milk",
    ],
    caregiver_note: "Breakfast is kept warm under the cover on the dining table.",
    encouragement: "Enjoy your food, Amma.",
  },
  {
    id: "drink-water",
    title: "Drink a glass of water",
    icon: "droplet",
    category: "hygiene",
    time_of_day: "11:00",
    repeat_days: [1, 2, 3, 4, 5, 6, 7],
    steps: [
      "Pour a fresh glass of water from the jug",
      "Drink it slowly while sitting down",
    ],
    caregiver_note: "The copper water jug is filled on the dining table.",
    encouragement: "Staying hydrated keeps your mind fresh and calm.",
  },
  {
    id: "lunch",
    title: "Lunch",
    icon: "utensils",
    category: "meal",
    time_of_day: "13:00",
    repeat_days: [1, 2, 3, 4, 5, 6, 7],
    steps: [
      "Wash hands with soap and water",
      "Have warm rice, dal, and cooked vegetables",
      "Drink water",
    ],
    caregiver_note: "Food is ready in the casserole on the kitchen table.",
    encouragement: "Eat at your own calm pace, Amma.",
  },
  {
    id: "afternoon-rest",
    title: "Afternoon rest",
    icon: "bed",
    category: "rest",
    time_of_day: "14:30",
    repeat_days: [1, 2, 3, 4, 5, 6, 7],
    steps: [
      "Lie down comfortably in your quiet bedroom",
      "Close your eyes and rest for 45 minutes",
    ],
    caregiver_note: "Curtains are drawn for soothing soft light.",
    encouragement: "Rest well, you have had a lovely morning.",
  },
  {
    id: "evening-walk",
    title: "Gentle evening walk",
    icon: "walk",
    category: "activity",
    time_of_day: "16:30",
    repeat_days: [1, 2, 3, 4, 5, 6, 7],
    steps: [
      "Put on your comfortable walking shoes",
      "Walk 5 calm rounds in the garden",
      "Sit on the garden bench",
    ],
    caregiver_note: "Walking stick is by the front entrance.",
    encouragement: "The cool evening air will feel refreshing.",
  },
  {
    id: "dinner",
    title: "Dinner",
    icon: "utensils",
    category: "meal",
    time_of_day: "19:30",
    repeat_days: [1, 2, 3, 4, 5, 6, 7],
    steps: [
      "Sit at the dining table",
      "Enjoy a light dinner",
      "Drink a warm glass of water",
    ],
    caregiver_note: "Dinner is ready on the table.",
    encouragement: "Well done today, Amma.",
  },
  {
    id: "bedtime",
    title: "Bedtime & night routine",
    icon: "bed",
    category: "rest",
    time_of_day: "21:30",
    repeat_days: [1, 2, 3, 4, 5, 6, 7],
    steps: [
      "Brush teeth gently",
      "Change into soft nightclothes",
      "Get into bed and pull the blanket",
    ],
    caregiver_note: "Night lamp is switched on beside the bed.",
    encouragement: "Sleep peacefully. You are safe and your family is with you.",
  },
];

