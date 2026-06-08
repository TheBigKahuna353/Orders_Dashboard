import { fromDateOnlyString, toDateOnlyString } from "./Dates";

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
    const month = newDate.getMonth() + 1; // getMonth is zero-based
    const date = newDate.getDate();

    // Check if the current day is a weekday (Monday=1, ..., Friday=5)
    // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // public holidays
      if (!isPublicHoliday(month, date)) {
        // It's a public holiday, do not count this day
        daysSubtracted++;
      }
    }
  }
   
  return newDate;
}

function isPublicHoliday(month: number, day: number): boolean {
  // Define public holidays (example dates)
  const publicHolidays = [
    { month: 2, day: 6 }, // Waitangi Day
    { month: 4, day: 25 }, // ANZAC Day
    { month: 4, day: 3 }, // Easter Friday
    { month: 4, day: 6 }, // Easter Monday
  ];

  return publicHolidays.some(holiday => holiday.month === month && holiday.day === day);
}

export function deriveStatus(comments: string, shipmentNo: string, DeliverStatus: string, held?: boolean): 'picking' | 'held' | 'ready' | 'dispatched' | 'delivered' {

  if (DeliverStatus === "DELIVERED")
    return "delivered"

  if (DeliverStatus === "DISPATCHED" || shipmentNo)
    return "dispatched"

  if (comments)
    return "ready"

  if (held)
    return "held"

  return "picking"
}

export function Capitalize(str:string): string {
  if (!str) return ""; // Handle empty or null strings safely
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function AcceptsBackorders(customer: string): boolean {
  // All chemist warehouses, Bargain Chemist, Foodstuffs and Woolworths dont accept backorders, so we can exclude them
  const keywords = ["Chemist", "CHEMIST", "CW", "Bargain", "BARGAIN", "BC", "foodstuffs", "Woolworths", "Trents"]
  return !keywords.some(keyword => customer.includes(keyword))
}


export function displayLongText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

function slugifyForUrl(s: string): string {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function safeDatePart(dateStr: string): string {
  if (!dateStr) return ""
  const parts = dateStr.split("/")
  let d: Date
  if (parts.length === 3 && parts[0].length <= 2 && parts.every(p => /^\d+$/.test(p))) {
    const [day, month, year] = parts.map(Number)
    d = new Date(year, month - 1, day)
  } else {
    d = new Date(dateStr)
  }
  if (!isNaN(d.getTime())) return toDateOnlyString(d)
  return dateStr
}

export function makeGroupId(customer: string, deliverDate: string): string {
  const customerPart = slugifyForUrl(customer || "unknown")
  const datePart = slugifyForUrl(safeDatePart(deliverDate) || "")
  return datePart ? `${customerPart}-${datePart}` : customerPart
}