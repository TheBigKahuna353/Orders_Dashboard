import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DASHBOARD_LAYOUTS } from "../Layout/Layouts"

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
    dashboardLayout: DashboardWidget[]
    setDashboardLayout: (layout: DashboardWidget[]) => void
    addWidget: (type: WIDGET_NAMES) => void
    removeWidget: (widgetId: string) => void
    resizeWidget: (widgetId: string, w: number, h: number) => void
    moveWidget: (widgetId: string, newCol: number, newRow: number) => void

    // CYCLECOUNT STATE
    cycleCountView: "latest" | "weekly" | "all"
    setCycleCountView: (view: "latest" | "weekly" | "all") => void

}



function findPosition(widgets: DashboardWidget[], newWidget: DashboardWidget) {


  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {

      const fits = !widgets.some(w =>
        col < w.col + w.colSpan &&
        col + newWidget.colSpan > w.col &&
        row < w.row + w.rowSpan &&
        row + newWidget.rowSpan > w.row
      )

      if (fits) {
        return { col, row }
      }
    }
    
  }
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
        dashboardLayout: DASHBOARD_LAYOUTS[0], // default to first layout
        setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
        addWidget: (type) => set(state => {
            const pos = findPosition(state.dashboardLayout, { id: '', type, col: 0, row: 0, colSpan: 1, rowSpan: 1 })
            if (!pos) {
                alert("No space to add new widget! Please rearrange or remove existing widgets.")
                return {};
            }
            const newWidget: DashboardWidget = {
                id: crypto.randomUUID(),
                type,
                col: pos?.col || 0,
                row: pos?.row || 0,
                colSpan: 1,
                rowSpan: 1
            };
            return { dashboardLayout: [...state.dashboardLayout, newWidget] };
        }),
        removeWidget: (widgetId) => set(state => ({ dashboardLayout: state.dashboardLayout.filter(w => w.id !== widgetId) })),
        resizeWidget: (widgetId, w, h) => set(state => ({
            dashboardLayout: state.dashboardLayout.map(wid => 
                wid.id === widgetId ? { ...wid, colSpan: w || 1, rowSpan: h || 1 } : wid
            )
        })),
        moveWidget: (widgetId, newCol, newRow) => set(state => ({
            dashboardLayout: state.dashboardLayout.map(wid =>
                wid.id === widgetId ? { ...wid, col: newCol, row: newRow } : wid
            )
        })),

        // CYCLE COUNT VIEW
        cycleCountView: "latest",
        setCycleCountView: (view) => set({ cycleCountView: view })

    }),
    {
        name: "ui-state",
        onRehydrateStorage: () => (state) => {
            if (!state) return
            if (typeof state.dashboardLayout === "number") {
                state.dashboardLayout = DASHBOARD_LAYOUTS[state.dashboardLayout] || DASHBOARD_LAYOUTS[0]
            }
        }
    }
))