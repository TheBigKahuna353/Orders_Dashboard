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
    dateMode: "pick" | "delivery"
    setDateMode: (mode: "pick" | "delivery") => void

    setDateRange: (range: [Date | null, Date | null]) => void
    setDeliveryFilter: (filter: Filter) => void


    // ALL TABLE SORTING
    tableSort: Record<string, PageSort>

    setTableSort: (tableId: string, column: string) => void

    resetTableSort: (tableId: string) => void


    // DASHBOARD STATE
    dashboardLayout: number

    setDashboardLayout: (layout: number) => void

    // CYCLECOUNT STATE
    cycleCountView: "latest" | "weekly" | "all"
    setCycleCountView: (view: "latest" | "weekly" | "all") => void

}

export const useUIStore = create<UIState>()(
persist(

    (set, get) => ({

        // GLOBAL FILTERS

        dateRange: [null, null],
        deliveryFilter: "All",
        dateMode: "delivery",

        setDateRange: (range) =>
            set({ dateRange: range }),

        setDeliveryFilter: (filter) =>
            set({ deliveryFilter: filter }),

        setDateMode: (mode) =>
            set({ dateMode: mode }),

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
        setDashboardLayout: (layout) => set({ dashboardLayout: layout }),

        // CYCLE COUNT VIEW
        cycleCountView: "latest",
        setCycleCountView: (view) => set({ cycleCountView: view })

    }),
    {
        name: "ui-state"
    }
))