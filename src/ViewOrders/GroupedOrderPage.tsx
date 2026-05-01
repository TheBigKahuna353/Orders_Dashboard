import { useParams } from "react-router"
import { useMemo, useState } from "react"
import Header from "../Bars/Header"
import { useOrdersStore } from "../Stores/OrdersStore"
import "./GroupedOrderPage.css"
import { getPickDate } from "../Data/filter"
import { displayDate } from "../Data/Dates"
import { deriveStatus } from "../Data/utils"

export default function GroupedOrderPage() {

  const { id } = useParams<{ id: string }>()
  const groupedOrders = useOrdersStore(s => s.groupedOrders)

  const [expanded, setExpanded] = useState<string | null>(null)

  const group = useMemo(() =>
    groupedOrders.find(g => g.groupId === id),
    [groupedOrders, id]
  )

  if (!group) return <div>Group not found</div>

  const orders = group.orders

  const totalOrders = orders.length
  const totalPallets = group.totalPallets
  const totalWeight = group.totalWeight
  const totalVolume = group.totalVolume

  console.log("recalculated status for group", group.groupId, ":", {
    totalOrders,
    recalculatedStatuses: orders.map(o =>
      deriveStatus(o.comments, o.shipmentNo ?? "", o.DeliverStatus ?? "")
    )
  })
  console.log("individual orders:", orders)

  const picking = orders.filter(o => o.status === "picking").length
  const ready = orders.filter(o => o.status === "ready").length
  const held = orders.filter(o => o.status === "held").length
  const dispatch = orders.filter(o => o.status === "dispatched").length
  const delivered = orders.filter(o => o.status === "delivered").length

  const status =
    delivered === totalOrders ? "DELIVERED" :
    dispatch === totalOrders ? "DISPATCHED" :
    held === totalOrders ? "HELD" :
    picking === totalOrders ? "PICKING" :
    ready === totalOrders ? "READY" :
    "MIXED"

  return (
    <div className="group-page">

      <Header />

      <div className="group-content">

        {/* HEADER */}
        <div className="group-header">
          <h2>{group.customer}</h2>
          <div className="group-sub">
            Deliver: {displayDate(group.deliverDate)} | Pick: {displayDate(getPickDate(group.customer, group.deliverDate))}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="label">Orders</div>
            <div className="value">{totalOrders}</div>
          </div>

          <div className="summary-card">
            <div className="label">Pallets</div>
            <div className="value">{totalPallets}</div>
          </div>

          <div className="summary-card">
            <div className="label">Weight</div>
            <div className="value">{totalWeight.toLocaleString()}</div>
          </div>

          <div className="summary-card">
            <div className="label">Volume</div>
            <div className="value">{totalVolume}</div>
          </div>
        </div>

        <div className="summary-card group-meta">
          <div><b>Shipment:</b> {orders[0]?.shipmentNo || "—"}</div>
          <div>
            <b>Held:</b> {group.status === "held" ? "Yes" : "No"}
            {group.holdReason && ` (${group.holdReason})`}
          </div>
        </div>

        {/* STATUS */}
        <div className={`status-bar status-${status.toLowerCase()}`}>
          Status: {status} ({picking} picking, {ready} ready, {held} held, {dispatch} dispatched, {delivered} delivered)
        </div>

        {/* TABLE */}
        <div className="table-wrapper">
          <table className="orders-table">

            <thead>
              <tr>
                <th>Delivery</th>
                <th>Pallets</th>
                <th>PO</th>
                <th>Weight</th>
                <th>Volume</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map(order => {

                const isExpanded = expanded === order.deliveryNo

                return (
                  <>
                    <tr
                      className={`row ${order.status}`}
                      key={order.deliveryNo}
                      onClick={() =>
                        setExpanded(isExpanded ? null : order.deliveryNo)
                      }
                    >
                      <td>{order.deliveryNo}</td>
                      <td>{order.pallets}</td>
                      <td>{order.PO}</td>
                      <td>{order.weight}</td>
                      <td>{order.volume}</td>
                      <td>{order.status}</td>
                    </tr>
                
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan={5}>
                          <div className="expanded-content">
                            <div><b>Comments:</b> {order.comments || "None"}</div>
                            <div><b>Deliver Status:</b> {order.DeliverStatus}</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  )
}