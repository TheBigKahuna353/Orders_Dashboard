import React from 'react'
import './StatsCards.css'
import { Droppable } from '../Dashboard/Droppable'
import { Draggable } from '../Dashboard/Draggable'
import { useVisibleOrders } from '../Data/GroupOrders'
import { useUIStore } from '../Stores/UIStore'
import { displayDate } from '../Data/Dates'
import { displayLongText } from '../Data/utils'

interface CouriersProps {
  id: string
}

const Couriers: React.FC<CouriersProps> = ({ id }) => {

  const title = "Couriers"
  const orders = useVisibleOrders(title, (order) => order.pickupType === "courier")
  const setSort = useUIStore(s => s.setTableSort) 

  return (
    <Droppable id={id}>
      <div className="stats-card">
        <div className="card-header">
          <span className="card-icon">🚚</span>
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-content">
          <table className="table">
            <thead>
              <tr>
                <th className='dragCol'></th>
                <th onClick={() => setSort(title, "customer")}>Customer</th>
                <th onClick={() => setSort(title, "totalWeight")}>Weight</th>
                <th onClick={() => setSort(title, "totalVolume")}>Volume</th>
                <th onClick={() => setSort(title, "deliverDate")}>Delivery Date</th>
                <th onClick={() => setSort(title, "ordersCount")}># Orders</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                return (
                  <Draggable key={index} id={order.groupId+':5'} table>
                    <td className="stat-label">{displayLongText(order.customer, 20)}</td>
                    <td className="stat-value">{order.totalWeight}</td>
                    <td className="stat-value">{order.totalVolume}</td>
                    <td className="stat-value">{order.orders.length}</td>
                    <td className="stat-value">{displayDate(order.deliverDate)}</td>
                  </Draggable>
                );
              })}
            </tbody>
          </table>
        </div>
    </div>
    </Droppable>
  )
}

export default Couriers