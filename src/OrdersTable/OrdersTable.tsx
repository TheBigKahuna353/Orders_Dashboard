import React from 'react'
import './OrdersTable.css'
import { filterOrder } from '../Data/filter'
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

  const [dropdownOpen, setDropdownOpen] = React.useState<boolean[]>(new Array(groupedOrders.length).fill(false));
  const handleDropdown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setDropdownOpen(prev => {
      const newOpen = [...prev];
      newOpen[index] = !newOpen[index];
      return newOpen;
    });
  };
  const closeDropdown = (index:number) => setDropdownOpen(prev => {
    const newOpen = [...prev];
    newOpen[index] = false;
    return newOpen;
  });
  React.useEffect(() => {
    if (!dropdownOpen.some(open => open)) return;
    const onClick = () => setDropdownOpen(prev => prev.map(() => false));
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [dropdownOpen]);

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
              <th>Weight (kg) <span className="sort-icon">↕️</span></th>
              <th>Volume (m3) <span className="sort-icon">↕️</span></th>
              <th># Orders <span className="sort-icon">↕️</span></th>
              <th>Delivery Date <span className="sort-icon">↕️</span></th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groupedOrders.map((order, index) => {
              if ((filter && !filterOrder(order, filter)) || (locations && locations[order.groupId] !== 0)) {
                return null;
              }
              // Dropdown state for each row
              const dropdownMenu = dropdownOpen[index] && (
                <div className="order-action-dropdown">
                  <button onClick={() => { closeDropdown(index); alert(`Edit ${order.customer}`); }}>Edit</button>
                  <button onClick={() => { closeDropdown(index); alert(`Delete ${order.customer}`); }}>Delete</button>
                </div>
              );
              return draggable ? (
                <Draggable setIsDragging={setIsDragging} key={index} id={order.groupId}>
                  <td className="customer-name">{order.customer}</td>
                  <td>{order.totalPallets}</td>
                  <td>{order.totalWeight.toLocaleString()}</td>
                  <td>{order.totalVolume}</td>
                  <td>{order.orders.length}</td>
                  <td>{order.deliverDate}</td>
                  <td style={{position:'relative'}}>
                    <button className="order-action-btn" onClick={(e: React.MouseEvent) => handleDropdown(e, index)}>
                      More
                    </button>
                    {dropdownMenu}
                  </td>
                </Draggable>
              ) : (
                <tr key={index} id={order.groupId}>
                  <td className="customer-name">{order.customer}</td>
                  <td>{order.totalPallets}</td>
                  <td>{order.totalWeight.toLocaleString()}</td>
                  <td>{order.totalVolume}</td>
                  <td>{order.orders.length}</td>
                  <td>{order.deliverDate}</td>
                  <td style={{position:'relative'}}>
                    <button className="order-action-btn" onClick={(e: React.MouseEvent) => handleDropdown(e, index)}>
                      More
                    </button>
                    {dropdownMenu}
                  </td>
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
