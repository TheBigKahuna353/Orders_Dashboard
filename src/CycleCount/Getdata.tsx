import { useMemo } from "react";
import { useCycleCountStore } from "../Stores/CycleCountStore";
import { useUIStore } from "../Stores/UIStore";
import { fromDateOnlyString, toDateOnlyString } from "../Data/Dates";




export default function useSortedData(tableId: string) {
    const { recordMaster } = useCycleCountStore()
    const data = Object.values(recordMaster)
    const { tableSort } = useUIStore()
    const sort = tableSort[tableId]
    return useMemo(() => {
        if (!sort || !sort.column) return data
        const sorted = [...data].sort((a, b) => {
            let valA: string | number = a[sort.column as keyof CycleCountRecord] as string | number
            let valB: string | number = b[sort.column as keyof CycleCountRecord] as string | number
            if (typeof valA === "string") valA = valA.toLowerCase()
            if (typeof valB === "string") valB = valB.toLowerCase()
            if (valA === undefined || valB === undefined) return 0
            if (valA < valB) return sort.direction === "asc" ? -1 : 1
            if (valA > valB) return sort.direction === "asc" ? 1 : -1
            return 0
        })
        return sorted
    }, [data, sort])
}

export function useWeeklyData() {
    const { recordMaster } = useCycleCountStore()
    const data = Object.values(recordMaster)
    return useMemo(() => {
        const weeklyData: Record<string, WeeklyCycleCountSummary> = {}
        for (const record of data) {
            const date = record.countDate // this is weekEnd in toDateOnlyString format
            const weekStart = toDateOnlyString(new Date(fromDateOnlyString(date).getTime() - 6 * 24 * 60 * 60 * 1000)) // calculate weekStart as 6 days before
            const key = `${weekStart} - ${date}`
            if (!weeklyData[key]) {
                weeklyData[key] = {
                    countDate: weekStart,
                    pallets: 0,
                    cases: 0,
                    palletsVariance: 0,
                    casesVariance: 0
                }
            }
            weeklyData[key].pallets += record.pallets
            weeklyData[key].cases += record.cases
            weeklyData[key].palletsVariance += record.palletsVariance
            weeklyData[key].casesVariance += record.casesVariance
        }
        return Object.values(weeklyData)
    }, [data])
}