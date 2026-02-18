import React from 'react'
import './OrdersTable.css'
import { filterOrder } from '../Dashboard/filter'
import { Draggable } from '../Dashboard/Draggable'
import { Droppable } from '../Dashboard/Droppable'
import { useOrdersStore } from '../Stores/OrdersStore'

interface props {
  filter?: Filter
  scrollTop?: number,
  draggable?: boolean
  fullScreen?: boolean
}

const OrdersTable: React.FC<props> = ({ filter, scrollTop, draggable, fullScreen }) => {
  
  const [isDragging, setIsDragging] = React.useState(false);
  
  const { groupedOrders, locations } = useOrdersStore()

  const stickyStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1,
  };

  const content = () => {
    return <div 
        style={{borderRadius: fullScreen ? '0' : '8px'}} 
        className="table-container"
        onScroll={(e) => {
          if (isDragging) {
            e.currentTarget.scrollTop = scrollTop || 0;
          }
      }}>
        <table className="orders-table">
          <thead>
            <tr style={fullScreen ? stickyStyle : {}}>
              {draggable && <th style={{padding:"0"}}></th>}
              <th>Customer Name <span className="sort-icon">↕️</span></th>
              <th>Total Pallets <span className="sort-icon">↕️</span></th>
              <th>Variance <span className="sort-icon">↕️</span></th>
              <th>Weight (kg) <span className="sort-icon">↕️</span></th>
              <th>Volume (m3) <span className="sort-icon">↕️</span></th>
              <th># Orders <span className="sort-icon">↕️</span></th>
              <th>Delivery Date <span className="sort-icon">↕️</span></th>
            </tr>
          </thead>
          <tbody>
            {groupedOrders.map((order, index) => {
              if ((filter && !filterOrder(order, filter)) || (locations && locations[order.groupId] !== 0)) {
                return null;
              }
              return draggable ? (
                <Draggable setIsDragging={setIsDragging} key={index} id={order.groupId}>
                    <td className="customer-name">{order.customer}</td>
                    <td>{order.totalPallets}</td>
                    <td>
                      {order.palletsVarience !== null && order.palletsVarience !== undefined && order.palletsVarience !== 0 && (
                        <span className={`variance ${order.palletsVarience > 0 ? 'positive' : 'negative'}`}>
                          {order.palletsVarience > 0 ? '+' : ''}{order.palletsVarience}
                        </span>
                      )}
                      {order.palletsVarience === 0 && <span className="variance neutral">0</span>}
                    </td>
                    <td>{order.totalWeight.toLocaleString()}</td>
                    <td>{order.totalVolume}</td>
                    <td>{order.orders.length}</td>
                    <td>{order.deliverDate}</td>
                </Draggable>
              ) : (
                <tr key={index} id={order.groupId}>
                    <td className="customer-name">{order.customer}</td>
                    <td>{order.totalPallets}</td>
                    <td>
                      {order.palletsVarience !== null && order.palletsVarience !== undefined && order.palletsVarience !== 0 && (
                        <span className={`variance ${order.palletsVarience > 0 ? 'positive' : 'negative'}`}>
                          {order.palletsVarience > 0 ? '+' : ''}{order.palletsVarience}
                        </span>
                      )}
                      {order.palletsVarience === 0 && <span className="variance neutral">0</span>}
                    </td>
                    <td>{order.totalWeight.toLocaleString()}</td>
                    <td>{order.totalVolume}</td>
                    <td>{order.orders.length}</td>
                    <td>{order.deliverDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  }

  if (draggable) {
    return (
      <Droppable id="0">
        {content()}
      </Droppable>
    )
  }
  return content()
}

export default OrdersTable
