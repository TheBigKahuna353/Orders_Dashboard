

export function toDateOnlyString(date: Date): string {

    if (typeof date === "string") {
        console.warn("toDateOnlyString received a string instead of a Date object:", date)
        date = new Date(date)
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
export function displayDate(date: string): string {
    const [year, month, day] = date.split("-").map(Number)
    return `${day}/${month}/${year}`
}