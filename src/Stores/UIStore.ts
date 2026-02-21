import { create } from "zustand"
import { persist } from "zustand/middleware"

type SortDirection = "asc" | "desc"

type PageSort = {
    column: string | null
    direction: SortDirection
}

type UIState = {

    // GLOBAL FILTERS
    dateRange: [Date | null, Date | null]
    deliveryFilter: Filter

    setDateRange: (range: [Date | null, Date | null]) => void
    setDeliveryFilter: (filter: Filter) => void


    // ALL TABLE SORTING
    tableSort: Record<string, PageSort>

    setTableSort: (tableId: string, column: string) => void

    resetTableSort: (tableId: string) => void


    // DASHBOARD STATE
    dashboardLayout: number

    setDashboardLayout: (layout: number) => void

}

export const useUIStore = create<UIState>()(
persist(

    (set, get) => ({

        // GLOBAL FILTERS

        dateRange: [null, null],

        deliveryFilter: "All",

        setDateRange: (range) =>
            set({ dateRange: range }),

        setDeliveryFilter: (filter) =>
            set({ deliveryFilter: filter }),


        // TABLES PAGE SORT
         tableSort: {},

        setTableSort: (tableId, column) => {
        const current = get().tableSort[tableId]

        if (current?.column === column) {
            set(state => ({
                tableSort: {
                    ...state.tableSort,
                    [tableId]: {
                        column,
                        direction:
                            current.direction === "asc" ? "desc" : "asc"
                    }
                }
            }))
        } else {
            set(state => ({
                tableSort: {
                    ...state.tableSort,
                    [tableId]: {
                        column,
                        direction: "asc"
                    }
                }
            }))
        }
    },
    resetTableSort: (tableId) =>
        set(state => ({
            tableSort: {
                ...state.tableSort,
                [tableId]: {
                    column: null,
                    direction: "asc"
                }
            }
        })),

        // DASHBOARD LAYOUT
        dashboardLayout: 0,
        setDashboardLayout: (layout) => set({ dashboardLayout: layout })
    }),
    {
        name: "ui-state"
    }
))