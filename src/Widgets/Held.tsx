import React from 'react'
import './StatsCards.css'
import { Droppable } from '../Dashboard/Droppable'
import OrdersTable from '../OrdersTable/OrdersTable'
import { useUIStore } from '../Stores/UIStore'

interface HeldProps {
    id: string
}

const Held: React.FC<HeldProps> = ({ id }) => {

    const title = "Held Orders"
    const settings = useUIStore(state => state.widgetSettings[id])

    if (!settings) {
        return null
    }

    return (
        <Droppable id={id}>
            <div className="stats-card">
                <div className="card-header">
                    <span className="card-icon">🚚</span>
                    <h3 className="card-title">{title}</h3>
                </div>
                <OrdersTable id={id} settings={settings} mode={{ draggable: true, filter: (order) => order.status === 'held' }} />
            </div>
        </Droppable>
    )
}

export default Held