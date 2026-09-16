export type CycleCountSourceRow = {
  material: string
  storageType: string
  storageBin: string
  baseUnitOfMeasure: string
  sumOfTotalStock: number
  countOfTotalStock2: number
}

export type CycleCountCountRow = CycleCountSourceRow & {
  actualCount: number | ''
  variance: number | ''
  day: 1 | 2 | 3
  confirmed: boolean
}

export type CycleCountMaterialInput = {
  material: string
  day: 1 | 2 | 3
}
