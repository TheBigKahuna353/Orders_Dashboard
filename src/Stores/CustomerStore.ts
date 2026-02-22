import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getLeadTime } from '../Data/filter'




type CustomerState = {
    customerMaster: Record<string, CustomerMaster>

    upsertCustomersFromOrders: (orders: Order[]) => void

    updateCustomerLeadTime: (
    customerName: string,
    pickLeadTime: number
    ) => void
}

export const useCustomerStore = create<CustomerState>()(
    persist(
        (set) => ({
            customerMaster: {},
            upsertCustomersFromOrders: (orders) =>
                set((state) => {

                    const updated = { ...state.customerMaster }

                    for (const order of orders) {

                        if (!updated[order.customer]) {

                            updated[order.customer] = {
                                customerName: order.customer,
                                city: order.city,
                                pickLeadTime: getLeadTime(order.customer, order.city)
                            }
                        }
                    }
                    return { customerMaster: updated }
                }),

            updateCustomerLeadTime: (customerName, pickLeadTime) =>
                set((state) => ({
                    customerMaster: {
                        ...state.customerMaster,
                        [customerName]: {
                            ...state.customerMaster[customerName],
                            pickLeadTime
                        }
                    }
                })),
        }),
        {
             name: 'customer-storage',
                partialize: (state) => ({
                    customerMaster: state.customerMaster
                }),
        }
    )
)