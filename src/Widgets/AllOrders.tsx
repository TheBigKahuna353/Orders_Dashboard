import React from 'react'
import './StatsCards.css'
import OrdersTable from '../OrdersTable/OrdersTable'

interface AllOrdersProps {
  id: string
}

const cols: ColumnConfig[] = [
    { key: 'customer', label: 'Customer', link: true, width: '2fr' },
    { key: 'totalPallets', label: 'Pallets' },
    { key: 'totalWeight', label: 'Weight' },
    { key: 'totalVolume', label: 'Volume' },
    { key: 'orders', label: 'Orders' },
    { key: 'status', label: 'Status', capitalize: true },
    { key: 'deliverDate', label: 'Delivery Date', date: true }
  ]

const AllOrders: React.FC<AllOrdersProps> = ({ id }) => {


  return (
      <div className="stats-card">
          <OrdersTable id={id} mode={{ draggable: true, columns: cols }}/>
    </div>
  )
}

export default AllOrders