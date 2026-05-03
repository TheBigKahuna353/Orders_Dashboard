

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