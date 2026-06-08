import React from 'react'
import './StatsCards.css'
import OrdersTable from '../OrdersTable/OrdersTable'
import { useUIStore } from '../Stores/UIStore'

interface AllOrdersProps {
  id: string
}


const AllOrders: React.FC<AllOrdersProps> = ({ id }) => {

  const settings = useUIStore(state => state.widgetSettings[id])

  if (!settings) {
    return null
  }

  return (
      <div className="stats-card">
          <OrdersTable id={id} settings={settings} mode={{ draggable: true }}/>
    </div>
  )
}

export default AllOrders