import { useOrdersStore } from "../Stores/OrdersStore"


function parseSAPDate(value: string): string {
  if (!value) throw new Error("Missing date")

  return value.split('.').join('-') // convert from dd.mm.yyyy to dd-mm-yyyy for easier parsing
}

function parseNumber(value: string): number {
  if (!value) return 0
  return Number(value.replace(',', '').trim()) || 0
}

export function parseSAPSalesExport(text: string): SalesOrderLine[] {

  const lines = text.split('\n')

  // Find header row
  const headerIndex = lines.findIndex(line =>
    line.includes("Document") &&
    line.includes("Material") &&
    line.includes("Dlv.Date")
  )


  if (headerIndex === -1) {
    throw new Error("SAP header row not found")
  }

  const headers = lines[headerIndex]
    .trim()
    .split('\t')

  const result: SalesOrderLine[] = []

  for (let i = headerIndex + 1; i < lines.length; i++) {

    const row = lines[i].trim()
    if (!row) continue

    const cols = row.split('\t')

    const get = (name: string) =>
      cols[headers.indexOf(name)] ?? ''

    const document = get("Document")
    const customer = get("Name 1")
    const material = get("Material")
    const shippingPoint = get("ShPt")

    if (shippingPoint !== "4014") {
      continue
    }

    // Skip broken rows
    if (!document || !material) continue

    const deliveryDateRaw = get("Dlv.Date")
    const confirmedQty = parseNumber(get("ConfirmQty"))
    const sl = parseNumber(get("SLNo"))
    console.log(get('Mat.Av.Dt.'))

    result.push({
      salesOrderNo: document,
      customer,

      material,
      description: get("Description"),

      SL: sl,
      linetype: sl === 1 ? "confirmed" : "backorder",

      orderQty: parseNumber(get("Order qty")),
      confirmedQty: confirmedQty,

      deliveryDate: parseSAPDate(deliveryDateRaw),

      unit: get("SU")
    })
  }

  return result
}

export const importSalesData = async (file: File) => {
  const buffer = await file.arrayBuffer()
  const decoder = new TextDecoder("utf-16le")
  const text = decoder.decode(buffer)

  const lines = parseSAPSalesExport(text)

  useOrdersStore.getState().setSalesOrderLines(lines)
  return lines

}

export function calculatePickSplit(
  line: SalesOrderLine,
  master?: ProductMaster,
) {


  const qty = line.confirmedQty
  const perPallet = master?.casesPerPallet


  if (!perPallet || perPallet <= 0) {
    // treat everything as voice if pallet data missing
    
    return {
      fullPallets: 0,
      voicePicks: qty
    }
  }

  const fullPallets = Math.floor(qty / perPallet)
  const remainder = qty % perPallet

  return {
    fullPallets,
    voicePicks: remainder
  }
}

export function getMaterialsFromOrders(orders: Salesorder[]): Record<string,number> {
  // returns materials and thier quantity across all orders, used for workload calculation
  const materials: Record<string,number> = {}
  orders.forEach(order => order.salesOrderLines.forEach(line => {
    materials[line.material] = (materials[line.material] || 0) + line.confirmedQty
  }))
  return materials
}