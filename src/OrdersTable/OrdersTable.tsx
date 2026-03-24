import React, { useEffect, useState } from 'react'
import './OrdersTable.css'
import { Draggable } from '../Dashboard/Draggable'
import { Droppable } from '../Dashboard/Droppable'
import { useVisibleOrders } from '../Data/GroupOrders'
import { useUIStore } from '../Stores/UIStore'
import { MdChevronRight, MdExpandMore } from 'react-icons/md'
import { useOrdersStore } from '../Stores/OrdersStore'
import { Capitalize, displayLongText } from '../Data/utils'
import { displayDate } from '../Data/Dates'
import { useNavigate } from 'react-router'
import { List, type RowComponentProps } from 'react-window'
import { createPortal } from 'react-dom'

interface props {
  id: string
  widget?: boolean // when true, acts like draggable and not fullscreen
}

const ROW_HEIGHT = 56;

const OrdersTable: React.FC<props> = ({ widget, id }) => {
  const filter = (order: GroupedOrder) => order.status !== 'held' && order.pickupType === "delivery"
  const orders = useVisibleOrders(id, widget ? filter : undefined)
  const setSort = useUIStore(s => s.setTableSort)
  const { splitOrder, joinOrders } = useOrdersStore()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [closing, setClosing] = useState<Set<string>>(new Set())
  const [mergeSourceOrder, setMergeSourceOrder] = useState<Order | null>(null)
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = React.useState<boolean[]>(new Array(orders.length).fill(false));
  const [dropdownPos, setDropdownPos] = useState<{ [key: number]: { x: number, y: number } }>({});

  document.documentElement.setAttribute('widget', widget ? 'true' : 'false');

  const handleDropdown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDropdownPos(prev => ({ ...prev, [index]: { x: rect.left, y: rect.bottom } }));
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
  useEffect(() => {
    if (!dropdownOpen.some(open => open)) return;
    const onClick = () => setDropdownOpen(prev => prev.map(() => false));
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [dropdownOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape")
        setMergeSourceOrder(null)
    }
    window.addEventListener("keydown", handleEscape)
    return () =>
      window.removeEventListener("keydown", handleEscape)
  }, [])

  // Compose a flat list of rows for react-window
  const flatRows = [] as { type: 'main' | 'detail', order: GroupedOrder, detailOrder?: Order, index: number }[];
  orders.forEach((order, index) => {
    flatRows.push({ type: 'main', order, index });
    if (expandedGroups.has(order.groupId)) {
      order.orders.forEach(detailOrder => {
        flatRows.push({ type: 'detail', order, detailOrder, index });
      });
    }
  });

  function Dropdown({ children, position }: { children: React.ReactNode, position: { x: number, y: number } }) {
  return createPortal(
    <div
      className="dropdown"
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 9999
      }}
    >
      {children}
    </div>,
    document.body
  )
}

  // Row renderer for react-window
  const Row = ({ index, style }: RowComponentProps) => {
    const row = flatRows[index];
    if (!row) return null;
    if (row.type === 'main') {
      const order = row.order;
      const isOpen = expandedGroups.has(order.groupId);
      const isDropdownOpen = dropdownOpen[row.index];
      const dropdownPosition = dropdownPos[row.index];
      const dropdownMenu = isDropdownOpen && dropdownPosition && (
        <Dropdown position={dropdownPosition}>
          <div className="order-action-dropdown">
            <button onClick={() => { closeDropdown(row.index); navigate(`/group/${order.groupId}`); }}>View</button>
            <button onClick={() => { closeDropdown(row.index); alert(`Delete ${order.customer}`); }}>Delete</button>
          </div>
        </Dropdown>
      );
      const isMergeTarget = mergeSourceOrder && mergeSourceOrder.customer == order.orders[0].customer && mergeSourceOrder.groupId !== order.groupId;
      if (widget) {
        return (
          <div style={style} key={order.groupId}>
            <Draggable
              id={order.groupId + ':8'} // adding suffix for number of columns
              isMergeTarget={isMergeTarget}
              className='table-row'
              onClick={() => {
                if (mergeSourceOrder) {
                  joinOrders(mergeSourceOrder.deliveryNo, order.orders[0].groupId)
                  setMergeSourceOrder(null)
                }
              }}
            >
              <span className="table-row-col"
                onClick={() => toggleGroup(order.groupId)}
                style={{ cursor: "pointer" }}
              >
                {isOpen ? <MdExpandMore /> : <MdChevronRight />}
              </span>
              <span className="table-row-col customer-name">{displayLongText(order.customer, 25)}</span>
              <span className="table-row-col">{order.totalPallets}</span>
              <span className="table-row-col">{order.totalWeight}</span>
              <span className="table-row-col">{order.totalVolume}</span>
              <span className="table-row-col">{order.orders.length}</span>
              <span className="table-row-col">{Capitalize(order.status)}</span>
              <span className="table-row-col">{displayDate(order.deliverDate)}</span>
              <span className="table-row-col" style={{position:'relative'}}>
                <button
                  className="order-action-btn"
                  onClick={(e) => handleDropdown(e, row.index)}
                >
                  More
                </button>
                {dropdownMenu}
              </span>
            </Draggable>
            </div>
        );
      } else {
        return (
          <div style={style} key={order.groupId}>
            <div className={`table-row`} style={{zIndex: dropdownMenu ? 1 : 0}}>
              <div className="customer-name table-row-col" onClick={() => toggleGroup(order.groupId)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                {isOpen ? <MdExpandMore /> : <MdChevronRight />}
                </div>
              <span className='table-row-col'>{order.customer}</span>
              <span className='table-row-col'>{order.totalPallets}</span>
              <span className='table-row-col'>{order.totalWeight}</span>
              <span className='table-row-col'>{order.totalVolume}</span>
              <span className='table-row-col'>{order.orders.length}</span>
              <span className='table-row-col'>{order.status}</span>
              <span className='table-row-col'>{displayDate(order.deliverDate)}</span>
              <span className='table-row-col' style={{position:'relative'}}>
                <button style={{zIndex: 0}} onClick={(e) => handleDropdown(e, row.index)}>
                  More
                </button>
                {dropdownMenu}
              </span>
            </div>
          </div>
        );
      }
    } else if (row.type === 'detail' && row.detailOrder) {
      const o = row.detailOrder;
      return (
        <div style={style} key={o.deliveryNo}>
          <tr className="expand-detail-row">
            <td style={{ padding: 0 }}/>
            {widget && <td style={{ padding: 0 }}/>} 
            <td colSpan={7} style={{ padding: 0 }}>
              <div className={
                closing.has(row.order.groupId)
                  ? "expand-wrapper closing"
                  : "expand-wrapper"
              }>
                <div className="expand-content">
                  <div>Order: {o.deliveryNo}</div>
                  <div>Pallets: {o.pallets}</div>
                  <div>Weight: {o.weight}</div>
                  <div>Volume: {o.volume}</div>
                  <div>Status: {o.status}</div>
                  <button onClick={() => splitOrder(o.deliveryNo)}>
                    Split
                  </button>
                  <button
                    onClick={() => {
                      if (mergeSourceOrder?.deliveryNo === o.deliveryNo) {
                        setMergeSourceOrder(null)
                      } else {
                        setMergeSourceOrder(o)
                      }
                    }}
                  >
                    Merge
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </div>
      );
    }
    return null;
  };

  // Table headers
  const headers = (
    <div className="header-row" style={{minWidth: '100%', width: 'max-content', position: 'sticky', top: 0, zIndex: 2, height: "60px"}}>
      <span className='table-row-col'></span>
      {widget && <span className='table-row-col'></span>}
      <span onClick={() => setSort(id, 'customer')}  className='table-row-col'>Customer</span>
      <span onClick={() => setSort(id, 'totalPallets')}  className='table-row-col'>Pallets</span>
      <span onClick={() => setSort(id, 'totalWeight')}  className='table-row-col'>Weight</span>
      <span onClick={() => setSort(id, 'totalVolume')}  className='table-row-col'>Volume</span>
      <span onClick={() => setSort(id, 'orders')}  className='table-row-col'># Orders</span>
      <span onClick={() => setSort(id, 'status')}  className='table-row-col'>Status</span>
      <span onClick={() => setSort(id, 'deliverDate')}  className='table-row-col'>Deliver Date</span>
      <span className='table-row-col'>Action</span>
    </div>
  );

  // Unified scroll container for horizontal scroll
  const unifiedScroll = (
    <div style={{ width: '100%', height: '100%', overflowY: 'hidden' }}>
      <div style={{ minWidth: '100%', width: 'max-content', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, minHeight: 0, height: '80%', overflowY: 'hidden', overflowX: 'auto', width: '100%' }}>
          {headers}
          <List
            rowComponent={Row}
            rowCount={flatRows.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{}}
            style={{height: "calc(100% - 60px)"}}  // for some reason 60px is the magic number to make it fit perfectly without cutting off the last row or leaving extra space at the bottom
          >
          </List>
        </div>
      </div>
    </div>
  );

  if (widget) {
    return (
      <Droppable id="orders">
        <div className="orders-table-content" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          {unifiedScroll}
        </div>
      </Droppable>
    )
  }
  return (
    <div className="orders-table-content" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      {unifiedScroll}
    </div>
  )
}

export default OrdersTable
