import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type OrdersState = {
  orders: Order[]
  groupedOrders: GroupedOrder[]
  locations: Record<string, number>

  setOrders: (orders: Order[]) => void
  upsertOrders: (orders: Order[]) => void

  setLocation: (groupId: string, location: number) => void
}

function groupOrders(orders: Order[]): GroupedOrder[] {
  const groups = new Map<string, GroupedOrder>()

  for (const order of orders) {
      // create group if it doesn't exist
      if (!groups.has(order.groupId)) {
        groups.set(order.groupId, {
          groupId: order.groupId,
          customer: order.customer,
          city: order.city,
          orders: [],
          totalPallets: 0,
          totalWeight: 0,
          totalVolume: 0,
          status: "finished",
          palletsVarience: 0,
          deliverDate: order.deliverDate,
        })
      }

    function round(num: number, fractionDigits: number): number {
          return Number(num.toFixed(fractionDigits));
      }

    const group = groups.get(order.groupId)!

    group.orders.push(order)
    group.totalPallets += order.pallets
    group.totalWeight = round(group.totalWeight + order.weight, 2)
    group.totalVolume = round(group.totalVolume + order.volume, 2)

    // Some orders are small enough to be added to existing pallets
    // but they still say 1 pallet. To reflect this, we calculate the varience
    // which is the range the pallets could be in.
    // this is calculated as num of orders that have 1 pallet - 1 if all orders have 1 pallet
    if (group.orders.length > 1) {
        group.palletsVarience! = 0;
        for (const o of group.orders) {
            if (o.pallets === 1 && o.status !== "finished") {
                group.palletsVarience! += 1;
            }
        }
    }

    if (order.status !== "finished") {
        group.status = "picking"
      }
  }

  return Array.from(groups.values())
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