import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import groupOrders from '../Data/GroupOrders'

type OrdersState = {
  orders: Order[]
  groupedOrders: GroupedOrder[]
  locations: Record<string, number>

  setOrders: (orders: Order[]) => void
  upsertOrders: (orders: Order[]) => void

  setLocation: (groupId: string, location: number) => void
}


export const useOrdersStore = create<OrdersState>()(
    persist(
        (set, get) => ({
        orders: [],
        groupedOrders: [],
        locations: {},

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
        },
        setLocation: (groupId, location) => {
            set({
                locations: {
                    ...get().locations,
                    [groupId]: location,
                },
            })
        }
        }),
        {
            name: 'orders-storage',
            partialize: (state) => ({
                orders: state.orders,
                locations: state.locations,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.orders) {
                    state.groupedOrders = groupOrders(state.orders)
                }
            },
        }
    )
)