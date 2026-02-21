// Stores/UIStore.ts

import { create } from "zustand"

type SortDirection = "asc" | "desc"

type UIState = {

    dateRange: [Date | null, Date | null]

    orderFilter: Filter

    sortBy: string | null
    sortDirection: SortDirection

    setDateRange: (range: [Date | null, Date | null]) => void

    setOrderFilter: (filter: Filter) => void

    setSort: (column: string) => void

}

export const useUIStore = create<UIState>((set, get) => ({

    dateRange: [null, null],

    orderFilter: "All",

    sortBy: null,
    sortDirection: "asc",

    setDateRange: (range) =>
        set({ dateRange: range }),

    setOrderFilter: (filter) =>
        set({ orderFilter: filter }),

    setSort: (column) => {

        const current = get()

        if (current.sortBy === column) {

            set({
                sortDirection:
                    current.sortDirection === "asc"
                        ? "desc"
                        : "asc"
            })

        } else {

            set({
                sortBy: column,
                sortDirection: "asc"
            })

        }
    }

}))