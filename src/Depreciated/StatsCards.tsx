import React from 'react'
import './StatsCards.css'
import { Droppable } from '../Dashboard/Droppable'
import { Draggable } from '../Dashboard/Draggable'
import { useVisibleOrders } from '../Data/GroupOrders'
import { useUIStore } from '../Stores/UIStore'

interface StatsCardsProps {
  id: string
  title: string
}

const StatsCards: React.FC<StatsCardsProps> = ({ id, title }) => {

  const orders = useVisibleOrders(title) // DEPRECIATED, DOES NOT WORK WITH LOCATION FILTER, NEEDS TO BE REPLACED WITH EXTRA FILTER VERSION
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
                <th></th>
                <th onClick={() => setSort(title, "customer")}>Customer</th>
                <th onClick={() => setSort(title, "ordersCount")}># Orders</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                return (
                  <Draggable key={index} id={order.groupId}>
                    <td className="stat-label">{order.customer}</td>
                    <td className="stat-value">{order.orders.length}</td>
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

export default StatsCards
