import { useOrdersStore } from "../Stores/OrdersStore"
import Header from "../Bars/Header"
import "./PickupTimes.css"
import React, { useMemo } from "react"
import DatePicker from "react-datepicker"
import { usePickupPlans } from "./GetPickupPlans"
import { addDays, toDateOnlyString } from "../Data/Dates"

export default function PickupTimes() {

  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });
  const [showPopup, setShowPopup] = React.useState(-1);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const orders = useOrdersStore(s => s.groupedOrders);

  const pickupPlans = usePickupPlans(selectedDate)
  const setPickupPlan = useOrdersStore((s) => s.setPickupPlan)

  //console.log("Pickup plans for", selectedDate, pickupPlans)

  // Group pickupPlans by pickupTime and alternate highlight
  let lastTime:string|null = null;
  let highlightToggle = false;
  const rowHighlights: Record<string, boolean> = {};
  pickupPlans.forEach(({ plan }) => {
    const time = plan.pickupTime || '';
    if (time !== lastTime) highlightToggle = !highlightToggle;
    rowHighlights[time + ''] = highlightToggle;
    lastTime = time;
  });

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


  const isBulk = (order: GroupedOrder) => {
    const customer = order.customer.toLowerCase();
    return customer.includes("woolworths") || customer.includes("foodstuffs")
  };

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
              <th>Customer</th>
              <th>Pallets</th>
              <th>Time</th>
              <th>Location</th>
              <th>Priority</th>
              <th className="hideOnPrint">Action</th>
            </tr>
          </thead>
          <tbody>
            {pickupPlans.map(({order, plan}, index) => {
              const time = plan.pickupTime || '';
              const highlight = rowHighlights[time + ''];
              return (
                <React.Fragment key={order.groupId}>
                  <tr className={highlight && time ? 'highlight' : ''}>
                    <td>{order.customer} {isBulk(order) && <span className="pickup-modal-order-badge">{order.orders[0].deliveryNo}</span>}</td>
                    <td>{order.totalPallets}</td>
                    <td>
                      <select
                        value={plan.pickupTime || ""}
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
                    <td>
                      <input
                        type="checkbox"
                        checked={plan.priority || false}
                        onChange={e =>
                          setPickupPlan(order.groupId, {
                            ...plan,
                            priority: e.target.checked
                          })
                        }
                      />
                    </td>
                    <td className="hideOnPrint">
                      <button onClick={() => setShowPopup(index)}>Action</button>
                      {showPopup === index && (
                        <div style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', zIndex: 1000, padding: 8 }}>
                          <button
                            onClick={() => {
                              // Remove logic: set pickup plan to null/undefined or remove from store
                              setPickupPlan(order.groupId, {...plan, date: ''});
                              setShowPopup(-1);
                            }}
                            style={{ display: 'block', width: '100%' }}
                          >Remove</button>
                          <button
                            onClick={() => {
                              // Move to tomorrow logic: increment date by 1 day
                              const newDate = addDays(plan.date, 1);
                              setPickupPlan(order.groupId, {
                                ...plan,
                                date: newDate
                              });
                              setShowPopup(-1);
                            }}
                            style={{ display: 'block', width: '100%', marginTop: 4 }}
                          >Move to Tomorrow</button>
                          <button
                            onClick={() => setShowPopup(-1)}
                            style={{ display: 'block', width: '100%', marginTop: 4 }}
                          >Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              )
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
    "16:00","16:30","17:00", "Next Day"
]

const dispatchLaneOptions = [
  ...Array.from({ length: 15 }, (_, i) => `dsp${i + 11}`),
  "outside"
].map(lane => ({ label: lane.toUpperCase(), value: lane }));

