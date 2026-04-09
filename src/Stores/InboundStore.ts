import { create } from 'zustand'
import { persist } from 'zustand/middleware'





type InboundState = {
    deliveries: InboundDelivery[]
    upsertInboundDeliveries: (deliveries: InboundDelivery[]) => void
    setInboundDeliveries: (deliveries: InboundDelivery[]) => void
}

export const useInboundStore = create<InboundState>()(
    persist(
        (set) => ({
            deliveries: [],
            upsertInboundDeliveries: (deliveries: InboundDelivery[]) =>
                set((state: InboundState) => {            
                    const updated = [...state.deliveries, ...deliveries]
                    return { deliveries: updated }
                }),
            setInboundDeliveries: (deliveries: InboundDelivery[]) =>
                set(() => ({
                    deliveries
                }))
        }),
        {
             name: 'Inbound-storage',
                partialize: (state) => ({
                    deliveries: state.deliveries
                }),
        }
    )
)