

export function toDateOnlyString(date: Date | string): string {

    if (typeof date === "string") {
        return date
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`

}

export function fromDateOnlyString(value: string): Date {

    const [year, month, day] = value.split("-").map(Number)

    return new Date(year, month - 1, day)

}
export function displayDate(date: string | Date): string {
    if (typeof date === "string") {
        const [year, month, day] = date.split("-").map(Number)
        return `${day}/${month}/${year}`
    } else {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    }
}

export function addDays(date: string, days: number, skipWeekends?: boolean): string {
    const d = fromDateOnlyString(date)
    d.setDate(d.getDate() + days)
    if (skipWeekends) {
        while (d.getDay() === 0 || d.getDay() === 6) { // 0 = Sunday, 6 = Saturday
            d.setDate(d.getDate() + 1)
        }
    }
    return toDateOnlyString(d)
}

export function getDateRange(date: Date, mode: "week" | "month" | "year"): [Date, Date] {
    const start = new Date(date)
    const end = new Date(date)
    if (mode === "week") {
        const day = date.getDay()
        const diffToMonday = (day + 6) % 7 // 0 (Monday) to 6 (Sunday)
        start.setDate(date.getDate() - diffToMonday)
        end.setDate(start.getDate() + 6)
    } else if (mode === "month") {
        start.setDate(1)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0) // last day of previous month
    } else if (mode === "year") {
        start.setMonth(0, 1) // January 1st
        end.setFullYear(end.getFullYear() + 1, 0, 0) // December 31st
    }
    return [start, end]
}