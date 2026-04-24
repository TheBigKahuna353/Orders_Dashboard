/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react';
import {DndContext, pointerWithin, DragOverlay} from '@dnd-kit/core';

import Header from '../Bars/Header.tsx'
import GridItem from '../Layout/GridItem.tsx';
import { PrimeReactProvider } from 'primereact/api';

import './Dashboard.css'
import { onCSVUpload } from '../Data/import_ecargo.ts';
import { MdDragIndicator } from 'react-icons/md';

import { useOrdersStore } from '../Stores/OrdersStore.ts';
import { useUIStore } from '../Stores/UIStore.ts';

import { WIDGET_DROP_HANDLERS, WIDGETS } from '../Widgets/Widgets.tsx';
import { displayDate } from '../Data/Dates.ts';
import { GetWidgetById } from '../Layout/Layouts.ts';

const GRID_COLS = 3;
const GRID_ROWS = 3;

function Dashboard() {


    const { groupedOrders } = useOrdersStore()

    const [cur_draggable, setCur_Order] = useState<string | null>(null);
    const [activeOrder, setActiveOrder] = useState<GroupedOrder | null>(null);
    const [dragCols, setDragCols] = useState<number>(0);

    const [editMode, setEditMode] = useState(false)
    const gridRef = useRef<HTMLDivElement>(null)

    const {dashboardLayout, moveWidget} = useUIStore()

    const columnWidth = (gridRef.current?.offsetWidth || 0) / GRID_COLS
    const rowHeight = (gridRef.current?.offsetHeight || 0) / GRID_ROWS

    const import_data = async (file: File, importOption: 'clear' | 'overwrite' | 'add') => {
      if ( !file ) return;
      onCSVUpload(file, importOption);
    }

    const gridStyle: React.CSSProperties = {
      gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`
    }

    const heightCSS: React.CSSProperties = {
      height: `${Math.max(100, Math.round(33.33 * GRID_ROWS))}vh`
    }

    const showFilters = {
      filter: !editMode,
      date: !editMode,
      addWidget: editMode,
      search: !editMode
    };

    return (
      <PrimeReactProvider>
      <DndContext 
        autoScroll={false}
        onDragEnd={handleDragEnd} 
        onDragStart={handleDragStart}
        onDragCancel={() => {
          setCur_Order(null)
          setActiveOrder(null)
        }}
        collisionDetection={pointerWithin}>
          <DragOverlay className='dragOverlay'
            >
          {activeOrder ? (
            <div className='dragRow' style={{gridTemplateColumns: `20px repeat(${dragCols}, 1fr)`}}>
              <MdDragIndicator size={24}/>
              {dragCols > 0 && <div>{activeOrder.customer}</div>}
              {dragCols > 5 && <div>{activeOrder.totalPallets}</div>}
              {dragCols > 4 && <div>{activeOrder.totalWeight}</div>}
              {dragCols > 3 && <div>{activeOrder.totalVolume}</div>}
              {dragCols > 2 && <div>{activeOrder.orders.length}</div>}
              {dragCols > 6 && <div>{activeOrder.status}</div>}
              {dragCols > 1 && <div>{displayDate(activeOrder.deliverDate)}</div>}
            </div>
          ) : null}
        </DragOverlay>


        <div className="dashboard" style={heightCSS}>
          <main className="main-content">
            <Header onImportClick={import_data} setEditMode={setEditMode} showFilters={showFilters}/>
            <div className="dash-content" ref={gridRef} style={gridStyle}>
              {dashboardLayout.map((widget: DashboardWidget) => {
                if (editMode) {
                  return <GridItem key={widget.id} widget={widget} editMode={editMode} ROW_HEIGHT={rowHeight} COL_WIDTH={columnWidth} />;
                }
                const WidgetComponent = WIDGETS[widget.type];
                // send all props to the widget component, they only accept what they need
                return (
                  <GridItem key={widget.id} widget={widget}>
                    <WidgetComponent id={widget.id} />
                  </GridItem>
                )
                  
              })}
            </div>
          </main>
        </div>
      </DndContext>
      </PrimeReactProvider>
    )

    function handleDragEnd(event: any) {
      console.log('Drag ended:', event);
      
      if (editMode) {
        const {active, delta} = event

        const id = active.id
        const colDelta = Math.round(delta.x / columnWidth)
        const rowDelta = Math.round(delta.y / rowHeight)
        const widget = dashboardLayout.find(w => w.id === id)
        if (widget) {
          // cols and rows start at 1, so we need to add 1 to the new position
          const newCol = Math.max(1, Math.min(GRID_COLS - widget.colSpan + 1, widget.col + colDelta))
          const newRow = Math.max(1, Math.min(GRID_ROWS - widget.rowSpan + 1, widget.row + rowDelta))
          console.log(`Moving widget ${id} to Col: ${newCol}, Row: ${newRow}`)
          moveWidget(id, newCol, newRow)
        }
      }
      if (event.over) {
          const droppableId = event.over.id
            console.log(cur_draggable + ' dropped in droppable with id:', droppableId);
            const w = GetWidgetById(dashboardLayout, droppableId)
            console.log("Dropping on widget:", w)
            const handler = WIDGET_DROP_HANDLERS[w?.type as WIDGET_NAMES]
            if (handler && cur_draggable) {
              handler(cur_draggable)
            }
            setCur_Order(null);
            setActiveOrder(null);
        }
    }


    function handleDragStart(event: any) {
      const [id, cols] = (event.active.id as string).split(':');
      setCur_Order(id);
      document.body.style.overflow = "hidden"

      const order = groupedOrders.find(o => o.groupId === id);
      setActiveOrder(order ?? null);

      console.log("Drag started for", id, "with cols", cols)
      setDragCols(parseInt(cols) ?? 0)

  }
}
export default Dashboard
