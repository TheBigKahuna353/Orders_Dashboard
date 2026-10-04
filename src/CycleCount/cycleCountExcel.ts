import { read, utils, writeFile } from 'xlsx-js-style'
import type { CycleCountCountRow } from './cycleCountTypes'

const TEMPLATE_URL = new URL('./Cycle Count Template.xlsm', import.meta.url).href
const COUNT_SHEET = 'Count Summary'

export async function exportCycleCountWorkbook(rows: CycleCountCountRow[], filename = 'Cycle Count Summary.xlsx') {
  const response = await fetch(TEMPLATE_URL)
  const buffer = await response.arrayBuffer()
  const workbook = read(buffer, { type: 'array', cellStyles: true })
  const worksheet = workbook.Sheets[COUNT_SHEET]

  if (!worksheet) {
    throw new Error('Count Summary sheet not found in the template workbook.')
  }

  rows.forEach((row, index) => {
    const worksheetRow = index + 1
    const values = [
      row.material,
      row.storageType,
      row.storageBin,
      row.baseUnitOfMeasure,
      row.sumOfTotalStock,
      row.countOfTotalStock2,
      row.actualCount
    ]

    values.forEach((value, columnIndex) => {
      const address = utils.encode_cell({ r: worksheetRow, c: columnIndex })
      const existingCell = worksheet[address] ?? {}
      worksheet[address] = {
        ...existingCell,
        t: typeof value === 'number' ? 'n' : 's',
        v: value
      }
    })
  })

  await writeFile(workbook, filename)
}
