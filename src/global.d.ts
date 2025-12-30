type Order = {
  deliveryNo: string
  customer: string
  city: string
  u: string
  weight: number
  volume: number
  pallets: number
  status: "picking" | "finished"
  groupId: string
}

type GroupedOrder = {
  groupId: string
  customer: string
  city: string
  orders: Order[]
  totalPallets: number
  totalWeight: number
  totalVolume: number
  status: "picking" | "finished",
}