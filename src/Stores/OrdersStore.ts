import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import groupOrders from '../Data/GroupOrders'
import { useCustomerStore } from './CustomerStore'
import getProductMasterData from '../Data/productMasterData'
import { deriveStatus } from '../Data/utils'
import ChangeFormat from '../Data/changeFormat'
import { sendNewOrders, sendOrders, updateSinglePickup } from '../Data/server'

type OrdersState = {
    orders: Record<string, Order>
    ordersTimestamp: number
    groupedOrders: GroupedOrder[]
    salesOrderLines: SalesOrderLine[]
    productMaster: Record<string, ProductMaster>

    setOrders: (orders: Order[], time: number) => void
    upsertOrders: (orders: Order[]) => void
    setSalesOrderLines: (lines: SalesOrderLine[]) => void
    setProductMaster: (master: Record<string, ProductMaster>) => void

    splitOrder: (orderId: string) => void
    joinOrders: (sourceOrderId: string, targetGroupId: string) => void
    holdGroup: (groupId: string, hold: boolean, reason?: "backorder" | "small_order") => void
    changePickupType: (groupId: string, pickupType: "courier" | "pickup" | "delivery") => void

    pickupPlans: Record<string, PickupPlan>
    setPickupPlan: (groupId: string, plan: PickupPlan) => void
    setPickups: (plans: PickupPlan[], time: number) => void
    pickupPlansTimestamp: number

}


