import React from 'react'
import './StatsCards.css'
import { Droppable } from '../Dashboard/Droppable'
import OrdersTable from '../OrdersTable/OrdersTable'
import { useUIStore } from '../Stores/UIStore'

interface SalesRepProps {
  id: string
}

const SalesRep: React.FC<SalesRepProps> = ({ id }) => {

  const title = "Sales Rep Pickups"
  const settings = useUIStore(state => state.widgetSettings[id])

  if (!settings) {
    console.warn(`No settings found for widget with id ${id}`)
    return null
  }

  return (
    <Droppable id={id}>
      <div className="stats-card">
        <div className="card-header">
          <span className="card-icon">🚚</span>
          <h3 className="card-title">{title}</h3>
        </div>
        <OrdersTable id={id} settings={settings} mode={{ draggable: true, filter: (order) => order.pickupType === 'pickup', offset: 35 }} />
    </div>
    </Droppable>
  )
}

export default SalesRep