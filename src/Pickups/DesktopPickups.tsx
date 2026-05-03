import DatePicker from "react-datepicker";
import Header from "../Bars/Header";
import { useEffect, useMemo, useRef } from "react";
import React from "react";
import { usePickupPlans } from "./GetPickupPlans";
import { useOrdersStore } from "../Stores/OrdersStore";
import { addDays, toDateOnlyString } from "../Data/Dates";

interface Props {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}


export const DesktopPickups = ({ selectedDate, setSelectedDate }: Props) => {

    const orders = useOrdersStore(s => s.groupedOrders);
    const { pickupPlans, groupedByTime } = usePickupPlans(selectedDate);
    const setPickupPlan = useOrdersStore((s) => s.setPickupPlan)

    const [expandedTimes, setExpandedTimes] = React.useState<{[time: string]: boolean}>({}); // init all expanded to true


    const actionBtnRef = useRef<HTMLButtonElement | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    
    const [showPopup, setShowPopup] = React.useState(''); // will be groupId of the order to show popup for, or '' for none
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [search, setSearch] = React.useState("");



    const pastTime = (time: string) => {
    if (!time || time === "Next Day") return false;
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    if (hours < nowHours || (hours === nowHours && minutes < nowMinutes)) {
      return true;
    }
    return false;
  }

  const isBulk = (order: GroupedOrder) => {
    const customer = order.customer.toLowerCase();
    return customer.includes("woolworths") || customer.includes("foodstuffs")
  };

  const searchedOrders = useMemo(() => {
      const lowerSearch = search.toLowerCase();
      return orders.filter(order => {
        if (order.searchableString === undefined) {
          console.warn("Order is missing searchableString:", order);
          return false;
        }
        return !pickupPlans.some(p => p.order.groupId === order.groupId) &&
               (order.searchableString.includes(lowerSearch));
      });
    }, [search, orders, pickupPlans]);

    useEffect(() => {
        if (!showPopup) return;
        const onClick = (e: MouseEvent) => {
          const target = e.target as Node;
          if (
            popupRef.current && !popupRef.current.contains(target) &&
            actionBtnRef.current && !actionBtnRef.current.contains(target)
          ) {
            setShowPopup('');
          }
        };
        window.addEventListener('click', onClick);
        return () => window.removeEventListener('click', onClick);
      }, [showPopup]);

    return (
    <div className="pickup-page">
      <Header />
      <div className="pickup-content">
        <h2>Pickup Schedule</h2>
        <div style={{marginBottom: '16px'}}>
          <label style={{marginRight: '8px', fontWeight: 500}}>Pick Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: string | number | Date | null) => {
              if (date) {
                const d = new Date(date);
                d.setHours(0,0,0,0);
                setSelectedDate(d);
              }
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select pick date"
          />
        </div>
        <button onClick={() => window.print()}>
          Print
        </button>
        <button style={{marginLeft: 8}} onClick={() => setShowAddModal(true)}>
          Add Order
        </button>
        {showAddModal && (
          <div className="pickup-modal-overlay">
            <div className="pickup-modal-content">
              <h3>Add Order to Pickup</h3>
              <input
                autoFocus
                type="text"
                placeholder="Search by customer or delivery number"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', marginBottom: 12 }}
              />
              <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12 }}>
                {searchedOrders.slice(0, 20).map(order => (
                  <div
                    key={order.groupId}
                    className="pickup-modal-order-row"
                  >
                    <div className="pickup-modal-order-info">
                      <div className="pickup-modal-order-customer">{order.customer}</div>
                      <div className="pickup-modal-order-numbers">
                        {order.orders.map(o => (
                          <span key={o.deliveryNo} className="pickup-modal-order-badge">{o.deliveryNo}</span>
                        ))}
                      </div>
                      <div className="pickup-modal-order-details">
                        Deliver: {order.deliverDate}
                      </div>
                    </div>
                    <button
                      className="pickup-modal-add-input"
                      onClick={() => {
                        setPickupPlan(order.groupId, {
                          groupId: order.groupId,
                          date: toDateOnlyString(selectedDate),
                          pickupTime: '',
                          location: undefined,
                          priority: false
                        });
                        setShowAddModal(false);
                        setSearch("");
                      }}
                    >
                      Add
                    </button>
                  </div>
                ))}
                {searchedOrders.length === 0 && (
                  <div className="pickup-modal-no-orders">No orders found</div>
                )}
              </div>
              <button onClick={() => { setShowAddModal(false); setSearch(""); }} style={{ width: '100%' }}>Close</button>
            </div>
          </div>
        )}
        <table className="pickup-table print-target">
          <thead>
            <tr>
              <th>Pickup Time
              </th>
              <th>Customer</th>
              <th>Pallets</th>
              <th>Location</th>
              <th>Booking</th>
              <th className="hideOnPrint">Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedByTime).map(([time, plans]) => {
              const isExpanded = expandedTimes[time] ?? false;
              // Calculate summary
              const totalPallets = plans.reduce((sum, p) => sum + p.order.totalPallets, 0);
              const locations = new Set(plans.map(p => p.plan.location).filter(l => l) as string[]);
              return (
                <React.Fragment key={time}>
                  <tr style={{ background: 'var(--bg)' }} className={(isExpanded || pastTime(time)) ? 'hideOnPrint' : ''}>
                    <td colSpan={2}>
                      <button
                        style={{ marginRight: 8 }}
                        onClick={() => setExpandedTimes(et => ({ ...et, [time]: !isExpanded }))}
                      >
                        {isExpanded ? 'Hide' : 'Show'} {time === '--' ? 'Unassigned' : time} ({plans.length} order{plans.length > 1 ? 's' : ''})
                      </button>
                      <div className="showOnPrint">{time}</div>
                    </td>
                    <td>
                      {!isExpanded && (
                        <span style={{ fontWeight: 500 }}>
                          {totalPallets}
                        </span>
                      )}
                    </td>
                    <td>
                      {!isExpanded && (
                        <span style={{ fontWeight: 500 }}>
                          {locations.size > 0 ? Array.from(locations).join(', ') : ''} 
                        </span>
                      )}
                    </td>
                    <td/>
                    <td className="hideOnPrint"/>
                  </tr>
                  {isExpanded && plans.map(({ order, plan }) => {
                    return (
                      <tr key={order.groupId} className={pastTime(time) ? 'hideOnPrint' : ''}>
                        <td>
                          <select
                            value={time}
                            onChange={e =>
                              setPickupPlan(order.groupId, {
                                ...plan,
                                pickupTime: e.target.value
                              })
                            }
                          >
                            <option value="">--</option>
                            {times.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </td>
                        <td>{order.customer} {isBulk(order) && <span className="pickup-modal-order-badge">{order.orders[0].deliveryNo}</span>}</td>
                        <td>{order.totalPallets}</td>
                        <td>
                          <select
                            value={plan.location || ""}
                            onChange={e =>
                              setPickupPlan(order.groupId, {
                                ...plan,
                                location: e.target.value as DispatchLane
                              })
                            }
                          >
                            <option value="">--</option>
                            {dispatchLaneOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td/>
                        <td className="hideOnPrint">
                          <button
                            ref={showPopup === order.groupId ? actionBtnRef : undefined}
                            onClick={() => setShowPopup(order.groupId)}
                          >Action</button>
                          {showPopup === order.groupId && (
                            <div
                              ref={popupRef}
                              style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', zIndex: 1000, padding: 8 }}
                            >
                              <button
                                onClick={() => {
                                  setPickupPlan(order.groupId, { ...plan, date: '' });
                                  setShowPopup('');
                                }}
                                style={{ display: 'block', width: '100%' }}
                              >Remove</button>
                              <button
                                onClick={() => {
                                  const newDate = addDays(plan.date, 1, true);
                                  setPickupPlan(order.groupId, {
                                    ...plan,
                                    date: newDate
                                  });
                                  setShowPopup('');
                                }}
                                style={{ display: 'block', width: '100%', marginTop: 4 }}
                              >Move to Tomorrow</button>
                              <button
                                onClick={() => setShowPopup('')}
                                style={{ display: 'block', width: '100%', marginTop: 4 }}
                              >Cancel</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const times = [
    "06:00","06:30","07:00","07:30",
    "08:00","08:30","09:00","09:30",
    "10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30",
    "14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00"
]

const dispatchLaneOptions = [
  ...Array.from({ length: 15 }, (_, i) => `dsp${i + 11}`),
  "outside"
].map(lane => ({ label: lane.toUpperCase(), value: lane }));

