import React from 'react'
import './StatsCards.css'
import { Droppable } from '../Dashboard/Droppable'
import OrdersTable from '../OrdersTable/OrdersTable'

interface HeldProps {
    id: string
}

const Held: React.FC<HeldProps> = ({ id }) => {

    const title = "Held Orders"

    const cols: ColumnConfig[] = [
        { key: 'customer', label: 'Customer' },
        { key: 'ordersCount', label: '# Orders' },
        { key: 'totalVolume', label: 'Volume' },
        { key: 'deliverDate', label: 'Delivery Date' },
    ]

    return (
        <Droppable id={id}>
            <div className="stats-card">
                <div className="card-header">
                    <span className="card-icon">🚚</span>
                    <h3 className="card-title">{title}</h3>
                </div>
                <OrdersTable id={id} mode={{ draggable: true, columns: cols, filter: (order) => order.status === 'held' }} />
            </div>
        </Droppable>
    )
}

export default Held