export const useOrdersStore = create<OrdersState>()(
    persist(
        (set, get) => ({
        orders: {},
        ordersTimestamp: 0,
        groupedOrders: [],
        productMaster: getProductMasterData(),
        pickupPlans: {},
        pickupPlansTimestamp: 1,
        
        // if timestamp is provided, its from server, else we assume it's a local update and set timestamp to now and send to server
        setOrders: (ordersArr, time) => {
            const orders = Object.fromEntries(ordersArr.map(order => [order.deliveryNo, order]))
            useCustomerStore.getState().upsertCustomersFromOrders(Object.values(orders))
            if (!time) {
                sendOrders(Object.values(orders)).then(serverTime => {
                    set({
                        orders,
                        groupedOrders: groupOrders(Object.values(orders)),
                        ordersTimestamp: serverTime,
                    })
                })
                return;
            }
            set({
                orders,
                groupedOrders: groupOrders(Object.values(orders)),
                ordersTimestamp: time,
            })
        },

        upsertOrders: (incomingArr) => {
            const existing = get().orders
            const orders = { ...existing }
            const updated: Order[] = []
            for (const order of incomingArr) {
                const current = orders[order.deliveryNo] ? orders[order.deliveryNo] : order
                const held = current?.status === "held" || order.status === "held"
                orders[order.deliveryNo] = {
                    ...current,

                    // fields controlled by TMS
                    weight: order.weight,
                    volume: order.volume,
                    pallets: order.pallets,
                    DeliverStatus: order.DeliverStatus,
                    comments: order.comments,
                    shipmentNo: order.shipmentNo,
                    PO: order.PO, // old values might have them missing, so we want to update if present in incoming data

                    // allow date correction if TMS changed
                    deliverDate: order.deliverDate,

                    // fields derived from other fields, we recalculate those
                    status: deriveStatus(order.comments, order.shipmentNo ?? "", order.DeliverStatus ?? "", held),
                }
                updated.push(orders[order.deliveryNo])
            }
            const mergedArr = Object.values(orders)
            sendNewOrders(updated).then(serverTime => { // dont need to send full orders array, just the updated orders, server will merge and return new timestamp
                set({
                    orders,
                    groupedOrders: groupOrders(mergedArr),
                    ordersTimestamp: serverTime,
                })
            })
            useCustomerStore.getState().upsertCustomersFromOrders(updated)
        },

        salesOrderLines: [],
        setSalesOrderLines: (salesOrderLines) => set({ salesOrderLines }),

        setProductMaster: (productMaster) => set({ productMaster }),


        splitOrder: (orderId: string) => {
            set((state) => {
                let groupId;
                const hash = Date.now();
                const orders = { ...state.orders };
                const order = orders[orderId];
                let changed = false;
                if (order) {
                    groupId = order.groupId;
                    orders[orderId] = {
                        ...order,
                        groupId: `${groupId}-${hash}`
                    };
                    changed = true;
                }
                if (changed) {
                    sendNewOrders(Object.values(orders));
                }
                return { orders, groupedOrders: groupOrders(Object.values(orders)) };
            });
        },

        joinOrders: (sourceOrderId: string, targetGroupId: string) => {
            set((state) => {
                const orders = { ...state.orders };
                let changed = false;
                if (orders[sourceOrderId]) {
                    orders[sourceOrderId] = { ...orders[sourceOrderId], groupId: targetGroupId };
                    changed = true;
                }
                if (changed) {
                    sendNewOrders(Object.values(orders));
                }
                console.log("Joining orders", sourceOrderId, "into", targetGroupId);
                return { orders, groupedOrders: groupOrders(Object.values(orders)) };
            });
        },

        holdGroup: (groupId: string, held: boolean, reason?: "backorder" | "small_order") => {
            set((state) => {
                const orders = { ...state.orders };
                let changed = false;
                const updated = [];
                for (const key in orders) {
                    if (orders[key].groupId === groupId) {
                        orders[key] = {
                            ...orders[key],
                            status: deriveStatus(orders[key].comments, orders[key].shipmentNo ?? "", orders[key].DeliverStatus ?? "", held),
                            holdReason: reason
                        };
                        updated.push(orders[key]);
                        changed = true;
                    }
                }
                if (changed) {
                    sendNewOrders(updated);
                }
                return { orders, groupedOrders: groupOrders(Object.values(orders)) };
            });
        },

        changePickupType: (groupId: string, pickupType: "courier" | "pickup" | "delivery") => {
            set((state) => {
                const orders = { ...state.orders };
                let changed = false;
                const updated = [];
                for (const key in orders) {
                    if (orders[key].groupId === groupId) {
                        orders[key] = { ...orders[key], pickupType };
                        changed = true;
                        updated.push(orders[key]);
                    }
                }
                if (changed) {
                    sendNewOrders(updated);
                }
                return { orders, groupedOrders: groupOrders(Object.values(orders)) };
            });
        },

        setPickupPlan: (groupId: string, plan: PickupPlan) => {// used by GUI, dont need to check if from server
            updateSinglePickup(plan).then(serverTime => {
                set(state => ({
                    pickupPlans: {
                    ...state.pickupPlans,
                    [groupId]: plan
                    },
                    pickupPlansTimestamp: serverTime
                })
            )})},

        setPickups: (plans: PickupPlan[], time: number) => // Internal, onyl used when fetching full pickup plans from server
            set(({
                pickupPlans: plans.reduce((acc, plan) => ({ ...acc, [plan.groupId]: plan }), {}),
                pickupPlansTimestamp: time
            }))
        }),
        {
            name: 'orders-storage',
            partialize: (state) => ({
                orders: state.orders,
                salesOrderLines: state.salesOrderLines,
                pickupPlans: state.pickupPlans,
                ordersTimestamp: state.ordersTimestamp,
                pickupPlansTimestamp: state.pickupPlansTimestamp
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.orders) {
                    state.groupedOrders = groupOrders(Object.values(state.orders))
                }
            },
            version: 0.3,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            migrate: (persistedState:any, version) => {
                switch(version) {
                    case 0:
                        persistedState.orders = ChangeFormat(persistedState.orders);
                    // falls through
                    case 0.1: // in version 0.1, we didnt derive status after updating other fields
                        persistedState.orders = persistedState.orders.map((order: Order) => ({
                            ...order,
                            status: deriveStatus(order.comments, order.shipmentNo ?? "", order.DeliverStatus ?? "", order.status === "held"),
                        }))
                    // falls through
                    case 0.2: // in version 0.2, orders were stored as array, we change to object for faster access
                        persistedState.orders = Object.fromEntries(persistedState.orders.map((order: Order) => [order.deliveryNo, order]))
                    // falls through
                    case 0.3: // in version 0.3, we might have additional changes
                        // No changes needed for this version
                }
                return persistedState
            }
        }
    )
)