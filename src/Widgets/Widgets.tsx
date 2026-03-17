import OrdersTable from "../OrdersTable/OrdersTable"
import SalesRep from "./SalesRep"
import Couriers from "./Couriers"
import Held from "./Held"
import NotPicked from "./NotPicked"
import { useOrdersStore } from "../Stores/OrdersStore"


const ordersTableHandler: React.FC<WidgetProps> = ({ scrollTop, isDragging }) => {
  return <OrdersTable scrollTop={scrollTop} widget={true} isDragging={isDragging}/>
}


export const WIDGETS: Record<WIDGET_NAMES, React.FC<WidgetProps>> = {
    "orders": ordersTableHandler,
    "sales": SalesRep,
    "courier": Couriers,
    "held": Held,
    "not-picked": NotPicked
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
  },

  "not-picked": () => {}
}