import { useMemo } from "react";
import { useOrdersStore } from "../Stores/OrdersStore";
import { filterOrder, getPickDate } from "./filter";
import { useUIStore } from "../Stores/UIStore";
import { getDateRange, toDateOnlyString } from "./Dates";



export default function groupOrders(orders: Order[]): GroupedOrder[] {
  const groups = new Map<string, GroupedOrder>()

    for (const order of orders) {
      // create group if it doesn't exist
      if (!groups.has(order.groupId)) {
        groups.set(order.groupId, {
        groupId: order.groupId,
        customer: order.customer,
        city: order.city,
        orders: [],
        totalPallets: 0,
        totalWeight: 0,
        totalVolume: 0,
        status: order.status,
        palletsVariance: 0,
        deliverDate: order.deliverDate,
        pickupType: order.pickupType,
        searchableString: `${order.customer} ${order.deliveryNo}`.toLowerCase(),
        PO: order.PO,
        })
      }

    function round(num: number, fractionDigits: number): number {
          return Number(num.toFixed(fractionDigits));
      }

    const group = groups.get(order.groupId)!

    group.orders.push(order)
    group.totalPallets += order.pallets
    group.totalWeight = round(group.totalWeight + order.weight, 2)
    group.totalVolume = round(group.totalVolume + order.volume, 2)

    

    if (order.status === "picking") {
        group.status = "picking"
      }
  }

  return Array.from(groups.values())
}

function filterOrders(
    orders: GroupedOrder[],
    options: {
        filter?: Filter | null
        dateRange?: [Date | null, Date | null]
        dateMode?: "delivery" | "pick"
        extraFilter?: (order: GroupedOrder) => boolean
    }
): GroupedOrder[] {

    const { filter, dateRange, dateMode, extraFilter } = options

    const start = dateRange?.[0] ? toDateOnlyString(dateRange[0]) : undefined
    const end = dateRange?.[1] ? toDateOnlyString(dateRange[1]) : undefined

    const filtered = orders.filter(order => {

        // type filter
        if (filter && !filterOrder(order.city, order.customer, filter))
            return false

        // extra filter
        if (extraFilter && !extraFilter(order))
            return false

        // workload date filter
        if (start || end) {
            const d = dateMode === "pick" ? toDateOnlyString(getPickDate(
                order.customer, 
                order.deliverDate))
                 : order.deliverDate
            if (start && d < start) {
                console.log("filtered out by start date", order.groupId, d, start)
                return false
            }

            if (end && d > end) {
                console.log("filtered out by end date", order.groupId, d, end)
                return false
            }
        }
        return true
    })
    return filtered
}

export function useFilteredOrders(
    extraFilter?: (order: GroupedOrder) => boolean,
) {

    const groupedOrders = useOrdersStore(s => s.groupedOrders)

    const filter = useUIStore(s => s.deliveryFilter)

    const dateRange = useUIStore(s => s.dateRange)
    
    const dateMode = useUIStore(s => s.dateMode)

    return useMemo(() =>
        filterOrders(groupedOrders, {
            filter,
            dateRange,
            dateMode,
            extraFilter
        }),
        [groupedOrders, filter, dateRange, dateMode, extraFilter]
    )
}

type Sort = {
    column: string | null
    direction: "asc" | "desc"
}

function sortOrders(
    orders: GroupedOrder[],
    sort: Sort | null
): GroupedOrder[] {
    if (!sort || !sort.column) return orders
    const sorted = [...orders].sort((a, b) => {
        let valA: string | number = a[sort.column as keyof GroupedOrder] as string | number
        let valB: string | number = b[sort.column as keyof GroupedOrder] as string | number
        if (typeof valA === "string") valA = valA.toLowerCase()
        if (typeof valB === "string") valB = valB.toLowerCase()
        if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
            valA = Number(valA)
            valB = Number(valB)
        }
        if (valA === undefined || valB === undefined) return 0
        if (valA < valB) return sort.direction === "asc" ? -1 : 1
        if (valA > valB) return sort.direction === "asc" ? 1 : -1
        return 0
    })
    return sorted
}

export function useSortedOrders(
    orders: GroupedOrder[],
    tableId: string
) {

    const sort =
        useUIStore(s => s.tableSort[tableId])

    return useMemo(() =>
        sortOrders(orders, sort),
        [orders, sort]
    )
}

export function useVisibleOrders(
    tableId: string,
    extraFilter?: (order: GroupedOrder) => boolean
) {

    const filtered =
        useFilteredOrders(extraFilter)

    const sorted =
        useSortedOrders(filtered, tableId)

    return sorted
}

export function useCustomOrders(
    tableId: string,
    settings: WidgetSettings,
    extraFilter: (order: GroupedOrder) => boolean
) {
    const dateRange: [Date | null, Date | null] | undefined =
                        settings.range === "all" ?       undefined : 
                        settings.range === "today" ?     [new Date(), new Date()] : 
                        /* settings.range === "week" */  getDateRange(new Date(), 'week')

    const groupedOrders = useOrdersStore(s => s.groupedOrders)
    
    const filtered = filterOrders(groupedOrders, { dateRange, extraFilter, dateMode: settings.dateMode })

    const sorted = useSortedOrders(filtered, tableId)

    return sorted
}