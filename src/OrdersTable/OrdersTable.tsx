import React, { useState } from 'react'
import './OrdersTable.css'
import { Draggable } from '../Dashboard/Draggable'
import { Droppable } from '../Dashboard/Droppable'
import { useVisibleOrders } from '../Data/GroupOrders'
import { useUIStore } from '../Stores/UIStore'
import { MdChevronRight, MdExpandMore } from 'react-icons/md'
import { useOrdersStore } from '../Stores/OrdersStore'

interface props {
  scrollTop?: number,
  draggable?: boolean
  fullScreen?: boolean
  isDragging?: boolean
}

const OrdersTable: React.FC<props> = ({ scrollTop, draggable, fullScreen, isDragging }) => {
  
  const orders = useVisibleOrders("orders-table", 0)
  const setSort = useUIStore(s => s.setTableSort) 
  const tableID = "orders-table";
  const { splitOrder } = useOrdersStore()

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [closing, setClosing] = useState<Set<string>>(new Set())

  const [dropdownOpen, setDropdownOpen] = React.useState<boolean[]>(new Array(orders.length).fill(false));
  const handleDropdown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setDropdownOpen(prev => {
      const newOpen = [...prev];
      newOpen[index] = !newOpen[index];
      return newOpen;
    });
  };

  function toggleGroup(groupId: string) {
    if (expandedGroups.has(groupId)) {
    setClosing(prev => new Set(prev).add(groupId))
    setTimeout(() => {
      setExpandedGroups(prev => {
        const next = new Set(prev)
        next.delete(groupId)
        return next

      })
      setClosing(prev => {

        const next = new Set(prev)
        next.delete(groupId)
        return next
      })
    }, 200)
  } else {
    setExpandedGroups(prev => new Set(prev).add(groupId))

  }
}

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
        className={`table-container`}
        onScroll={(e) => {
          if (isDragging) {
            e.currentTarget.scrollTop = scrollTop || 0;
          }
      }}>
        <table className="orders-table">
          <thead>
            <tr style={fullScreen ? stickyStyle : {}}>
              {draggable && <th style={{padding:"0"}}></th>}
              <th style={{padding:"0"}}></th>
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
              const isOpen = expandedGroups.has(order.groupId)

              const dropdownMenu = dropdownOpen[index] && (
                <div className="order-action-dropdown">
                  <button onClick={() => { closeDropdown(index); alert(`Edit ${order.customer}`); }}>Edit</button>
                  <button onClick={() => { closeDropdown(index); alert(`Delete ${order.customer}`); }}>Delete</button>
                </div>
              )

              const mainRow = draggable ? (

                <Draggable
                  key={order.groupId}
                  id={order.groupId}
                >

                  {/* expand button */}
                  <td
                    onClick={() => toggleGroup(order.groupId)}
                    style={{ cursor: "pointer", width: 24 }}
                  >
                    {isOpen ? <MdExpandMore /> : <MdChevronRight />}
                  </td>

                  <td className="customer-name">
                    {order.customer}
                  </td>

                  <td>{order.totalPallets}</td>

                  <td>{order.totalWeight}</td>

                  <td>{order.totalVolume}</td>

                  <td>{order.orders.length}</td>

                  <td>{order.deliverDate}</td>

                  <td style={{position:'relative'}}>

                    <button
                      className="order-action-btn"
                      onClick={(e) => handleDropdown(e, index)}
                    >
                      More
                    </button>

                    {dropdownMenu}

                  </td>

                </Draggable>

              ) : (

                <tr key={order.groupId}>

                  <td onClick={() => toggleGroup(order.groupId)}>
                    {isOpen ? <MdExpandMore /> : <MdChevronRight />}
                  </td>

                  <td>{order.customer}</td>

                  <td>{order.totalPallets}</td>

                  <td>{order.totalWeight}</td>

                  <td>{order.totalVolume}</td>

                  <td>{order.orders.length}</td>

                  <td>{order.deliverDate}</td>

                  <td>
                    <button onClick={(e) => handleDropdown(e, index)}>
                      More
                    </button>

                    {dropdownMenu}

                  </td>

                </tr>

              )

              return (
                <React.Fragment key={order.groupId}>

                  {mainRow}

                  {isOpen && order.orders.map(o => (

                    <tr key={o.deliveryNo} className="expand-detail-row">
                      <td  style={{ padding: 0 }}/>
                      <td  style={{ padding: 0 }}/>

                      <td colSpan={7} style={{ padding: 0 }}>
                        <div className={
                            closing.has(order.groupId)
                              ? "expand-wrapper closing"
                              : "expand-wrapper"
                          }>
                          <div className="expand-content">
                            <div>Order: {o.deliveryNo}</div>
                            <div>Pallets: {o.pallets}</div>
                            <div>Weight: {o.weight}</div>
                            <div>Volume: {o.volume}</div>
                            <div>Status: {o.status}</div>
                             <button
                              className="split-btn"
                              onClick={() => splitOrder(o.deliveryNo)}
                            >
                              Split
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )

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
