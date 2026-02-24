import { create } from 'zustand'
import { persist } from 'zustand/middleware'





type CycleCountState = {
    recordMaster: Record<string, CycleCountRecord>

    upsertRecordsFromExcel: (records: CycleCountRecord[]) => void
    updateRecord: (material: string, updatedRecord: Partial<CycleCountRecord>
    ) => void
}

export const useCycleCountStore = create<CycleCountState>()(
    persist(
        (set) => ({
            recordMaster: {},
            upsertRecordsFromExcel: (records) =>
                set((state) => {
                    const updated = { ...state.recordMaster }

                    for (const record of records) {
                        updated[record.material + record.countDate] = record
                    }
                    return { recordMaster: updated }
                }),
            updateRecord: (material, updatedRecord) =>
                set((state) => ({
                    recordMaster: {
                        ...state.recordMaster,
                        [material]: {
                            ...state.recordMaster[material],
                            ...updatedRecord
                        }
                    }
                })),
        }),
        {
             name: 'cycle-count-storage',
                partialize: (state) => ({
                    recordMaster: state.recordMaster
                }),
        }
    )
)