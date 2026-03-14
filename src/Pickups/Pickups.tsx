import { useOrdersStore } from "../Stores/OrdersStore"
import Header from "../Bars/Header"
import "./PickupTimes.css"
import React from "react"
import DatePicker from "react-datepicker"
import { usePickupPlans } from "./GetPickupPlans"

export default function PickupTimes() {

  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  });

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
        <table className="pickup-table print-target">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Pallets</th>
              <th>Time</th>
              <th>Location</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {pickupPlans.map(({order, plan}) => {
              const time = plan.pickupTime || '';
              const highlight = rowHighlights[time + ''];
              return (
                <tr key={order.groupId} className={highlight && time ? 'highlight' : ''}>
                  <td>{order.customer}</td>
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
                </tr>
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

