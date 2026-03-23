import React from 'react'
import './StatsCards.css'
import { useVisibleOrders } from '../Data/GroupOrders'
import { useUIStore } from '../Stores/UIStore'
import { displayDate } from '../Data/Dates'
import { displayLongText } from '../Data/utils'

interface NotPickedProps {
  id: string
}

const NotPicked: React.FC<NotPickedProps> = ({ id }) => {

    const title = "Not Picked Orders"
    const orders = useVisibleOrders(id, (order) => order.status === "picking")
    const setSort = useUIStore(s => s.setTableSort) 

    return (
        <div className="stats-card">
            <div className="card-header">
                <span className="card-icon">🚚</span>
                <h3 className="card-title">{title}</h3>
            </div>
            <div className="card-content">
                <table className="table">
                <thead>
                    <tr>
                        <th onClick={() => setSort(title, "customer")}>Customer</th>
                        <th onClick={() => setSort(title, "ordersCount")}># Orders</th>
                        <th onClick={() => setSort(title, "totalPallets")}>Pallets</th>
                        <th onClick={() => setSort(title, "deliverDate")}>Delivery Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => {
                        return (
                            <tr key={order.groupId}>
                                <td className="stat-label">{displayLongText(order.customer, 20)}</td>
                                <td className="stat-value">{order.orders.length}</td>
                                <td className="stat-value">{order.totalPallets}</td>
                                <td className="stat-value">{displayDate(order.deliverDate)}</td>
                            </tr>
                        );
                    })}
                </tbody>
                </table>
            </div>
        </div>
    )
}

export default NotPicked