import * as XLSX from 'xlsx-js-style'
import { useCycleCountStore } from "../Stores/CycleCountStore"
import { toDateOnlyString } from "./Dates"

const SUMMARY_RANGES = [
  "E5:I8",
  "E10:I13",
  "E15:I18",
  "M5:Q8",
  "M10:Q13",
  "M15:Q18",
  "U5:Y8",
  "U10:Y13",
  "U15:Y18",
  "AC5:AG8",
  "AC10:AG13",
  "AC15:AG18",
  "AK5:AO8",
]

function addOuterBorder(ws: XLSX.WorkSheet, range: string) {
  const r = XLSX.utils.decode_range(range)

  for (let row = r.s.r; row <= r.e.r; row++) {
    for (let col = r.s.c; col <= r.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" }

      ws[cellRef].s = ws[cellRef].s || {}
      ws[cellRef].s.border = ws[cellRef].s.border || {}

      if (row === r.s.r) ws[cellRef].s.border.top = { style: "thin" }
      if (row === r.e.r) ws[cellRef].s.border.bottom = { style: "thin" }
      if (col === r.s.c) ws[cellRef].s.border.left = { style: "thin" }
      if (col === r.e.c) ws[cellRef].s.border.right = { style: "thin" }
    }
  }
}

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

export async function parseExcelToRows(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        console.log("Worksheet Data:", worksheet)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: 5 // skip first 5 rows which are headers
        })
        resolve(jsonData as string[][])
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = reject 
    reader.readAsArrayBuffer(file)
  })
}




  /**
   * Exports a table DOM node to an Excel file.
   * @param tableId The id of the table element in the DOM
   * @param filename The filename for the downloaded Excel file
   */
export async function exportTableToExcel(tableId: string, filename = 'table.xlsx') {
    const table = document.getElementById(tableId);
    if (!table) {
      console.error('Table not found:', tableId);
      return;
    }
    const dataText = table.innerText;
    const rows = dataText.split('\n');
    const data = rows.map(row => row.split('\t'));

    // Remove first element in every row from row 2 onwards
    for (let i = 0; i < data.length; i++) {
      data[i].splice(0, 1);
      // Remove second element in every 4th row
      if ((i) % 4 === 1) {
        data[i].splice(0, 1);
      }
    }
    data[0].splice(0, 1); // also remove first element of header row

  // Fetch the template file as ArrayBuffer
  try {
    const response = await fetch('/Orders_Dashboard/src/assets/template.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const template = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true });
    const worksheet = template.Sheets[template.SheetNames[0]];

    // write dates from row 1
    const add: Record<string, number> = { "mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4 };
    const dayKey = (data[0][0]?.toLowerCase().slice(0, 3));
    let i = 4 + (add[dayKey] ?? 0);
    for (let col = 0; col < data[0].length - 1; col++) {
      if (data[0][col].slice(0, 4) === "Week") {
        i += 2
        continue;
      }
      const cellAddress = XLSX.utils.encode_cell({ c: col+i, r: 1 });
      const cellAddress2 = XLSX.utils.encode_cell({ c: col+i, r: 2 });
      worksheet[cellAddress] = { t: 's', v: data[0][col].split(',')[1].trim() };
      worksheet[cellAddress2] = { t: 's', v: data[0][col].split(',')[0].trim() };

      // now write the data for this column, starting from row 4
      let j = 0;
      for (let row = 1; row < data.length; row++) {
        
        if (row % 4 === 1) j++ // increment j every 4 rows, starting from the second row

        const cellAddress = XLSX.utils.encode_cell({ c: col+i, r: row+2+j });
        const value = data[row][col].replace(',', ''); // remove commas from numbers
        worksheet[cellAddress] = { t: 'n', v: parseFloat(value) };
      }
    }
    
    SUMMARY_RANGES.forEach(r => addOuterBorder(worksheet, r))

    //console.log(data)
    // You may want to trigger a download here
    XLSX.writeFile(template, filename);
  } catch (err) {
    console.error('Error fetching or processing template.xlsx:', err);
  }
}