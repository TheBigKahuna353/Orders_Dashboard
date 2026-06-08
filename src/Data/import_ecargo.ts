import Papa from "papaparse"
import { useOrdersStore } from "../Stores/OrdersStore"
import { toDateOnlyString } from "./Dates"
import { parseExcelToRows } from "./Excel"
import { deriveStatus, makeGroupId } from "./utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCsvFile(file: File, format: "formatA" | "formatB" | "formatC"): Promise<any[]> {
  if (format === "formatC") {
    return parseExcelToRows(file)
  }
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      skipFirstNLines: format === "formatB" ? 5 : 0, // formatB has an extra header line
      complete: (results) => {
        if (results.errors.length) {
          reject(results.errors)
        } else {
          resolve(results.data)
        }
      },
      error: (err) => reject(err)
    })
  })
}

let indexDebug = 0;

const isCourier = (comments: string) => {
  if (comments.toLowerCase().includes("PHA")) return true
  if (comments.toLowerCase().includes("courier")) return true
  return false
}

function mapFormatAToOrders(rows: Record<string, string>[]): Order[] {
  return rows.map((row) => {
    let customer = row["DeliverToName"]?.trim()
    const city = row["DeliverToAddressCity"]?.trim()
    const comments = row["Comments"]?.trim() || ""
    const deliverDate = row["Delivery Arrival Date"]?.trim() || ""

    if (customer.includes("Foodstuffs")) {
      customer = "Foodstuffs " + city
    }

    const groupId = makeGroupId(customer, deliverDate)

    return {
      deliveryNo: row["DeliveryNo"],
      customer,
      city,
      comments,
      weight: Number(row["ItemWeight"]) || 0,
      volume: Number(row["ItemVolume"]) || 0,
      pallets: Number(row["ItemQty2"]) || 0,
      status: deriveStatus(comments, row["Manifest"]?.trim() || "", row["DeliverStatus"]?.trim() || "",),
      groupId,
      deliverDate: toDateOnlyString(new Date(deliverDate)),
      DeliverStatus: row["DeliverStatus"]?.trim() || "",
      shipmentNo: row["Manifest"]?.trim() || "",
      pickupType: "delivery",
      PO: row["PurchaseOrderNumber"]?.trim() || "",
    }
  })
}

function parseDate(dateStr: string): string {
  // format is "dd/mm/yyyy"
  const [day, month, year] = dateStr.split("/").map(Number)
  return toDateOnlyString(new Date(year, month - 1, day))
}

function mapFormatBToOrders(rows: Record<string, string>[]): Order[] {
  return rows.map((row, index) => {
      indexDebug = index
      let customer = row["Deliver To"]?.trim()
      const city = row["City"]?.trim()
      const comments = row["Comments"]?.trim() || ""
      const deliverDate = row["Planned Deliver Date"]?.split(" ")[0] || ""
      
      if (!customer || !city || !deliverDate) {
        console.warn("Skipping row with missing required fields:", row)
        return {} as Order // return empty object for rows with missing required fields, will filter out later
      }

      if (customer.includes("Foodstuffs")) {
        customer = "Foodstuffs " + city
      }

      const groupId = makeGroupId(customer, deliverDate)

      return {
        deliveryNo: row["Consignment "],
        customer,
        city,
        comments,
        weight: Number(row["Weight"]) || 0,
        volume: Number(row["Volume"]) || 0,
        pallets: Number(row["Qty 4"]) || 0,
        status: deriveStatus(comments, row["Manifest"]?.trim() || "", row["Status"]?.trim() || ""),
        groupId,
        deliverDate: parseDate(deliverDate),
        shipmentNo: row["Manifest"]?.trim() || "",
        DeliverStatus: row["Status"]?.trim() || "",
        pickupType: isCourier(comments) ? "courier" : "delivery",
        PO: row["PO Number"]?.trim() || "",
      }
    })
    .filter((order): order is Order => !!order && Object.keys(order).length > 0) // filter out nulls and empty objects from skipped rows
}

async function detectFormat(file: File): Promise<"formatA" | "formatB" | "formatC"> {
  // if the first cell is Consignment Extract 																																
  // then it's the format with Customer Name, otherwise it's the one with Customer Name
  if (file.type === "text/xlsx" || file.name.endsWith(".xlsx")) {
    return "formatC"
  }
  if (await file.text().then(text => text.startsWith("Consignment Extract"))) {
    return "formatB"
  } else {
    return "formatA"
  }
}

export async function onCSVUpload(
  file: File,
  importType: 'clear' | 'overwrite' | 'add'
) {
  console.log("Importing file:", file.name)
  const { setOrders, upsertOrders } = useOrdersStore.getState()
  try {
    const format = await detectFormat(file)
    const rows = await parseCsvFile(file, format)
    let parsedOrders: Order[] = []

    if (format === "formatA") {
      parsedOrders = mapFormatAToOrders(rows)
    } else if (format === "formatB" || format === "formatC") {
      parsedOrders = mapFormatBToOrders(rows)
    } else {
      throw new Error("Unknown CSV format")
    }

    if (parsedOrders.length === 0) {
      alert("No valid orders found in the file")
      return
    }

    console.log(`Parsed orders from ${format}:`, parsedOrders)

    if (importType === "overwrite") {
      upsertOrders(parsedOrders)
    } else if (importType === "clear") {
      setOrders(parsedOrders, 0) // set timestamp to 0 to force overwrite on server
    } else {
      setOrders([], 0)  // TODO implement function, this is a place holder and currently unreachable
    }
    console.log("Imported orders:", parsedOrders)
  } catch (err) {
    console.error("CSV import failed on row", indexDebug, err)
    alert("Failed to import CSV file")
  }
}
