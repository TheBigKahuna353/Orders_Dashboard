import React from 'react'
import './OrdersTable.css'
import { Draggable } from '../Dashboard/Draggable'
import { Droppable } from '../Dashboard/Droppable'
import { useVisibleOrders } from '../Data/GroupOrders'
import { useUIStore } from '../Stores/UIStore'

interface props {
  scrollTop?: number,
  draggable?: boolean
  fullScreen?: boolean
}

const OrdersTable: React.FC<props> = ({ scrollTop, draggable, fullScreen }) => {
  
  const [isDragging, setIsDragging] = React.useState(false);
  
  const orders = useVisibleOrders("orders-table", 0)
  const setSort = useUIStore(s => s.setTableSort) 
  const tableID = "orders-table";

  const [dropdownOpen, setDropdownOpen] = React.useState<boolean[]>(new Array(orders.length).fill(false));
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
  // Close dropdown on outside click
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
              <th onClick={() => setSort(tableID, "customer")}>Customer Name <span className="sort-icon">↕️</span></th>
              <th onClick={() => setSort(tableID, "totalPallets")}>Total Pallets <span className="sort-icon">↕️</span></th>
              <th onClick={() => setSort(tableID, "totalWeight")}>Weight (kg) <span className="sort-icon">↕️</span></th>
              <th onClick={() => setSort(tableID, "totalVolume")}>Volume (m3) <span className="sort-icon">↕️</span></th>
              <th onClick={() => setSort(tableID, "ordersCount")}># Orders <span className="sort-icon">↕️</span></th>
              <th onClick={() => setSort(tableID, "deliverDate")}>Delivery Date <span className="sort-icon">↕️</span></th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
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
