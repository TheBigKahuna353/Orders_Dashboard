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
    console.log("Holding group", groupId)
    useOrdersStore.getState().holdGroup(groupId, true)
  },

  "not-picked": () => {}
}