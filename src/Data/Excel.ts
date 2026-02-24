import * as XLSX from "xlsx"
import { useCycleCountStore } from "../Stores/CycleCountStore"
import { toDateOnlyString } from "./Dates"


async function parseExcelFile(file: File, date: Date): Promise<CycleCountRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const results: Map<string, CycleCountRecord> = new Map()
    // set countdate to the next Friday after the uploaded date (assuming cycle counts are always on Fridays)
    const dayOfWeek = date.getDay()
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7
    date.setDate(date.getDate() + daysUntilFriday)

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "array" })

        const worksheet = workbook.Sheets['Count Summary']

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "", // keeps empty cells
        })
        console.log("Raw JSON Data from Excel:", jsonData)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonData.forEach((row: any) => {
            const material = row['Material'] || ''
            if (!material) return; // skip empty material rows
            const StorageType = row['Storage Type'] || ''
            const cases = Number(row['Sum of Total Stock'] || 0)
            const pallets = Number(row['Count of Total Stock2'] || 0)
            const type = ['AFH', "GRC", "BLK"].includes(StorageType) ? 'bulk' : StorageType === 'PIK' ? 'pik' : 'other'
            if (type === 'other') return; // skip non-pik/non-bulk rows

            const varienceRaw = Number(row['Variance'] || 0)
            // if PIK, add to casesVarience, if bulk add to pallet varience
            const varience = type === 'pik' ? varienceRaw : varienceRaw / (cases > 0 ? cases : 1) // avoid division by zero
            
            console.log("Parsed row", material, StorageType, cases, pallets, varience, row['Storage Bin'])

            if (results.has(material)) {
                const existing = results.get(material)!
                if (type === 'bulk') {
                    existing.pallets += pallets
                    existing.palletsVariance += varience
                } else if (type === 'pik') {
                    existing.cases += cases
                    existing.casesVariance += varience
                }
                results.set(material, existing)
            } else {
                results.set(material, {
                    material,
                    pallets: type === 'bulk' ? pallets : 0,
                    cases: type === 'pik' ? cases : 0,
                    palletsVariance: type === 'bulk' ? varience : 0,
                    casesVariance: type === 'pik' ? varience : 0,
                    countDate: toDateOnlyString(date)
                })
            }
        })

        resolve(Array.from(results.values()))

      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = reject

    reader.readAsArrayBuffer(file)
  })
}


export async function onExcelUpload(file: File, date: Date) {
  try {
    const data = await (await parseExcelFile(file, date))
    console.log("Parsed Excel Data:", data)
    useCycleCountStore.getState().upsertRecordsFromExcel(data,)
  } catch (err) {
    console.error("Error uploading Excel file:", err)
  }
}






/**
 * Exports a table DOM node to an Excel file.
 * @param tableId The id of the table element in the DOM
 * @param filename The filename for the downloaded Excel file
 */
export function exportTableToExcel(tableId: string, filename = 'table.xlsx') {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error('Table not found:', tableId);
    return;
  }
  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  XLSX.writeFile(wb, filename);
}