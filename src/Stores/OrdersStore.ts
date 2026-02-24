import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import groupOrders from '../Data/GroupOrders'
import { useCustomerStore } from './CustomerStore'
import getProductMasterData from '../Data/productMasterData'

type OrdersState = {
    orders: Order[]
    groupedOrders: GroupedOrder[]
    locations: Record<string, number>
    salesOrderLines: SalesOrderLine[]
    productMaster: Record<string, ProductMaster>

    setOrders: (orders: Order[]) => void
    upsertOrders: (orders: Order[]) => void
    setSalesOrderLines: (lines: SalesOrderLine[]) => void
    setProductMaster: (master: Record<string, ProductMaster>) => void

    setLocation: (groupId: string, location: number) => void

    splitOrder: (orderId: string) => void
    joinOrders: (sourceOrderId: string, targetGroupId: string) => void


}


export const useOrdersStore = create<OrdersState>()(
    persist(
        (set, get) => ({
        orders: [],
        groupedOrders: [],
        locations: {},
        productMaster: getProductMasterData(),

        setOrders: (orders) =>
            set({
                orders,
                groupedOrders: groupOrders(orders),
            }),

        upsertOrders: (incoming) => {
            const existing = get().orders
            const map = new Map(existing.map(o => [o.deliveryNo, o]))

            for (const order of incoming) {
            map.set(order.deliveryNo, order)
            }
            const merged = Array.from(map.values())
            set({
                orders: merged,
                groupedOrders: groupOrders(merged),
            })
            useCustomerStore.getState().upsertCustomersFromOrders(merged)
        },
        setLocation: (groupId, location) => {
            set({
                locations: {
                    ...get().locations,
                    [groupId]: location,
                },
            })
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
                return { orders, groupedOrders: groupOrders(orders), locations: {
                    ...state.locations,
                    [`${groupId}-${hash}`]: 0
                } }
            }),

        joinOrders: (sourceOrderId: string, targetGroupId: string) =>
            set((state) => {
                const sourceOrder = state.orders.find(o => o.deliveryNo === sourceOrderId)
                if (!sourceOrder) return state
                sourceOrder.groupId = targetGroupId
                console.log("Joining orders", sourceOrderId, "into", targetGroupId)
                return { orders: state.orders, groupedOrders: groupOrders(state.orders) }
            }),
        }),

        {
            name: 'orders-storage',
            partialize: (state) => ({
                orders: state.orders,
                locations: state.locations,
                salesOrderLines: state.salesOrderLines,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.orders) {
                    state.groupedOrders = groupOrders(state.orders)
                }
            },
        }
    )
)