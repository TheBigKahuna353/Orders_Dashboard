import { useMemo } from "react"
import { useOrdersStore } from "../Stores/OrdersStore"
import { getPickDate } from "../Data/filter"
import { fromDateOnlyString, toDateOnlyString } from "../Data/Dates"


export function usePickupPlans(day: Date): { pickupPlans: { order: GroupedOrder, plan: PickupPlan }[], groupedByTime: Record<string, { order: GroupedOrder, plan: PickupPlan }[]> } {
    const { pickupPlans, groupedOrders } = useOrdersStore()

    return useMemo(() => {
        const pickupPlansForDay = groupedOrders.filter(o => {
            const pickDate = getPickDate(o.customer, o.deliverDate) as Date
            if (pickupPlans[o.groupId] !== undefined) { 
                return fromDateOnlyString(pickupPlans[o.groupId].date).getTime() === day.getTime() // if plan exists, only include if for the selected day
            }
            if (pickDate.getTime() !== day.getTime()) return false // filter to orders for the selected day
            if (o.pickupType !== "delivery") return false // only include delivery orders
            return true
        }).map(o => ({
            order: o,
            plan: pickupPlans[o.groupId] || { groupId: o.groupId, date: toDateOnlyString(day), pickupTime: null, dispatchLane: null }
        }))

        // sort by pickup time, then by pallets for those without a pickup time
        pickupPlansForDay.sort((a, b) => {
            if (a.plan.pickupTime && b.plan.pickupTime) {
                return a.plan.pickupTime.localeCompare(b.plan.pickupTime)
            } else if (a.plan.pickupTime) {
                return -1
            } else if (b.plan.pickupTime) {
                return 1
            } else {
                return b.order.totalPallets - a.order.totalPallets
            }
        })

        // Group pickupPlans by pickupTime
        const map: Record<string, typeof pickupPlansForDay> = {};
        pickupPlansForDay.forEach(p => {
            const time = p.plan.pickupTime || '--';
            if (!map[time]) map[time as string] = [];
            map[time].push(p);
        });

        return { pickupPlans: pickupPlansForDay, groupedByTime: map };
    }, [day, groupedOrders, pickupPlans])
}
