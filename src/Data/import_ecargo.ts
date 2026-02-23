import Papa from "papaparse"
import { useOrdersStore } from "../Stores/OrdersStore"
import { toDateOnlyString } from "./Dates"
import { useCustomerStore } from "../Stores/CustomerStore"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCsvFile(file: File, format: "formatA" | "formatB"): Promise<any[]> {
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

function mapFormatAToOrders(rows: Record<string, string>[], locations: Record<string, number>, setLocation: (groupId: string, value: number) => void): Order[] {
  return rows.map((row) => {
    let customer = row["DeliverToName"]?.trim()
    const city = row["DeliverToAddressCity"]?.trim()
    const u = row["Comments"]?.trim() || ""
    const deliverDate = row["Delivery Arrival Date"]?.trim() || ""

    if (customer.includes("Foodstuffs")) {
      customer = "Foodstuffs " + city
    }

    const groupId = `${customer}-${deliverDate}`

    if (locations[groupId] === undefined) {
      setLocation(groupId, 0)
    }

    return {
      deliveryNo: row["DeliveryNo"],
      customer,
      city,
      u,
      weight: Number(row["ItemWeight"]) || 0,
      volume: Number(row["ItemVolume"]) || 0,
      pallets: Number(row["ItemQty2"]) || 0,
      status: u ? "finished" : "picking",
      groupId,
      deliverDate: toDateOnlyString(new Date(deliverDate)),
      DeliverStatus: row["DeliverStatus"]?.trim() || "",
    }
  })
}

function parseDate(dateStr: string): string {
  // format is "dd/mm/yyyy"
  const [day, month, year] = dateStr.split("/").map(Number)
  return toDateOnlyString(new Date(year, month - 1, day))
}

function mapFormatBToOrders(rows: Record<string, string>[], locations: Record<string, number>, setLocation: (groupId: string, value: number) => void): Order[] {
  return rows.map((row) => {
    let customer = row["Deliver To"]?.trim()
    const city = row["City"]?.trim()
    const u = row["Comments"]?.trim() || ""
    const deliverDate = row["Planned Deliver Date"]?.split(" ")[0] || ""
    
    if (!customer || !city || !deliverDate) {
      console.warn("Skipping row with missing required fields:", row)
      return null
    }

    if (customer.includes("Foodstuffs")) {
      customer = "Foodstuffs " + city
    }

    const groupId = `${customer}-${deliverDate}`

    if (locations[groupId] === undefined) {
      setLocation(groupId, 0)
    }

    return {
      deliveryNo: row["Consignment "],
      customer,
      city,
      u,
      weight: Number(row["Weight"]) || 0,
      volume: Number(row["Volume"]) || 0,
      pallets: Number(row["Qty 4"]) || 0,
      status: u ? "finished" : "picking",
      groupId,
      deliverDate: parseDate(deliverDate),
      DeliverStatus: row["Status"]?.trim() || "",
    }
  })
  .filter((order): order is Order => order !== null) // filter out nulls from skipped rows
}

async function detectFormat(file: File): Promise<"formatA" | "formatB"> {
  // if the first cell is Consignment Extract 																																
  // then it's the format with Customer Name, otherwise it's the one with Customer Name

  if (await file.text().then(text => text.startsWith("Consignment Extract"))) {
    return "formatB"
  } else {
    return "formatA"
  }
}

export async function onCSVUpload(
  file: File,
) {
  console.log("Importing file:", file.name)
  const { setOrders, setLocation, locations } = useOrdersStore.getState()
  try {
    const format = await detectFormat(file)
    const rows = await parseCsvFile(file, format)
    let parsedOrders: Order[] = []

    if (format === "formatA") {
      parsedOrders = mapFormatAToOrders(rows, locations, setLocation)
    } else if (format === "formatB") {
      parsedOrders = mapFormatBToOrders(rows, locations, setLocation)
    } else {
      throw new Error("Unknown CSV format")
    }



    setOrders(parsedOrders.sort((a, b) => a.deliveryNo.localeCompare(b.deliveryNo)))
    useCustomerStore.getState().upsertCustomersFromOrders(parsedOrders)
    console.log("Imported orders:", parsedOrders)
  } catch (err) {
    console.error("CSV import failed", err)
    alert("Failed to import CSV file")
  }
}
