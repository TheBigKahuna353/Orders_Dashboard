/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useState } from 'react';
import {DndContext, pointerWithin} from '@dnd-kit/core';

import {Droppable} from '../Droppable.tsx';

import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';

import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';

import '../App.css'
import { onCSVUpload } from '../import_data.ts';
import { GroupedOrder } from '../GroupedOrder.tsx';

import { filterOrder } from '../filter.ts';

function Dashboard() {


    // this array will hold which droppables the orders are in
    // 0 = left column - unnasigned
    // 1 = right column - assigned

    const [orders, setOrders] = useState<Order[]>([]);
    const [locations, setLocations] = useState<{[key: string]: number}>({});

    const [cur_order, setCur_Order] = useState<string | null>(null);
    
    const import_data = async (file: File) => {
      if ( !file ) return;
      await onCSVUpload(file, setOrders, setLocations, locations);
    }

    const groupedOrders = useMemo(() => {
    const groups = new Map<string, GroupedOrder>()

    for (const order of orders) {
      if (!groups.has(order.groupId)) {
        groups.set(order.groupId, {
          groupId: order.groupId,
          customer: order.customer,
          city: order.city,
          orders: [],
          totalPallets: 0,
          totalWeight: 0,
          totalVolume: 0,
          status: "finished",
        })
      }

      function round(num: number, fractionDigits: number): number {
          return Number(num.toFixed(fractionDigits));
      }

      const group = groups.get(order.groupId)!

      group.orders.push(order)
      group.totalPallets += order.pallets
      group.totalWeight = round(group.totalWeight + order.weight, 2)
      group.totalVolume = round(group.totalVolume + order.volume, 2)

      if (order.status !== "finished") {
        group.status = "picking"
      }
    }
    console.log("Grouped Orders:", Array.from(groups.values()));
    console.log("Locations:", locations);
    
    return Array.from(groups.values())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders])

    const toast = useRef<Toast>(null);

    const style: React.CSSProperties = {
      width: '80vw',
      margin: '20px auto',
      position: 'absolute',
      top: '20px',
      left: '20px',
    }

    const getTotalPallets = (location: number) => {
      return groupedOrders.reduce((total, group) => {
        if (locations[group.groupId] === location && filterOrder(group, filter)) {
          return group.status === "finished" ? total + group.totalPallets : total;
        }
        return total;
      }, 0);
    }

    const [filter, setFilter] = useState<string>('All');
    const filters = ['All', 'All Out of Town', 'Out of town small', 'All Locals', 'Locals small', 'Bulk', ]

    return (
      <PrimeReactProvider>
        <div>
        <h1>Order Picking Dashboard</h1>
          <Dropdown value={filter} onChange={(e) => setFilter(e.value)} options={filters}
            placeholder="Filter" checkmark={true}  highlightOnSelect={false} />
        </div>
      <DndContext 
        onDragEnd={handleDragEnd} 
        onDragStart={handleDragStart}
        collisionDetection={pointerWithin}>
        <Toast ref={toast} />
        <FileUpload 
        style={style} 
        mode="basic" 
        name="demo[]" 
        accept=".csv" 
        maxFileSize={1000000} 
        auto 
        chooseLabel="Import CSV"
        customUpload
        uploadHandler={(e) => import_data(e.files[0])}/>
        <div className="container-flex">
            <div className="column-left">
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <h2>Unnassigned Orders</h2>
                  <p>{getTotalPallets(0)} Pallets to assign</p>
                </div>
                <Droppable id="0">
                    {groupedOrders.map((group) => (
                      locations[group.groupId] === 0 && filterOrder(group, filter) && <GroupedOrder group={group} key={group.groupId} />
                    ))}
                </Droppable>
            </div>
            <div className="column-right">
              <div>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <h2>Orders ready at 10am</h2>
                  <p>{getTotalPallets(1)} Pallets ready</p>
                </div>
                  <Droppable id="1">
                      {groupedOrders.map((group) => (
                        locations[group.groupId] === 1 && filterOrder(group, filter) && <GroupedOrder group={group} key={group.groupId} detailed/>
                      ))}
                  </Droppable>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <h2>Orders ready at 12pm</h2>
                    <p>{getTotalPallets(2)} Pallets ready</p>
                </div>
                  <Droppable id="2">
                      {groupedOrders.map((group) => (
                        locations[group.groupId] === 2 && filterOrder(group, filter) && <GroupedOrder group={group} key={group.groupId} detailed/>
                      ))}
                  </Droppable>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <h2>Orders ready at 2:30pm</h2>
                    <p>{getTotalPallets(3)} Pallets ready</p>
                  </div>
                  <Droppable id="3">
                      {groupedOrders.map((group) => (
                        locations[group.groupId] === 3 && filterOrder(group, filter) && <GroupedOrder group={group} key={group.groupId} detailed/>
                      ))}
                  </Droppable>
                </div>
            </div>
        </div>
      </DndContext>
      </PrimeReactProvider>
    )

    function handleDragEnd(event: any) {
      if (event.over && event.over.id.includes('droppable')) {
        const droppableId = event.over.id.split('-')[1]; // Get the id part after 'droppable-'
        console.log(cur_order + ' dropped in droppable with id:', droppableId);
        if (cur_order) {
          setLocations((prevLocations) => ({
            ...prevLocations,
            [cur_order]: Number(droppableId),
          }));
        }
      }
    }


    function handleDragStart(event: any) {
      setCur_Order(event.active.id);
    }
}
export default Dashboard
