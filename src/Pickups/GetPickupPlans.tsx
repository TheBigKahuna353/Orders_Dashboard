import { useMemo } from "react"
import { useOrdersStore } from "../Stores/OrdersStore"
import { getPickDate } from "../Data/filter"
import { useCustomerStore } from "../Stores/CustomerStore"
import { fromDateOnlyString, toDateOnlyString } from "../Data/Dates"







export function usePickupPlans(day: Date): {order:GroupedOrder, plan:PickupPlan}[] {
    const { pickupPlans, groupedOrders } = useOrdersStore()
    const customerMaster = useCustomerStore((s) => s.customerMaster)

    return useMemo(() => {
        const pickupPlansForDay = groupedOrders.filter(o => {
            const pickDate = getPickDate(o.customer, fromDateOnlyString(o.deliverDate), customerMaster)
            if (pickupPlans[o.groupId] !== undefined) { 
                return fromDateOnlyString(pickupPlans[o.groupId].date).getTime() === day.getTime() // if plan exists, only include if for the selected day
            }
            if (pickDate.getTime() !== day.getTime()) return false // filter to orders for the selected day
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

        return pickupPlansForDay
    }, [day, groupedOrders, pickupPlans, customerMaster])
}
