import { useMemo, useState } from "react"
import Header from "../Bars/Header"
import { useInboundStore } from "../Stores/InboundStore"
import "./InwardsPage.css"
import { OnSAPUpload } from "../Data/Inbound"
import { displayDate, fromDateOnlyString } from "../Data/Dates"


export default function InwardsPage() {

  const deliveries = useInboundStore(s => s.deliveries)

  const [dateRange] = useState<[Date | null, Date | null]>([null, null])
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)

  const import_data = async (file: File, importOption: 'clear' | 'overwrite' | 'add') => {
    if (!file) return
    await OnSAPUpload(file, importOption)
  }

  // 🔹 Group by week
  const weeks = useMemo(() => {
    const map: Record<string, {
      weekStart: Date
      containers: number
      totalQty: number
      deliveries: InboundDelivery[]
    }> = {}

    for (const d of deliveries) {
      try {
        const date = fromDateOnlyString(d.c)
        const weekStart = getWeekStart(date)
        const key = weekStart.toISOString()

        if (!map[key]) {
          map[key] = {
            weekStart,
            containers: 0,
            totalQty: 0,
            deliveries: []
          }
        }

        map[key].containers += 1
        map[key].totalQty += d.q
        map[key].deliveries.push(d)

      } catch (e) {
        console.error("Invalid date:", d, e)
      }
    }

    return Object.values(map).sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
    )
  }, [deliveries])

  // 🔹 Filter weeks
  const filteredWeeks = useMemo(() => {
    if (!dateRange[0] && !dateRange[1]) return weeks

    return weeks.filter(w => {
      const d = w.weekStart.getTime()
      const start = dateRange[0]?.getTime()
      const end = dateRange[1]?.getTime()

      if (start && d < start) return false
      if (end && d > end) return false
      return true
    })
  }, [weeks, dateRange])

  const selected = filteredWeeks.find(
    w => w.weekStart.toISOString() === selectedWeek
  )

  // 🔥 SUMMARY VALUES
  const totalContainers = filteredWeeks.reduce((a, b) => a + b.containers, 0)

  const totalQty = filteredWeeks.reduce((a, b) => a + b.totalQty, 0)

  const avgPerWeek = filteredWeeks.length
    ? Math.round(totalContainers / filteredWeeks.length)
    : 0

  const peakWeek = filteredWeeks.length
    ? Math.max(...filteredWeeks.map(w => w.containers))
    : 0

  const maxContainers = Math.max(...filteredWeeks.map(w => w.containers), 1)

  return (
    <div className="inwards-page">

      <Header onImportClick={import_data} showFilters={{ date: true }} />

      <div className="inwards-content">

        {/* SUMMARY */}
        <div className="cards">
          <Card label="Containers" value={totalContainers} />
          <Card label="Avg / Week" value={avgPerWeek} />
          <Card label="Total Qty" value={totalQty} />
          <Card label="Peak Week" value={peakWeek} />
        </div>

        {/* MAIN */}
        <div className="main-grid">

          {/* LEFT */}
          <div className="panel">
            <div className="panel-header">Weekly Containers</div>

            <div className="list">
              {filteredWeeks.map(w => (
                <div
                  key={w.weekStart.toISOString()}
                  className={`list-row ${selectedWeek === w.weekStart.toISOString() ? "active" : ""}`}
                  onClick={() => setSelectedWeek(w.weekStart.toISOString())}
                >
                  <div className="week">{formatWeek(w.weekStart)}</div>

                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        width: `${(w.containers / maxContainers) * 100}%`
                      }}
                    />
                  </div>

                  <div className="value">{w.containers}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="panel">
            <div className="panel-header">
              {selected ? `Deliveries (${formatWeek(selected.weekStart)})` : "Select a week"}
            </div>

            {selected && (
              <div className="list">
                {selected.deliveries.map(d => (
                  <div key={d.d} className="list-row-right">
                    <div className="delivery">{d.d}</div>
                    <div>{displayDate(d.c)}</div>
                    <div className="value">{d.q} ctns</div>
                    <div className="value">{d.m} lines</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}

/* ---------------- helpers ---------------- */

function Card({ label, value }: { label: string, value: number }) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value">{value.toLocaleString()}</div>
    </div>
  )
}

function getWeekStart(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatWeek(date: Date) {
  return date.toLocaleDateString()
}
