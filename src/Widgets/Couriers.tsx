import React from 'react'
import './StatsCards.css'
import { Droppable } from '../Dashboard/Droppable'
import OrdersTable from '../OrdersTable/OrdersTable'

interface CouriersProps {
  id: string
}

const Couriers: React.FC<CouriersProps> = ({ id }) => {

  const title = "Couriers"
  const cols: ColumnConfig[] = [
    { key: 'customer', label: 'Customer', link: true, width: '1fr' },
    { key: 'totalWeight', label: 'Weight' },
    { key: 'totalVolume', label: 'Volume' },
    { key: 'deliverDate', label: 'Delivery Date', date: true , width: '115px'},
  ]
  const filter = (order: GroupedOrder) => order.pickupType === 'courier'

  return (
    <Droppable id={id}>
      <div className="stats-card">
        <div className="card-header">
          <span className="card-icon">🚚</span>
          <h3 className="card-title">{title}</h3>
        </div>
        <OrdersTable id={id} mode={{ draggable: true, columns: cols, filter }}/>
    </div>
    </Droppable>
  )
}

export default Couriers