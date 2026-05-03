import React from 'react'
import './StatsCards.css'
import { Droppable } from '../Dashboard/Droppable'
import OrdersTable from '../OrdersTable/OrdersTable'

interface SalesRepProps {
  id: string
}

const SalesRep: React.FC<SalesRepProps> = ({ id }) => {

  const title = "Sales Rep Pickups"

  const cols: ColumnConfig[] = [
    { key: 'customer', label: 'Customer', width: '50%' },
    { key: 'orders', label: 'Orders' },
    { key: 'deliverDate', label: 'Delivery Date', date: true },
  ]

  return (
    <Droppable id={id}>
      <div className="stats-card">
        <div className="card-header">
          <span className="card-icon">🚚</span>
          <h3 className="card-title">{title}</h3>
        </div>
        <OrdersTable id={id} mode={{ draggable: true, columns: cols, filter: (order) => order.pickupType === 'pickup', offset: 35 }} />
    </div>
    </Droppable>
  )
}

export default SalesRep