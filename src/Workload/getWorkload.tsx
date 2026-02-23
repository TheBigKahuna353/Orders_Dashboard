import { getPickDate } from "../Data/filter"
import { useOrdersStore } from "../Stores/OrdersStore"
import { calculatePickSplit } from "../Data/SalesData"
import { useMemo } from "react"
import { useCustomerStore } from "../Stores/CustomerStore"
import { fromDateOnlyString } from "../Data/Dates"



function buildWorkload(
  lines: SalesOrderLine[],
  masterMap: Record<string, ProductMaster>,
    customerMaster: Record<string, CustomerMaster>
): WorkloadDay[] {

  const map = new Map<string, WorkloadDay>()

  for (const line of lines) {

    if (line.confirmedQty <= 0) continue

    const master = masterMap[line.material]

    const pickDate = getPickDate(
        line.customer,
        fromDateOnlyString(line.deliveryDate),
        customerMaster
    )
    const today = new Date()
    today.setHours(0,0,0,0)

    if (pickDate < today) continue

    const key = pickDate.toDateString()

    if (!map.has(key)) {
      map.set(key, {
        date: pickDate,
        fullPallets: 0,
        voicePicks: 0
      })
    }

    const split = calculatePickSplit(line, master)
    const day = map.get(key)!

    day.fullPallets += split.fullPallets
    day.voicePicks += split.voicePicks
  }

  return Array.from(map.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}


export function useWorkload() {
    const { salesOrderLines, productMaster } = useOrdersStore()
    const { customerMaster } = useCustomerStore()

    return useMemo(() => buildWorkload(
        salesOrderLines,
        productMaster,
        customerMaster
        ), [salesOrderLines, productMaster, customerMaster])
}
