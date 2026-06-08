import React from 'react'
import './StatsCards.css'
import OrdersTable from '../OrdersTable/OrdersTable'
import { useUIStore } from '../Stores/UIStore'

interface NotPickedProps {
  id: string
}

const NotPicked: React.FC<NotPickedProps> = ({ id }) => {

    const title = "Not Picked Orders"
    const settings = useUIStore(state => state.widgetSettings[id])
    const filter = (order: GroupedOrder) => order.status === 'picking';

    if (!settings) {
        return null
    }

    return (
        <div className="stats-card">
            <div className="card-header">
                <span className="card-icon">🚚</span>
                <h3 className="card-title">{title}</h3>
            </div>
            <OrdersTable id={id} settings={settings} mode={{ draggable: true, filter, offset: 35 }}/>
        </div>
    )
}

export default NotPicked