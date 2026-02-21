import { subtractWorkDays } from "./utils";


export function filterOrder(order: GroupedOrder, filter: string): boolean {
    if (filter === 'All') {
        return true;
    } else if (filter === 'All Out of Town') {
        return !['hornby', 'rolleston', 'christchurch', 'riccarton'].includes(order.city.toLowerCase());
    } else if (filter === 'Out of town small') {
        return !['hornby', 'rolleston', 'christchurch'].includes(order.city.toLowerCase()) && 
            "Foodstuffs Dunedin" !== order.customer;
    } else if (filter === 'All Locals') {
        return ['hornby', 'rolleston', 'christchurch'].includes(order.city.toLowerCase());
    } else if (filter === 'Locals small') {
        return ['hornby', 'rolleston', 'christchurch', 'riccarton'].includes(order.city.toLowerCase()) && 
           !['Woolworths New Zealand Limited', 'Foodstuffs South Island Limited', "Foodstuffs Dunedin", "Foodstuffs (South Island)"].includes(order.customer);
    } else if (filter === 'Bulk') {
        return ['Woolworths New Zealand Limited', 'Foodstuffs South Island Limited', "Foodstuffs Dunedin", "Foodstuffs (South Island)"].includes(order.customer);
    } 
    return false;
}


export function getPickDate(order: GroupedOrder): Date {
    const deliverDate = new Date(order.deliverDate)
    const pickDate = new Date(deliverDate)
    if (order.customer === 'The Warehouse - Rolleston DC 845') {
        //console.log("order", order.groupId, "is rolleston, setting pick date to 3 days before deliver date")
        pickDate.setDate(subtractWorkDays(deliverDate, 1).getDate())
    } else if (filterOrder(order, 'Out of town small')) {
       // console.log("order", order.groupId, "is out of town small, setting pick date to 2 days before deliver date")
        pickDate.setDate(subtractWorkDays(deliverDate, 2).getDate())
    } else if (filterOrder(order, 'Locals small')) {
        //console.log("order", order.groupId, "is local small, setting pick date to 1 day before deliver date")
        pickDate.setDate(subtractWorkDays(deliverDate, 1).getDate())
    } else if (filterOrder(order, 'Bulk')) {
        if (order.customer !== 'Woolworths New Zealand Limited') {
            if (pickDate.getTime() > new Date('2026-02-20').getTime()) {
                console.log(pickDate, new Date('2026-02-20'))
                console.log("order", order.groupId, "is bulk but not woolworths, setting pick date to 1 day before deliver date")
                pickDate.setDate(subtractWorkDays(deliverDate, 1).getDate())
            } else {
                console.log("order", order.groupId, "is bulk but not woolworths, setting pick date to same day as deliver date")
            }
        }
    } else {
        alert(`Unknown filter for order ${order.groupId}`)
    }
    return pickDate
}