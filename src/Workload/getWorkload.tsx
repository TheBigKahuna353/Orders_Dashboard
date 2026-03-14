import { getPickDate } from "../Data/filter"
import { useOrdersStore } from "../Stores/OrdersStore"
import { calculatePickSplit } from "../Data/SalesData"
import { useMemo } from "react"
import { useCustomerStore } from "../Stores/CustomerStore"
import { fromDateOnlyString, toDateOnlyString } from "../Data/Dates"
import { AcceptsBackorders } from "../Data/utils"



function buildSalesOrders(
  lines: SalesOrderLine[],
  masterMap: Record<string, ProductMaster>,
  customerMaster: Record<string, CustomerMaster>
) : Salesorder[] {
  const ordersMap: Record<string, Salesorder> = {}

  for (const line of lines) {
    if (line.confirmedQty <= 0) continue
    const master = masterMap[line.material]

    if (!ordersMap[line.salesOrderNo]) {
      ordersMap[line.salesOrderNo] = {
        salesOrderNo: line.salesOrderNo,
        customer: line.customer,
        city: customerMaster[line.customer]?.city || '',
        deliverDate: line.deliveryDate,
        totalPallets: 0,
        totalVoicePicks: 0,
        salesOrderLines: []
      }
    }
    if (ordersMap[line.salesOrderNo].deliverDate > line.deliveryDate) {
      ordersMap[line.salesOrderNo].deliverDate = line.deliveryDate
    }

    const split = calculatePickSplit(line, master)
    ordersMap[line.salesOrderNo].totalPallets += split.fullPallets
    ordersMap[line.salesOrderNo].totalVoicePicks += split.voicePicks
    ordersMap[line.salesOrderNo].salesOrderLines.push(line)
  }

  return Object.values(ordersMap)
}
    

function buildBackOrders(
  lines: SalesOrderLine[],
  masterMap: Record<string, ProductMaster>,
) : {voiceqty: number, pallets: number, salesOrderNo: string}[] {
  const backOrders = lines.filter(
    line => line.linetype === 'backorder' && 
    line.confirmedQty > 0 && 
    AcceptsBackorders(line.customer))
  .map(line => {
    const master = masterMap[line.material]
    const split = calculatePickSplit(line, master)
    return {
      voiceqty: split.voicePicks,
      pallets: split.fullPallets,
      salesOrderNo: line.salesOrderNo
    };
  });

  return backOrders;
}

function buildWorkload(
  lines: SalesOrderLine[],
  masterMap: Record<string, ProductMaster>,
  customerMaster: Record<string, CustomerMaster>
): WorkloadDay[] {

  const map = new Map<string, WorkloadDay>()
  const today = new Date()
  today.setHours(0,0,0,0)

  for (const line of lines) {

    if (line.confirmedQty <= 0) continue

    const master = masterMap[line.material]

    const pickDate = getPickDate(
        line.customer,
        fromDateOnlyString(line.deliveryDate),
        customerMaster
    )

    if (pickDate < today) continue

    const key = toDateOnlyString(pickDate)

    if (!map.has(key)) {
      map.set(key, {
        date: pickDate,
        salesOrderNumbers: new Set(),
        fullPallets: 0,
        voicePicks: 0
      })
    }

    const split = calculatePickSplit(line, master)
    const day = map.get(key)!

    day.fullPallets += split.fullPallets
    day.voicePicks += split.voicePicks
    day.salesOrderNumbers.add(line.salesOrderNo)
  }

  return Array.from(map.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}


export function useWorkload() {
  const { salesOrderLines, productMaster } = useOrdersStore();
  const { customerMaster } = useCustomerStore();

  return useMemo(() => {
    const workload = buildWorkload(
      salesOrderLines,
      productMaster,
      customerMaster
    );

    // Build Salesorder objects grouped by pick day
    const salesordersByDay: Record<string, Salesorder[]> = {};
    const salesorders = buildSalesOrders(salesOrderLines, productMaster, customerMaster);
    for (const order of salesorders) {
      const pickDate = getPickDate(
        order.customer,
        fromDateOnlyString(order.deliverDate),
        customerMaster
      );
      const dayKey = toDateOnlyString(pickDate);
      if (!salesordersByDay[dayKey]) {
        salesordersByDay[dayKey] = [];
      }
      salesordersByDay[dayKey].push(order);
    }

    const backOrders = buildBackOrders(salesOrderLines, productMaster);
    // Count unique salesOrderNo in backOrders
    const numBackOrders = new Set(backOrders.map(b => b.salesOrderNo)).size;

    return { workload, salesordersByDay, backOrders, numBackOrders };
  }, [salesOrderLines, productMaster, customerMaster]);
}
