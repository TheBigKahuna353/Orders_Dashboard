import Papa from "papaparse"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseCsvFile(file: File): Promise<any[]> {
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
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  setLocations: React.Dispatch<React.SetStateAction<{[key: string]: number}>>,
  locations: {[key: string]: number}
) {
    console.log("Importing file:", file.name)
  try {
    const rows = await parseCsvFile(file)
    const newLocations = { ...locations };

    const parsedOrders: Order[] = rows.map((row) => {
      let customer = row["DeliverToName"]?.trim()
      const city = row["DeliverToAddressCity"]?.trim()
      const u = row["u"]?.trim() || ""

      if (customer === "Foodstuffs South Island Limited" && city === "DUNEDIN") {
        customer = "Foodstuffs Dunedin"
      }

      if (locations[`${customer}`] === undefined) {
        // if order not in locations, set to 0 (left column)
        // if finished picking, set to next closest time slot later
        if (u) {
          newLocations[`${customer}`] = 1; // for now, just set to 1
        } else {
          newLocations[`${customer}`] = 0;
        }
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
        groupId: `${customer}`
      }
    })

    setLocations(newLocations);
    setOrders(parsedOrders.sort((a, b) => a.deliveryNo.localeCompare(b.deliveryNo)))
    console.log("Imported orders:", parsedOrders)
  } catch (err) {
    console.error("CSV import failed", err)
    alert("Failed to import CSV file")
  }
}
