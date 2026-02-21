import { useOrdersStore } from "../Stores/OrdersStore"
import { filterOrder } from "../Data/filter"

export function useDailySummary() {

    const { groupedOrders } = useOrdersStore()

    const map = new Map<string, DailySummary>()


    for (const group of groupedOrders) {

        const date = group.pickDate

        if (!map.has(date)) {
            map.set(date, {
                date: new Date(date),
                metro: { orders: 0, pallets: 0, weight: 0, cube: 0 },
                outOfTown: { orders: 0, pallets: 0, weight: 0, cube: 0 },
                dispatch: { orders: 0, pallets: 0, weight: 0, cube: 0 }
            })
        }

        const entry = map.get(date)!
        
        if (filterOrder(group.city, group.customer, 'All Locals')) {
            entry.metro.orders += group.orders.length
            entry.metro.pallets += group.totalPallets
            entry.metro.weight += group.totalWeight
            entry.metro.cube += group.totalVolume
        } else if (filterOrder(group.city, group.customer, 'All Out of Town')) {
            entry.outOfTown.orders += group.orders.length
            entry.outOfTown.pallets += group.totalPallets
            entry.outOfTown.weight += group.totalWeight
            entry.outOfTown.cube += group.totalVolume
        }
        entry.dispatch.orders += group.orders.length
        entry.dispatch.pallets += group.totalPallets
        entry.dispatch.weight += group.totalWeight
        entry.dispatch.cube += group.totalVolume
    }

    return Array.from(map.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime())

}