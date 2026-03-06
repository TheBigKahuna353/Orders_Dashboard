import OrdersTable from "../OrdersTable/OrdersTable"
import SalesRep from "./SalesRep"
import Courier from "./Couriers"
import Held from "./Held"
import { useOrdersStore } from "../Stores/OrdersStore"

export type WIDGET_NAMES = "orders" | "sales" | "courier" | "held"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ordersTableHandler: React.FC<{ id: string, extras?: any }> = ({ extras }) => {
    return <OrdersTable scrollTop={extras?.scrollTop} draggable isDragging={extras?.isDragging}/>
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WIDGETS: Record<WIDGET_NAMES, React.FC<{ id: string, extras?: any }>> = {
    "orders": ordersTableHandler,
    "sales": SalesRep,
    "courier": Courier,
    "held": Held,
}


export const WIDGET_DROP_HANDLERS: Record<string, (groupId: string) => void> = {
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
    useOrdersStore.getState().holdGroup(groupId, true)
  }
}