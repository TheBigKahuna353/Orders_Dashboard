import React from 'react'
import './StatsCards.css'
import { Droppable } from './Droppable'
import { Draggable } from './Draggable'
import { useOrdersStore } from '../Stores/OrdersStore'

interface StatsCardsProps {
  rowSpan?: number
  colSpan?: number
  id: string
  title: string
}

const StatsCards: React.FC<StatsCardsProps> = ({ id, title }) => {

  const { groupedOrders, locations } = useOrdersStore()

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
              <th></th>
              <th>Customer</th>
              <th># Orders</th>
            </thead>
            <tbody>
              {groupedOrders.map((order, index) => {
                if (locations[order.groupId] !== Number(id)) {
                  return null;
                }
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
