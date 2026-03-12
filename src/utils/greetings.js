const GREETINGS = [
  "Good Morning",
  "Good Afternoon",
  "Good Evening",
];

/**
 * Returns a greeting based on the provided hour.
 * If no hour is provided, it uses the current time.
 */
export function getGreeting(hour = new Date().getHours()) {
  if (hour < 12) return GREETINGS[0];
  if (hour < 18) return GREETINGS[1];
  return GREETINGS[2];
}
