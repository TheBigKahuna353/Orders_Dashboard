
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sendInbound, updateInbound } from '../Data/server'





type InboundState = {
    deliveries: InboundDelivery[]
    upsertInboundDeliveries: (deliveries: InboundDelivery[]) => void
    setInboundDeliveries: (deliveries: InboundDelivery[], timestamp: number) => void
    timestamp: number
}

export const useInboundStore = create<InboundState>()(
    persist(
        (set) => ({
            deliveries: [],
            timestamp: 1,
            upsertInboundDeliveries: (deliveries: InboundDelivery[]) => {
                updateInbound(deliveries).then(serverTime => {
                    set((state: InboundState) => {            
                    const updated = [...state.deliveries, ...deliveries]
                    return { deliveries: updated, timestamp: serverTime }
                })})   
                },

            setInboundDeliveries: (deliveries: InboundDelivery[], timestamp: number) => {
                if (!timestamp) {
                    sendInbound(deliveries).then(serverTime => {
                        set(() => ({
                            deliveries,
                            timestamp: serverTime
                        }))
                    })
                    return
                }
                set(() => ({
                    deliveries,
                    timestamp
                }))
            }
        }),
        {
             name: 'Inbound-storage',
                partialize: (state) => ({
                    deliveries: state.deliveries,
                    timestamp: state.timestamp
                }),
        }
    )
)