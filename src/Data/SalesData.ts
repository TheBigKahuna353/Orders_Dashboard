import { useOrdersStore } from "../Stores/OrdersStore"


function parseSAPDate(value: string): Date {
  if (!value) throw new Error("Missing date")

  const [day, month, year] = value.split('.').map(Number)

  // create LOCAL date (not ISO)
  return new Date(year, month - 1, day)
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
    .split('\t')
    .map(h => h.trim())

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

    // Skip broken rows
    if (!document || !material) continue

    const deliveryDateRaw = get("Dlv.Date")

    result.push({
      salesOrderNo: document,
      customer,

      material,
      description: get("Description"),

      orderQty: parseNumber(get("Order qty")),
      confirmedQty:
        parseNumber(get("ConfirmQty")) ||
        parseNumber(get("Order qty")),

      deliveryDate: parseSAPDate(deliveryDateRaw),

      unit: get("SU")
    })
  }

  return result
}

export const importSalesData = async (file: File) => {

  const text = await file.text()

  const lines = parseSAPSalesExport(text)

  useOrdersStore.getState().setSalesOrderLines(lines)
  return lines

}

export function calculatePickSplit(
  line: SalesOrderLine,
  master?: ProductMaster
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