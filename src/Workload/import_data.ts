import Papa from "papaparse"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseTextFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: "greedy",
          skipFirstNLines: 5,
          complete: (results) => {
            if (results.errors.length) {
              reject(results.errors)
            } else {
              resolve(results.data)
            }
          },
            error: (err) => reject(err)
          })
     });
}

export async function onTXTFileUpload(file: File): Promise<plannedOrder[]> {
    try {
        const data = await parseTextFile(file);

        // Map the parsed data to the SalesOrder type
        const orders: plannedOrder[] = data.map((row) => ({
            salesNo: row["Order"]?.trim(), // This is actually Sales Order, but we don't have a delivery number in the txt file
            customer: row["Ship-to"]?.trim(),
            city: row["Location"]?.trim(),
            deliverDate: row["DeliveryDate"]?.trim(),
            cartons: Number(row["Cartons"]?.trim() || 0),
            pallets: Number(row["Pallets"]?.trim() || 0),
            volume: Number(row["Volume"]?.trim() || 0)
        }));
        
        return orders;
    } catch (error) {
        console.error("Error parsing TXT file:", error);
        throw error;
    }
}