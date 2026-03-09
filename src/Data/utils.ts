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