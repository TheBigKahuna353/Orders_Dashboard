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
    const excelRow = index + 2
    const values = [
      row.material,
      row.storageType,
      row.storageBin,
      row.baseUnitOfMeasure,
      row.sumOfTotalStock,
      row.countOfTotalStock2,
      row.actualCount,
      row.variance
    ]

    values.forEach((value, columnIndex) => {
      const address = utils.encode_cell({ r: excelRow - 1, c: columnIndex })
      worksheet[address] = {
        t: typeof value === 'number' ? 'n' : 's',
        v: value
      }
    })
  })

  worksheet['!ref'] = `A1:H${Math.max(rows.length + 1, 1)}`
  await writeFile(workbook, filename)
}
