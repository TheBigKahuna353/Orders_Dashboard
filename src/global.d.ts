type Order = {
  deliveryNo: string
  customer: string
  city: string
  weight: number
  volume: number
  pallets: number
  groupId: string
  deliverDate: string

  status: 'picking' | 'held' | 'ready' | 'dispatched' | 'delivered'
  DeliverStatus?: string
  comments: string // comments column
  shipmentNo?: string

  pickupType: "delivery" | "pickup" | 'courier'
  holdReason?: "backorder" | "small_order"
}

type GroupedOrder = {
  groupId: string
  customer: string
  city: string
  orders: Order[]
  totalPallets: number
  totalWeight: number
  totalVolume: number
  status: 'picking' | 'held' | 'ready' | 'dispatched' | 'delivered'
  palletsVariance?: number
  deliverDate: string,

  searchableString: string

  holdReason?: "backorder" | "small_order"
  pickupType: "delivery" | "pickup" | 'courier'
}

type SalesOrderLine = {
  salesOrderNo: string      // Document
  customer: string          // Name 1
  material: string
  description: string
  orderQty: number
  confirmedQty: number
  deliveryDate: string     // Dlv.Date
  unit: string              // CSE, EA, BUN

  linetype: 'confirmed' | 'backorder'
  SL: number
}

type Salesorder = {
  salesOrderNo: string
  customer: string
  city: string
  deliverDate: string
  totalPallets: number
  totalVoicePicks: number
  salesOrderLines: SalesOrderLine[]
}

type ProductMaster = {
  material: string

  description?: string
  casesPerPallet: number
  casesPerLayer?: number | null
}

type CustomerMaster = {
  customerName: string
  city: string
  pickLeadTime: number
}

type WorkloadDay = {
  date: Date
  salesOrderNumbers: Set

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

type CycleCountRecord = {
    material: string
    pallets: number
    cases: number
    palletsVariance: number
    casesVariance: number
    countDate: string
}

type WeeklyCycleCountSummary = {
    countDate: string
    pallets: number
    cases: number
    palletsVariance: number
    casesVariance: number
}

type DispatchLane = "dsp11" | "dsp12" | "dsp13" | "dsp14" | "dsp15" | "dsp16" | "dsp17" | "dsp18" | "dsp19" | "dsp20" | "dsp21" | "dsp22" | "dsp23" | "dsp24" | "dsp25" | "outside"

type PickupPlan = {
  groupId: string
  pickupTime?: string
  date: string
  location?: DispatchLane
  priority?: boolean
}