/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {DndContext, pointerWithin, DragOverlay} from '@dnd-kit/core';


import Header from '../Bars/Header.tsx'
import OrdersTable from '../OrdersTable/OrdersTable.tsx'
import StatsCards from './StatsCards.tsx'

import GridItem from '../Layout/GridItem.tsx';
import {DASHBOARD_LAYOUTS} from '../Layout/Layouts.ts';

import { PrimeReactProvider } from 'primereact/api';


import './Dashboard.css'
import { onCSVUpload } from '../Data/import_ecargo.ts';
import { MdDragIndicator } from 'react-icons/md';

import { useOrdersStore } from '../Stores/OrdersStore.ts';
import { useUIStore } from '../Stores/UIStore.ts';



function Dashboard() {


    // this array will hold which droppables the orders are in
    // 0 = left column, All orders
    // 1 = right column, orders not being sent today
    // 2 = right column, sales rep pickups
    // 3 = right column, couriers


    const {
      groupedOrders,
      setLocation,
    } = useOrdersStore()

    const [cur_order, setCur_Order] = useState<string | null>(null);
    const [activeOrder, setActiveOrder] = useState<GroupedOrder | null>(null);
    const [overlayWidths, setOverlayWidths] = useState<number[]>([]);
    const [scrollTop, setScrollTop] = useState(0);

    const layout = useUIStore((s) => s.dashboardLayout)
    
    const import_data = async (file: File) => {
      if ( !file ) return;
      onCSVUpload(file);
    }


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
          <DragOverlay className='dragOverlay'>
          {activeOrder ? (
            <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', height : '100%' }}>
              <tbody>
                <tr
                  style={{
                    background: 'var(--bg-panel)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
                    pointerEvents: 'none',
                    padding: 16,
                  }}
                >
                  <td style={{ padding: 0, width: 24 }}>
                    <MdDragIndicator />
                  </td>
                  <td style={{width: overlayWidths[1] || 0}}>{activeOrder.customer}</td>
                  <td style={{width: overlayWidths[2] || 0}}>{activeOrder.totalPallets}</td>
                  <td style={{width: overlayWidths[3] || 0}}>{activeOrder.palletsVarience}</td>
                  <td style={{width: overlayWidths[4] || 0}}>{activeOrder.totalWeight.toLocaleString()}</td>
                  <td style={{width: overlayWidths[5] || 0}}>{activeOrder.totalVolume}</td>
                  <td style={{width: overlayWidths[6] || 0}}>{activeOrder.orders.length}</td>
                  <td style={{width: overlayWidths[7] || 0}}>{activeOrder.deliverDate}</td>
                </tr>
              </tbody>
            </table>
          ) : null}
        </DragOverlay>
        <div className="dashboard">
          <main className="main-content">
            <Header onImportClick={import_data} />
            <div className="dash-content">
              {DASHBOARD_LAYOUTS[layout].map((layout: any) => {
                switch (layout.id) {
                  case 'orders':
                    return (
                      <GridItem key={layout.id} layout={layout}>
                        <OrdersTable 
                          scrollTop={scrollTop} 
                          draggable  />
                      </GridItem>
                    );
                  case 'courier':
                    return (
                      <GridItem key={layout.id} layout={layout}>
                        <StatsCards id="1" title="Courier Pickups" />
                      </GridItem>
                    );
                  case 'sales':
                    return (
                      <GridItem key={layout.id} layout={layout}>
                        <StatsCards id="2" title="Sales Rep Pickups" />
                      </GridItem>
                    );
                  case 'held':
                    return (
                      <GridItem key={layout.id} layout={layout}>
                        <StatsCards id="3" title="Orders Held" />
                      </GridItem>
                    );
                }
              })}
            </div>
          </main>
        </div>
      </DndContext>
      </PrimeReactProvider>
    )

    function handleDragEnd(event: any) {
      if (event.over && event.over.id.includes('droppable')) {
        const droppableId = event.over.id.split('-')[1]; // Get the id part after 'droppable-'
        console.log(cur_order + ' dropped in droppable with id:', droppableId);
        if (cur_order) {
          setLocation(cur_order, Number(droppableId));
        }
      }
      setCur_Order(null);
      setActiveOrder(null);
    }


    function handleDragStart(event: any) {
      const id = event.active.id as string;
      setCur_Order(id);

      const order = groupedOrders.find(o => o.groupId === id);
      setActiveOrder(order ?? null);
      setScrollTop(document.querySelector('.table-container')?.scrollTop || 0);

      const row = document.querySelector(
        `tr[data-dnd-id="${id}"]`
      ) as HTMLTableRowElement | null;

      if (row) {
        const widths = Array.from(row.children).map(
          (cell) => (cell as HTMLElement).offsetWidth
        );
        setOverlayWidths(widths);
      }
  }
}
export default Dashboard
