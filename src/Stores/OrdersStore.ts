import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import groupOrders from '../Data/GroupOrders'
import { useCustomerStore } from './CustomerStore'
import getProductMasterData from '../Data/productMasterData'
import { deriveStatus } from '../Data/utils'
import ChangeFormat from '../Data/changeFormat'

type OrdersState = {
    orders: Order[]
    groupedOrders: GroupedOrder[]
    salesOrderLines: SalesOrderLine[]
    productMaster: Record<string, ProductMaster>

    setOrders: (orders: Order[]) => void
    upsertOrders: (orders: Order[]) => void
    setSalesOrderLines: (lines: SalesOrderLine[]) => void
    setProductMaster: (master: Record<string, ProductMaster>) => void

    splitOrder: (orderId: string) => void
    joinOrders: (sourceOrderId: string, targetGroupId: string) => void
    holdGroup: (groupId: string, hold: boolean, reason?: "backorder" | "small_order") => void
    changePickupType: (groupId: string, pickupType: "courier" | "pickup" | "delivery") => void

    pickupPlans: Record<string, PickupPlan>
    setPickupPlan: (groupId: string, plan: PickupPlan) => void

}


export const useOrdersStore = create<OrdersState>()(
    persist(
        (set, get) => ({
        orders: [],
        groupedOrders: [],
        productMaster: getProductMasterData(),
        pickupPlans: {},

        setOrders: (orders) => // when setting orders directly, we assume it's a full replacement (e.g. from file import with "clear" option)
            set({
                orders,
                groupedOrders: groupOrders(orders),
            }),

        upsertOrders: (incoming) => { // when upserting, we merge with existing orders to preserve local-only fields like hold status and pickup type
            const existing = get().orders
            const map = new Map(existing.map(o => [o.deliveryNo, o]))

            for (const order of incoming) {
                const current = map.get(order.deliveryNo)

                if (!current) {
                    // new order
                    map.set(order.deliveryNo, order)
                    continue
                }

                // merge imported fields but keep local overrides
                map.set(order.deliveryNo, {
                    ...current,

                    // fields controlled by TMS
                    weight: order.weight,
                    volume: order.volume,
                    pallets: order.pallets,
                    DeliverStatus: order.DeliverStatus,
                    comments: order.comments,

                    // allow date correction if TMS changed
                    deliverDate: order.deliverDate,
                })
            }
            const merged = Array.from(map.values())
            console.log("Upserting orders. Incoming:", incoming.length, "Existing:", existing.length, "Merged:", merged.length)
            set({
                orders: merged,
                groupedOrders: groupOrders(merged),
            })
            useCustomerStore.getState().upsertCustomersFromOrders(merged)
        },

        salesOrderLines: [],
        setSalesOrderLines: (salesOrderLines) => set({ salesOrderLines }),

        setProductMaster: (productMaster) => set({ productMaster }),


        splitOrder: (orderId: string) =>
            set((state) => {
                let groupId;
                const hash = Date.now()
                const orders = state.orders.map(order => {
                    if (order.deliveryNo !== orderId) return order
                    groupId = order.groupId
                    return {
                        ...order,
                        groupId: `${groupId}-${hash}`
                    }
                })
                return { orders, groupedOrders: groupOrders(orders) }
            }),

        joinOrders: (sourceOrderId: string, targetGroupId: string) =>
            set((state) => {
                const orders = state.orders.map(order =>
                    order.deliveryNo === sourceOrderId
                        ? { ...order, groupId: targetGroupId }
                        : order
                    )
                console.log("Joining orders", sourceOrderId, "into", targetGroupId)
                return { orders, groupedOrders: groupOrders(orders) }
            }),

        holdGroup: (groupId: string, held: boolean, reason?: "backorder" | "small_order") =>
            set((state) => {
                const orders = state.orders.map(order => 
                    order.groupId === groupId
                        ? { ...order, 
                            status: deriveStatus(order.comments, order.shipmentNo ?? "", order.DeliverStatus ?? "", held), 
                            holdReason: reason }
                        : order
                )
                return { orders, groupedOrders: groupOrders(orders) }
            }),

        changePickupType: (groupId: string, pickupType: "courier" | "pickup" | "delivery") =>
            set((state) => {
                const orders = state.orders.map(order =>
                    order.groupId === groupId
                        ? { ...order, pickupType }
                        : order
                )
                return { orders, groupedOrders: groupOrders(orders) }
            }),
        setPickupPlan: (groupId: string, plan: PickupPlan) =>
            set(state => ({
                pickupPlans: {
                ...state.pickupPlans,
                [groupId]: plan
                }
            })),
        }),
        {
            name: 'orders-storage',
            partialize: (state) => ({
                orders: state.orders,
                salesOrderLines: state.salesOrderLines,
                pickupPlans: state.pickupPlans,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.orders) {
                    state.groupedOrders = groupOrders(state.orders)
                }
            },
            version: 0.1,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            migrate: (persistedState:any, version) => {
                if (version === 0) {
                    persistedState.orders = ChangeFormat(persistedState.orders)
                }
                return persistedState
            }
        }
    )
)