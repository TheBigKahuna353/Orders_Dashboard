import { useMemo } from "react";
import { useOrdersStore } from "../Stores/OrdersStore";
import { filterOrder } from "./filter";
import { useUIStore } from "../Stores/UIStore";


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
          status: "finished",
          palletsVarience: 0,
          deliverDate: order.deliverDate,
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

    // Some orders are small enough to be added to existing pallets
    // but they still say 1 pallet. To reflect this, we calculate the varience
    // which is the range the pallets could be in.
    // this is calculated as num of orders that have 1 pallet - 1 if all orders have 1 pallet
    if (group.orders.length > 1) {
        group.palletsVarience! = 0;
        for (const o of group.orders) {
            if (o.pallets === 1 && o.status !== "finished") {
                group.palletsVarience! += 1;
            }
        }
    }

    if (order.status !== "finished") {
        group.status = "picking"
      }
  }

  return Array.from(groups.values())
}

function filterOrders(
    orders: GroupedOrder[],
    locations: Record<string, number>,
    options: {
        filter?: Filter | null
        location?: number | null
        dateRange?: [Date | null, Date | null]
    }
): GroupedOrder[] {

    const { filter, location, dateRange } = options

    const start = dateRange?.[0]
    const end = dateRange?.[1]

    return orders.filter(order => {

        // type filter
        if (filter && !filterOrder(order, filter))
            return false

        // location filter
        if (location !== null &&
            location !== undefined &&
            locations[order.groupId] !== location)
            return false

        // workload date filter
        if (start || end) {

            const d = new Date(order.deliverDate)

            if (start && d < start)
                return false

            if (end && d > end)
                return false
        }

        return true

    })
}

export function useFilteredOrders(
    location?: number | null
) {

    const groupedOrders =
        useOrdersStore(s => s.groupedOrders)

    const locations =
        useOrdersStore(s => s.locations)

    const filter =
        useUIStore(s => s.deliveryFilter)

    const dateRange =
        useUIStore(s => s.dateRange)

    return useMemo(() =>
        filterOrders(groupedOrders, locations, {
            filter,
            location,
            dateRange
        }),
        [groupedOrders, locations, filter, location, dateRange]
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
    location?: number | null
) {

    const filtered =
        useFilteredOrders(location)

    const sorted =
        useSortedOrders(filtered, tableId)

    return sorted
}