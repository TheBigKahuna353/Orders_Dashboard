import type { CycleCountMaterialInput, CycleCountSourceRow } from './cycleCountTypes'

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

function normalizeMaterial(value: string | number | null | undefined): string {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  return digits ? digits.padStart(7, '0') : raw
}

function parseNumber(value: string | number | null | undefined): number {
  const raw = String(value ?? '').replace(/,/g, '').trim()
  if (!raw) return 0
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseTextTable(text: string): string[][] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/html')
  const htmlRows = Array.from(doc.querySelectorAll('table tr'))
    .map(row => Array.from(row.querySelectorAll('td,th')).map(cell => cell.textContent?.trim() ?? ''))
    .filter(row => row.some(cell => cell.length > 0))

  if (htmlRows.length > 0) return htmlRows

  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split(/\t/).map(cell => cell.trim()))
}

function findHeaderIndex(rows: string[][], keys: string[]): number {
  return rows.findIndex(row => keys.every(key => row.some(cell => cell.toLowerCase().includes(key.toLowerCase()))))
}

function normalizeHeaderCell(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function findAliasIndex(headers: string[], aliases: string[]): number {
  const normalizedHeaders = headers.map(normalizeHeaderCell)
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeaderCell(alias)
    const exact = normalizedHeaders.findIndex(header => header === normalizedAlias)
    if (exact !== -1) return exact
  }
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeaderCell(alias)
    const partial = normalizedHeaders.findIndex(header => header.includes(normalizedAlias))
    if (partial !== -1) return partial
  }
  return -1
}

export async function parseCycleCountMhtml(file: File): Promise<CycleCountSourceRow[]> {
  const text = await readFileAsText(file)
  return parseCycleCountText(text)
}

export function parseCycleCountText(text: string): CycleCountSourceRow[] {
  const rows = parseTextTable(text)
  const headerIndex = findHeaderIndex(rows, ['Material', 'Storage Type', 'Storage Bin'])

  if (headerIndex === -1) {
    throw new Error('Could not find cycle count data in the LX03 file.')
  }

  const headers = rows[headerIndex].map(cell => cell.trim())
  const materialIndex = findAliasIndex(headers, ['Material'])
  const storageTypeIndex = findAliasIndex(headers, ['Storage Type'])
  const storageBinIndex = findAliasIndex(headers, ['Storage Bin'])
  const baseUnitIndex = findAliasIndex(headers, ['Base Unit of Measure'])
  const stockIndex = findAliasIndex(headers, ['Sum of Total Stock', 'Total Stock', 'Stock'])
  const countIndex = findAliasIndex(headers, ['Count of Total Stock2', 'Stock 2', 'Stock2', 'Count', 'Row Count'])
  const storageUnitIndex = findAliasIndex(headers, ['Storage Unit', 'Storage Unit ID', 'Storage Unit Id', 'SU'])

  if ([materialIndex, storageTypeIndex, storageBinIndex, baseUnitIndex, stockIndex].some(index => index === -1)) {
    throw new Error('LX03 file is missing one or more required columns.')
  }

  const grouped = new Map<string, {
    material: string
    storageType: string
    storageBin: string
    baseUnitOfMeasure: string
    sumOfTotalStock: number
    countOfTotalStock2: number
    storageUnits: Set<string>
  }>()

  for (const row of rows.slice(headerIndex + 1)) {
    const material = normalizeMaterial(row[materialIndex])
    if (!material) continue

    const storageType = row[storageTypeIndex]?.trim() || ''
    const storageBin = row[storageBinIndex]?.trim() || ''
    const baseUnitOfMeasure = row[baseUnitIndex]?.trim() || ''
    const key = [material, storageType, storageBin, baseUnitOfMeasure].join('||')
    const current = grouped.get(key) ?? {
      material,
      storageType,
      storageBin,
      baseUnitOfMeasure,
      sumOfTotalStock: 0,
      countOfTotalStock2: 0,
      storageUnits: new Set<string>()
    }

    current.sumOfTotalStock += parseNumber(row[stockIndex])

    if (countIndex !== -1) {
      const countValue = parseNumber(row[countIndex])
      current.countOfTotalStock2 += countValue > 0 ? countValue : 1
    } else {
      current.countOfTotalStock2 += 1
    }

    if (storageUnitIndex !== -1) {
      const storageUnit = String(row[storageUnitIndex] ?? '').trim()
      if (storageUnit) current.storageUnits.add(storageUnit)
    }

    grouped.set(key, current)
  }

  return Array.from(grouped.values()).map(row => ({
    material: row.material,
    storageType: row.storageType,
    storageBin: row.storageBin,
    baseUnitOfMeasure: row.baseUnitOfMeasure,
    sumOfTotalStock: row.sumOfTotalStock,
    countOfTotalStock2: row.storageUnits.size > 0 ? row.storageUnits.size : row.countOfTotalStock2
  }))
}

export function parseMaterialPaste(text: string, dayCount: 1 | 2 | 3 = 3): CycleCountMaterialInput[] {
  const tokens = text.split(/[\n,\t]+/).map(token => token.trim()).filter(Boolean)
  const parsed = tokens.map((token, index) => {
    const match = token.match(/^(\d{1,7})(?:\s*[/|-]\s*([123]))?$/)
    const material = normalizeMaterial(match?.[1] ?? token)
    if (!material) return null
    // Assumption: if a material is tagged with a day beyond the selected day count, use the last day.
    const rawDay = match?.[2] ? Number(match[2]) : ((index % dayCount) + 1)
    const day = Math.min(rawDay, dayCount) as 1 | 2 | 3
    return { material, day }
  }).filter((item): item is CycleCountMaterialInput => Boolean(item))

  const deduped = new Map<string, CycleCountMaterialInput>()
  for (const item of parsed) deduped.set(item.material, item)
  return Array.from(deduped.values())
}

export function parsePikFacesPaste(text: string): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const line of text.split(/\r?\n/).map(value => value.trim()).filter(Boolean)) {
    const parts = line.split(/\t|\s{2,}|,/).map(part => part.trim()).filter(Boolean)
    if (parts.length < 2) continue
    const material = normalizeMaterial(parts[0])
    if (!material) continue
    mapping[material] = parts[1]
  }
  return mapping
}
