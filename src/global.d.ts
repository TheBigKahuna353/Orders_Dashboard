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

type plannedOrder = {
  salesNo: string
  customer: string,
  city: string,
  deliverDate: string,
  cartons: number,
  pallets: number,
  volume: number
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