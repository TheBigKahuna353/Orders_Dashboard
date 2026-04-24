import { useInboundStore } from "../Stores/InboundStore";
import { toDateOnlyString } from "./Dates";


function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function parseDate(dateStr: string): Date {
    // format is "dd/mm/yyyy"
    const [day, month, year] = dateStr.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
}

function parseSAPMHTML(text: string): InboundLine[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const rows = doc.querySelectorAll('table tr');
    const lines: InboundLine[] = [];
    console.log(`Parsed ${rows.length} rows from the file.`);
    
    // first row is sheets data, second row is header, so start from 2

    const rowsArray = Array.from(rows).slice(2);
    for (let index = 0; index < rowsArray.length; index++) {

        const row = rowsArray[index];
        const cells = row.querySelectorAll('td');


        if (cells.length < 21) break; // stop if we reach rows that don't have enough cells, assuming those are not data rows
        const date = parseDate(cells[19].textContent?.trim() || cells[20].textContent?.trim()) // check-in date is in cell 19 or 20 depending on the format, 19 will be empty for some rows, so we check 20 as well

        if (isNaN(date.getTime())) {
            console.warn("Invalid date format in row, skipping:", Array.from(cells).map(c => c.textContent));
            continue;
        }
        if (date < new Date('2024-03-01')) continue; // skip rows with invalid dates, assuming those are not data rows

        if (cells.length >= 3) {
            lines.push({
                deliveryNo: cells[16].textContent?.trim() || '',
                checkInDate: toDateOnlyString(date),
                material: cells[0].textContent?.trim() || '',
                qty: parseInt(cells[7].textContent?.trim() || '0')
            });
        }
    }

    return lines;
}

function getInboundDeliveries(lines: InboundLine[]): InboundDelivery[] {
  const groups = new Map<string, InboundDelivery>()
  for (const line of lines) {
    const key = line.deliveryNo
    if (!groups.has(key)) {
        groups.set(key, {
            d: key,
            c: line.checkInDate,
            q: 0,
            m: 0
        })
    }
    const group = groups.get(key)!
    group.q += line.qty
    group.m += 1
  }
  return Array.from(groups.values());
}

export async function OnSAPUpload(file: File, importOption: 'clear' | 'overwrite' | 'add') {
    const text = await readFileAsText(file);
    console.log("File content read successfully");
    const lines = parseSAPMHTML(text);
    console.log("File parsed successfully, number of lines:", lines.length);

    const sizeKB = new Blob([JSON.stringify(lines)]).size / 1024
    console.log(sizeKB.toFixed(2) + " KB")  

    const upsertInboundDeliveries = useInboundStore.getState().upsertInboundDeliveries;
    const setInboundDeliveries = useInboundStore.getState().setInboundDeliveries;
    const deliveries = getInboundDeliveries(lines);

    console.log("Deliveries created successfully, number of deliveries:", deliveries.length);
    const sizeKBDeliveries = new Blob([JSON.stringify(deliveries)]).size / 1024
    console.log(sizeKBDeliveries.toFixed(2) + " KB")  

    if (importOption === 'clear') {
        setInboundDeliveries(deliveries, 0); // timestamp 0 indicates this is a fresh import that should overwrite server data
    }
    else if (importOption === 'overwrite') {
        // For simplicity, treat overwrite same as clear in this example
        upsertInboundDeliveries(deliveries);
    }
    else if (importOption === 'add') {
        upsertInboundDeliveries(deliveries);
    }
}