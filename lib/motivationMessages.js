const NOTES = {
  gained: [
    "Oops, we took a scenic route! Next week is yours!",
    "The scale went the wrong way — no worries, you've got this!",
    "Small detour! Tomorrow's a fresh start.",
  ],
  flat: [
    "Same as last week — the scale is napping!",
    "Holding steady — you're just warming up!",
    "No change yet — patience, grasshopper!",
  ],
  atStartFlat: [
    "Still at your start weight — ready to make your first move?",
    "You're at baseline — time to take a step!",
    "The journey begins with one change!",
  ],
  flatMultiWeek: [
    "Same weight for multiple weeks — time to shake things up!",
    "The scale's stuck — let's try something new!",
    "Plateau alert! A small change can make a big difference.",
  ],
  progress: [
    "You're crushing it! The scale is moving your way!",
    "Look at you go! Down, down, down — love to see it!",
    "On a roll! Keep that momentum going!",
  ],
};

const SUGGESTIONS = {
  gained: [
    ["Try smaller portions", "Walk 10 more minutes", "Swap sugary drinks for water"],
    ["Add an extra walk", "Watch the snacks", "More veggies, less treats"],
    ["Portion control", "Stay hydrated", "Move a little more"],
  ],
  flat: [
    ["Switch up your routine", "Check sleep and stress", "Plateaus break!"],
    ["Try a new activity", "Review eating pattern", "Keep going!"],
    ["Change one habit this week", "Sleep matters", "Plateaus are temporary!"],
  ],
  atStartFlat: [
    ["Start with a 10-min walk", "Set a tiny goal", "Log what you eat"],
    ["Add one extra serving of veggies", "Cut one sugary drink", "Take the stairs"],
    ["Walk 5 more minutes", "Drink water before meals", "Pick one habit"],
  ],
  flatMultiWeek: [
    ["Try a different workout", "Track portions", "Mix up meal times"],
    ["Add 15 extra minutes of activity", "Review weekend eating", "New challenge"],
    ["Change one major habit", "Get extra sleep", "Reduce stress"],
  ],
  progress: [
    ["Keep your routine — it's working!", "Stay hydrated", "Celebrate small wins"],
    ["Same habits, same results", "Add movement if you feel like it", "Rest helps"],
    ["Consistency wins", "Don't rush it", "Great habits!"],
  ],
};

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function getMotivationMessage(userId, type, weightKey = '') {
  if (!userId || !type) return null;
  const arr = NOTES[type];
  const suggestionsArr = SUGGESTIONS[type];
  if (!arr || !suggestionsArr) return null;
  const key = `${userId}_${type}_${weightKey}`;
  const idx = hashString(key) % arr.length;
  return { note: arr[idx], suggestions: suggestionsArr[idx] };
}
