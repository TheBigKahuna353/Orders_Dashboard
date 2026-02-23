import { fromDateOnlyString } from "./Dates";

export function subtractWorkDays(startDate: Date, daysToSubtract: number): Date {
  if (typeof startDate === 'string') {
    startDate = fromDateOnlyString(startDate)
    console.warn("subtractWorkDays received a string instead of a Date object:", startDate)
  }
  const newDate = new Date(startDate.getTime());
  let daysSubtracted = 0;

  while (daysSubtracted < daysToSubtract) {
    newDate.setDate(newDate.getDate() - 1); // Subtract one calendar day
    const dayOfWeek = newDate.getDay();

    // Check if the current day is a weekday (Monday=1, ..., Friday=5)
    // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysSubtracted++;
    }
  }

  return newDate;
}