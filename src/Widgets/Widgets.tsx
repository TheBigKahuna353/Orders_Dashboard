import SalesRep from "./SalesRep"
import Couriers from "./Couriers"
import Held from "./Held"
import NotPicked from "./NotPicked"
import { useOrdersStore } from "../Stores/OrdersStore"
import AllOrders from "./AllOrders"



export const WIDGETS: Record<WIDGET_NAMES, React.FC<WidgetProps>> = {
    "orders": AllOrders,
    "sales": SalesRep,
    "courier": Couriers,
    "held": Held,
    "not-picked": NotPicked
}

export type WidgetSettings = {
    columns: ColumnConfig[]
    range: "all" | "week" | "today"
    orderFilter: Filter
}

const AllOrdersSettings: WidgetSettings = {
    columns: [
      { key: 'customer', label: 'Customer', link: true, width: '2fr' },
      { key: 'totalPallets', label: 'Pallets' },
      { key: 'totalWeight', label: 'Weight' },
      { key: 'totalVolume', label: 'Volume' },
      { key: 'orders', label: 'Orders' },
      { key: 'status', label: 'Status', capitalize: true },
      { key: 'deliverDate', label: 'Delivery Date', date: true }
    ],
    range: "all",
    orderFilter: "All"
}

const CouriersSettings: WidgetSettings = {
    columns: [
    { key: 'customer', label: 'Customer', link: true, width: '1fr' },
    { key: 'totalWeight', label: 'Weight' },
    { key: 'totalVolume', label: 'Volume' },
    { key: 'deliverDate', label: 'Delivery Date', date: true , width: '115px'},
  ],
    range: "all",
    orderFilter: "All"
}

const HeldSettings: WidgetSettings = {
    columns: [
    { key: 'customer', label: 'Customer' },
    { key: 'ordersCount', label: '# Orders' },
    { key: 'totalVolume', label: 'Volume' },
    { key: 'deliverDate', label: 'Delivery Date' },
  ],
    range: "all",
    orderFilter: "All"
}

const NotPickedSettings: WidgetSettings = {
    columns: [
        { key: 'customer', label: 'Customer', link: true, width: '1fr' },
        { key: 'totalPallets', label: 'Pallets', width: '70px' },
        { key: 'deliverDate', label: 'Delivery Date', date: true , width: '115px'},
  ],
    range: "all",
    orderFilter: "All"
}

const SalesSettings: WidgetSettings = {
    columns: [
    { key: 'customer', label: 'Customer', width: '50%' },
    { key: 'orders', label: 'Orders' },
    { key: 'deliverDate', label: 'Delivery Date', date: true },
  ],
    range: "all",
    orderFilter: "All"
}

export const WIDGET_DEFAULT_SETTINGS: Record<WIDGET_NAMES, WidgetSettings> = {
    "orders": AllOrdersSettings,
    "courier": CouriersSettings,
    "held": HeldSettings,
    "not-picked": NotPickedSettings,
    "sales": SalesSettings
}


export const WIDGET_DROP_HANDLERS: Record<WIDGET_NAMES, (groupId: string) => void> = {
  orders: (groupId) => {
    useOrdersStore.getState().changePickupType(groupId, "delivery")
    useOrdersStore.getState().holdGroup(groupId, false)
  },

  courier: (groupId) => {
    useOrdersStore.getState().changePickupType(groupId, "courier")
    useOrdersStore.getState().holdGroup(groupId, false)
  },

  sales: (groupId) => {
    useOrdersStore.getState().changePickupType(groupId, "pickup")
    useOrdersStore.getState().holdGroup(groupId, false)
  },

  held: (groupId) => {
    console.log("Holding group", groupId)
    useOrdersStore.getState().holdGroup(groupId, true)
  },

  "not-picked": () => {}
}