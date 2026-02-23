import { useMemo } from "react";
import { useCycleCountStore } from "../Stores/CycleCountStore";
import { useUIStore } from "../Stores/UIStore";




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