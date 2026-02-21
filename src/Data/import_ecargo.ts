import Papa from "papaparse"
import { useOrdersStore } from "../Stores/OrdersStore"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCsvFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
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

export async function onCSVUpload(
  file: File,
) {
  console.log("Importing file:", file.name)
  const { setOrders, setLocation, locations } = useOrdersStore.getState()
  try {
    const rows = await parseCsvFile(file)

    const parsedOrders: Order[] = rows.map((row) => {
      let customer = row["DeliverToName"]?.trim()
      const city = row["DeliverToAddressCity"]?.trim()
      const u = row["Comments"]?.trim() || ""
      const deliverDate = row["Delivery Arrival Date"]?.trim() || ""

      if (customer.includes("Foodstuffs")) {
        if (city === "Dunedin") {
          customer = "Foodstuffs Dunedin"
        } else {
          customer = "Foodstuffs Christchurch"
        }
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
        groupId: groupId,
        deliverDate: deliverDate,
        DeliverStatus: row["DeliverStatus"]?.trim() || ""
      }
    })

    setOrders(parsedOrders.sort((a, b) => a.deliveryNo.localeCompare(b.deliveryNo)))
    console.log("Imported orders:", parsedOrders)
  } catch (err) {
    console.error("CSV import failed", err)
    alert("Failed to import CSV file")
  }
}
