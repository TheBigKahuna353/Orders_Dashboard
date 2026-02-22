type Order = {
  deliveryNo: string
  customer: string
  city: string
  u: string // comments column
  weight: number
  volume: number
  pallets: number
  status: "picking" | "finished"
  groupId: string
  deliverDate: string,
  DeliverStatus: string
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
  palletsVarience?: number
  deliverDate: string,
}

type SalesOrderLine = {
  salesOrderNo: string      // Document
  customer: string          // Name 1
  material: string
  description: string
  orderQty: number
  confirmedQty: number
  deliveryDate: Date
  unit: string              // CSE, EA, BUN
}

type ProductMaster = {
  material: string

  description: string
  casesPerPallet: number
  casesPerLayer?: number
}

type CustomerMaster = {
  customerName: string
  city: string
  pickLeadTime: number
}

type WorkloadDay = {
  date: Date

  fullPallets: number
  voicePicks: number
}

type WidgetLayout = {
  id: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

type Filter = 'All' | 'All Out of Town' | 'Out of town small' | 'All Locals' | 'Locals small' | 'Bulk';

type DailySummary = {
    date: Date
    metro: {
        orders: number
        pallets: number
        weight: number
        cube: number
    }

    outOfTown: {
        orders: number
        pallets: number
        weight: number
        cube: number
    }

    dispatch: {
        orders: number
        pallets: number
        weight: number
        cube: number
    }
}