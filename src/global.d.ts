type Order = {
  deliveryNo: string
  customer: string
  city: string
  weight: number
  volume: number
  pallets: number
  groupId: string
  deliverDate: string
  PO: string

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
  PO: string

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

type WIDGET_NAMES = "orders" | "sales" | "courier" | "held" | "not-picked"

type DashboardWidget = {
  id: string;
  type: WIDGET_NAMES;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

type WidgetProps = {
    id: string;
    scrollTop?: number
    isDragging?: boolean
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

  bulk: {
    woolworths: number // pallet count
    foodstuffsDunedin: number // pallet count
    foodstuffsChristchurch: number // pallet count
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

type InboundLine = {
    deliveryNo: string
    material: string
    qty: number
    checkInDate: string
}

type InboundDelivery = {
    d: string // delivery number
    m: number // materials
    q: number // quantity
    c: string // check-in date
}

type Asn = {
    deliveryNo: string
    material: string
    qty: number
    sscc: string
}

type ColumnConfig = {
  key: string
  label: string
  width?: string
  date?: boolean
  link?: boolean
  capitalize?: boolean
}

type WidgetSettings = {
    columns: ColumnConfig[]
    range: "all" | "week" | "today" | "month" | "7 days"
    orderFilter: Filter
    dateMode: "delivery" | "pick"
}