import React from 'react'
import './StatsCards.css'
import { Droppable } from '../Dashboard/Droppable'
import OrdersTable from '../OrdersTable/OrdersTable'
import { useUIStore } from '../Stores/UIStore'

interface CouriersProps {
  id: string
}

const Couriers: React.FC<CouriersProps> = ({ id }) => {

  const title = "Couriers"
  const settings = useUIStore(state => state.widgetSettings[id])
  const filter = (order: GroupedOrder) => order.pickupType === 'courier'

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
        <OrdersTable id={id} settings={settings} mode={{ draggable: true, filter }}/>
    </div>
    </Droppable>
  )
}

export default Couriers