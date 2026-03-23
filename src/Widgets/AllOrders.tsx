import React from 'react'
import './StatsCards.css'
import OrdersTable from '../OrdersTable/OrdersTable'


interface AllOrdersProps {
  id: string
}

const AllOrders: React.FC<AllOrdersProps> = ({ id }) => {


  return (
      <div className="stats-card">
          <OrdersTable id={id} widget={true}/>
    </div>
  )
}

export default AllOrders