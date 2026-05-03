import React from 'react'
import './StatsCards.css'
import OrdersTable from '../OrdersTable/OrdersTable'

interface NotPickedProps {
  id: string
}

const NotPicked: React.FC<NotPickedProps> = ({ id }) => {

    const title = "Not Picked Orders"
    const cols: ColumnConfig[] = [
        { key: 'customer', label: 'Customer', link: true, width: '1fr' },
        { key: 'totalPallets', label: 'Pallets', width: '70px' },
        { key: 'deliverDate', label: 'Delivery Date', date: true , width: '115px'},
    ]
    const filter = (order: GroupedOrder) => order.status === 'picking';

    return (
        <div className="stats-card">
            <div className="card-header">
                <span className="card-icon">🚚</span>
                <h3 className="card-title">{title}</h3>
            </div>
            <OrdersTable id={id} mode={{ columns: cols, filter, offset: 35 }}/>
        </div>
    )
}

export default NotPicked