import { subtractWorkDays } from "./utils";


export function filterOrder(city: string, customer: string, filter: string): boolean {
    if (filter === 'All') {
        return true;
    } else if (filter === 'All Out of Town') {
        return !['hornby', 'rolleston', 'christchurch', 'riccarton'].includes(city.toLowerCase());
    } else if (filter === 'Out of town small') {
        return !['hornby', 'rolleston', 'christchurch', 'riccarton'].includes(city.toLowerCase()) && 
            "Foodstuffs DUNEDIN" !== customer;
    } else if (filter === 'All Locals') {
        return ['hornby', 'rolleston', 'christchurch', 'riccarton'].includes(city.toLowerCase());
    } else if (filter === 'Locals small') {
        return ['hornby', 'rolleston', 'christchurch', 'riccarton'].includes(city.toLowerCase()) && 
           !['Woolworths New Zealand Limited', 'Foodstuffs South Island Limited', "Foodstuffs DUNEDIN", "Foodstuffs CHRISTCHURCH"].includes(customer);
    } else if (filter === 'Bulk') {
        return ['Woolworths New Zealand Limited', 'Foodstuffs South Island Limited', "Foodstuffs DUNEDIN", "Foodstuffs CHRISTCHURCH"].includes(customer);
    } 
    return false;
}


export function getPickDateOLD(customer: string, city: string, deliverDate: Date): Date {
    const pickDate = new Date(deliverDate)
    if (customer === 'The Warehouse - Rolleston DC 845') {
        //console.log("order", order.groupId, "is rolleston, setting pick date to 3 days before deliver date")
        pickDate.setDate(subtractWorkDays(deliverDate, 1).getDate())
    } else if (filterOrder(city, customer, 'Out of town small')) {
       // console.log("order", order.groupId, "is out of town small, setting pick date to 2 days before deliver date")
        pickDate.setDate(subtractWorkDays(deliverDate, 2).getDate())
    } else if (filterOrder(city, customer, 'Locals small')) {
        //console.log("order", order.groupId, "is local small, setting pick date to 1 day before deliver date")
        pickDate.setDate(subtractWorkDays(deliverDate, 1).getDate())
    } else if (filterOrder(city, customer, 'Bulk')) {
        if (customer !== 'Woolworths New Zealand Limited') {
            if (pickDate.getTime() > new Date('2026-02-20').getTime()) {
                pickDate.setDate(subtractWorkDays(deliverDate, 1).getDate())
            } else {
                console.log("order", customer, "is bulk but not woolworths, setting pick date to same day as deliver date")
            }
        }
    } else {
        alert(`Unknown filter for customer ${customer}`)
    }
    return pickDate
}


export function getLeadTime(customer: string, city: string): number {
    if (customer === 'The Warehouse - Rolleston DC 845') {
        //console.log("order", order.groupId, "is rolleston, setting pick date to 3 days before deliver date")
        return 1
    } else if (filterOrder(city, customer, 'Out of town small')) {
       // console.log("order", order.groupId, "is out of town small, setting pick date to 2 days before deliver date")
        return 2
    } else if (filterOrder(city, customer, 'Locals small')) {
        //console.log("order", order.groupId, "is local small, setting pick date to 1 day before deliver date")
        return 1
    } else if (filterOrder(city, customer, 'Bulk')) {
        if (customer !== 'Woolworths New Zealand Limited') {
            return 1 // this will be wrong for foodstuffs orders before 2026-02-20, but we will fix those manually in the customer store
        }
    } else {
        alert(`Unknown filter for customer ${customer}`)
    }
    return 0
}

export function getPickDate(
  customer: string,
  deliverDate: Date,
  customerMaster: Record<string, CustomerMaster>
) {

  const master = customerMaster[customer]
  if (!master) return deliverDate

  if (deliverDate.getTime() < new Date('2026-02-01').getTime()) {
        // oot small have 1 day instead of 2 days lead time before Feb 2026, so we need to handle that as a special case
        if (filterOrder(master.city, customer, 'Out of town small')) {
            return subtractWorkDays(deliverDate, 1)
        }
    }

  return subtractWorkDays(
    deliverDate,
    master.pickLeadTime
  )
}