import React, { useEffect, useState } from 'react'
import './OrdersTable.css'
import { Draggable } from '../Dashboard/Draggable'
import { Droppable } from '../Dashboard/Droppable'
import { useVisibleOrders } from '../Data/GroupOrders'
import { useUIStore } from '../Stores/UIStore'
import { MdChevronRight, MdExpandMore } from 'react-icons/md'
import { useOrdersStore } from '../Stores/OrdersStore'
import { Capitalize } from '../Data/utils'
import { displayDate } from '../Data/Dates'
import { Link } from 'react-router'
import { List, type RowComponentProps } from 'react-window'


type OrdersTableMode = {
  draggable?: boolean
  columns: ColumnConfig[]
  filter?: (order: GroupedOrder) => boolean
  offset?: number
}

function getValueByKey(order: GroupedOrder, key: string): React.ReactNode {
  const value = order[key as keyof GroupedOrder];
  if (Array.isArray(value)) {
    return value.length;
  } else if (typeof value === 'string' || typeof value === 'number' || React.isValidElement(value)) {
    return value;
  } else if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  } else if (value !== undefined && value !== null) {
    return String(value);
  }
  return '';
}

function displayValue(value: React.ReactNode, config: ColumnConfig): React.ReactNode {
  let displayVal: React.ReactNode = value;
  if (config.date && typeof value === 'string') {
    displayVal = displayDate(value);
  } else if (config.capitalize && typeof value === 'string') {
    displayVal = Capitalize(value);
  }
  return displayVal;
}

interface props {
  id: string
  mode?: OrdersTableMode
}

const ROW_HEIGHT = 40; // Adjusted to account for 1px border-bottom and 50px header height

const OrdersTable: React.FC<props> = ({ mode, id }) => {
  const orders = useVisibleOrders(id, mode?.filter);
  const setSort = useUIStore(s => s.setTableSort)
  const { splitOrder, joinOrders } = useOrdersStore()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [closing, setClosing] = useState<Set<string>>(new Set())
  const [mergeSourceOrder, setMergeSourceOrder] = useState<Order | null>(null)
  // navigate removed
  // Dropdown state removed

  document.documentElement.setAttribute('widget', mode?.draggable ? 'true' : 'false');

  const colsWidths = "20px " + (mode?.draggable ? "20px " : "") + mode?.columns.map(col => col.width || '1fr').join(' ');

  function getUrlForOrder(order: GroupedOrder) {
    if (mergeSourceOrder) return "" // disable links when in merge mode to prevent navigation away from the page
    return `/group/${order.groupId.replace(/\//g, '-').replace(/\s/g, '-')}`
  }

  // Dropdown handler removed
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


  // Row renderer for react-window
  const Row = ({ index, style }: RowComponentProps) => {
    const row = flatRows[index];
    if (!row) return null;
    if (row.type === 'main') {
      const order = row.order;
      const isOpen = expandedGroups.has(order.groupId);
      // Dropdown menu removed
      const isMergeTarget = mergeSourceOrder && mergeSourceOrder.customer == order.customer && mergeSourceOrder.groupId !== order.groupId;
      if (isMergeTarget) console.log("Merge source order:", mergeSourceOrder.deliveryNo, "Current order:", order.orders[0].deliveryNo)
      // ---------------------------- Main row for draggable mode --------------------
      if (mode?.draggable) {
        return (
          <div style={style} key={order.groupId}>
            <Draggable
              id={order.groupId + ':' + mode.columns.length} // now 7 columns
              isMergeTarget={isMergeTarget}
              className='table-row'
              onClick={() => {
                if (mergeSourceOrder) {
                  joinOrders(mergeSourceOrder.deliveryNo, order.orders[0].groupId)
                  setMergeSourceOrder(null)
                }
              }}
            >
              <span className="table-row-col toggle-col"
                onClick={() => toggleGroup(order.groupId)}
              >
                {isOpen ? <MdExpandMore /> : <MdChevronRight />}
              </span>
              {mode.columns.map(col => {
                const value = getValueByKey(order, col.key);
                if (col.link) {
                  return (
                    <Link className='table-row-col' to={getUrlForOrder(order)} key={col.key}>
                      <span>{displayValue(value, col)}</span>
                    </Link>
                  );
                }
                return <span key={col.key} className='table-row-col'>{displayValue(value, col)}</span>;
              })}
            </Draggable>
          </div>
        );
      } else { // ---------------------------- Main row for non-draggable mode --------------------
        return (
          <div style={style} key={order.groupId}>
            <div className={`table-row ${isMergeTarget ? 'merge-target' : ''}`} onClick={() => {
                if (mergeSourceOrder) {
                  joinOrders(mergeSourceOrder.deliveryNo, order.orders[0].groupId)
                  setMergeSourceOrder(null)
                }
              }}>
              <div className="table-row-col toggle-col" onClick={() => toggleGroup(order.groupId)}>
                {isOpen ? <MdExpandMore /> : <MdChevronRight />}
              </div>
              {mode?.columns.map(col => {
                const value = getValueByKey(order, col.key);
                if (col.link) {
                  return (
                    <Link className='table-row-col' to={getUrlForOrder(order)} key={col.key}>
                      <span>{displayValue(value, col)}</span>
                    </Link>
                  );
                }
                return <span key={col.key} className='table-row-col'>{displayValue(value, col)}</span>;
              })}
            </div>
          </div>
        );
      }
      // ---------------------------- Detail row ------------------
    } else if (row.type === 'detail' && row.detailOrder) {
      const o = row.detailOrder;
      return (
        <div style={style} key={o.deliveryNo}>
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
              <div>PO: {o.PO}</div>
              <button onClick={() => splitOrder(o.deliveryNo)}>
                Split
              </button>
              <button
                onClick={() => {
                  if (mergeSourceOrder?.deliveryNo === o.deliveryNo) {
                    setMergeSourceOrder(null)
                  } else {
                    setMergeSourceOrder(o)
                    console.log("Set merge source order:", o)
                  }
                }}
              >
                Merge
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Table headers
  const headers = (
    <div className="header-row" style={{width: '100%', position: 'sticky', top: 0, zIndex: 2}}>
      <span className='table-row-col'></span> {/* for expand/collapse icon */}
      {mode?.draggable && <span className='table-row-col'></span>}{/* for drag handle */}
      {mode?.columns.map(col => (
        <span key={col.key} onClick={() => setSort(id, col.key)} className='table-row-col'>{col.label}</span>
      ))}
    </div>
  );

  // Unified scroll container for horizontal scroll
  const unifiedScroll = (
    <div style={{ width: '100%', height: '100%', overflowY: 'hidden' }}>
      <div style={{ minWidth: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, minHeight: 0, height: '80%', overflowY: 'hidden', overflowX: 'auto', width: '100%',
          ['--orders-grid-columns' as string]: colsWidths
         }}>
          {headers}
          <List
            rowComponent={Row}
            rowCount={flatRows.length}
            rowHeight={ROW_HEIGHT}
            rowProps={{}}
            style={{height: `calc(100% - ${50 + (mode?.offset || 0)}px)`}}  // for some reason 50px is the magic number to make it fit perfectly without cutting off the last row or leaving extra space at the bottom
          >
          </List>
        </div>
      </div>
    </div>
  );

  if (mode?.draggable) {
    return (
      <Droppable id={id} >
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
