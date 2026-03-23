import { useOrdersStore } from "../Stores/OrdersStore"
import { filterOrder, getPickDate } from "../Data/filter"
import { fromDateOnlyString, toDateOnlyString } from "../Data/Dates"

export function useDailySummary(month: number, year: number, showBulk: boolean) {

    const { groupedOrders } = useOrdersStore()

    const map = new Map<string, DailySummary>()
    let parentOrders = 0

    for (const group of groupedOrders) {
        if (group.status === "held") {
            continue;
        }
        const date = toDateOnlyString(getPickDate(group.customer, fromDateOnlyString(group.deliverDate)));
        if (!date || isNaN(fromDateOnlyString(date).getTime())) {
            console.warn("Invalid date:", group, date);
            continue;
        }
        // Only include orders for the selected month and year
        const orderDate = fromDateOnlyString(date);
        if (orderDate.getMonth() !== month || orderDate.getFullYear() !== year) {
            continue;
        }

        if (!map.has(date)) {
            map.set(date, {
                date: fromDateOnlyString(date),
                metro: { orders: 0, pallets: 0, weight: 0, cube: 0 },
                outOfTown: { orders: 0, pallets: 0, weight: 0, cube: 0 },
                dispatch: { orders: 0, pallets: 0, weight: 0, cube: 0 },
                bulk: { woolworths: 0, foodstuffsDunedin: 0, foodstuffsChristchurch: 0 }
            });
        }
        const entry = map.get(date)!;

        // Bulk logic
        const isWoolworths = group.customer.toLowerCase().includes("woolworths");
        const isFSDunedin = group.customer.toLowerCase().includes("foodstuffs") && group.city.toLowerCase().includes("dunedin");
        const isFSChristchurch = group.customer.toLowerCase().includes("foodstuffs") && group.city.toLowerCase().includes("christchurch");
        const isBulk = isWoolworths || isFSDunedin || isFSChristchurch;

        if (isBulk && showBulk) {
            if (isWoolworths) entry.bulk.woolworths += group.totalPallets;
            if (isFSDunedin) entry.bulk.foodstuffsDunedin += group.totalPallets;
            if (isFSChristchurch) entry.bulk.foodstuffsChristchurch += group.totalPallets;
        } else if (filterOrder(group.city, group.customer, 'All Locals')) {
            entry.metro.orders += group.orders.length;
            entry.metro.pallets += group.totalPallets;
            entry.metro.weight += group.totalWeight;
            entry.metro.cube += group.totalVolume;
        } else if (filterOrder(group.city, group.customer, 'All Out of Town')) {
            entry.outOfTown.orders += group.orders.length;
            entry.outOfTown.pallets += group.totalPallets;
            entry.outOfTown.weight += group.totalWeight;
            entry.outOfTown.cube += group.totalVolume;
        }
        entry.dispatch.orders += group.orders.length;
        entry.dispatch.pallets += group.totalPallets;
        entry.dispatch.weight += group.totalWeight;
        entry.dispatch.cube += group.totalVolume;
        parentOrders += 1;
    }

    return {
        data: Array.from(map.values())
            .sort((a, b) => a.date.getTime() - b.date.getTime()),
        parentOrders
    }

}