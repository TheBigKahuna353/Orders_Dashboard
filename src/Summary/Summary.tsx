import Header from "../Bars/Header"
import { exportTableToExcel } from "../Data/Excel";
import './Summary.css'
import { onCSVUpload } from "../Data/import_ecargo"
import { useDailySummary } from "./getSummary"
import { useMemo } from "react"
import { useUIStore } from "../Stores/UIStore"
import { useNavigate } from "react-router";

interface Totals {
    orders: number
    pallets: number
    weight: number
    cube: number
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


import React from "react";

export default function Summary() {

    const handleExport = () => {
        exportTableToExcel('summary-table', 'SummaryTable.xlsx');
    };
    const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);

    const import_data = async (file: File) => {
        if (!file) return;
        onCSVUpload(file);
    };

    const getCurrentMonth = () => {
        const now = new Date();
        return now.getMonth()
    };

    const [month, setMonth] = React.useState(getCurrentMonth());
    const {data, parentOrders} = useDailySummary(month);
    const setDateRange = useUIStore(s => s.setDateRange)
    const setDateMode = useUIStore(s => s.setDateMode)
    const setDeliveryFilter = useUIStore(s => s.setDeliveryFilter)
    const navigate = useNavigate();

    const totals = useMemo(() => {
        const weekly: Totals[] = [];
        let acc: Totals = { orders: 0, pallets: 0, weight: 0, cube: 0 };
        data.forEach((day) => {
            acc.orders += day.dispatch.orders;
            acc.pallets += day.dispatch.pallets;
            acc.weight += day.dispatch.weight;
            acc.cube += day.dispatch.cube;
            // Friday (5) marks end of week
            if (day.date.getDay() === 5) {
                weekly.push({ ...acc });
                acc = { orders: 0, pallets: 0, weight: 0, cube: 0 };
            }
        });
        // If last week is incomplete, add remaining
        if (acc.orders > 0 || acc.pallets > 0 || acc.weight > 0 || acc.cube > 0) {
            weekly.push({ ...acc });
        }
        const monthly: Totals = weekly.reduce(
            (sum, w) => ({
                orders: sum.orders + w.orders,
                pallets: sum.pallets + w.pallets,
                weight: sum.weight + w.weight,
                cube: sum.cube + w.cube,
            }),
            { orders: 0, pallets: 0, weight: 0, cube: 0 }
        );
        return { weekly, monthly };
    }, [data]);

    const avgOrders = data.length > 0 ? Math.round(totals.monthly.orders / data.length) : 0;

    const peakDay = useMemo(() => {
        return data.reduce((max, day) =>
            day.dispatch.orders > max.dispatch.orders ? day : max
            , data[0]);
    }, [data]);

    const round = (num: number, decimals = 2) => {
        return Number(num.toFixed(decimals));
    };

    const onClickRow = (category: string, day: Date) => {
        switch (category) {
            case "metro":
                setDeliveryFilter("All Locals");
                break;
            case "outOfTown":
                setDeliveryFilter("All Out of Town");
                break;
            case "dispatch":
                setDeliveryFilter("All");
                break;
        }
        setDateRange([day, day])
        setDateMode("pick")
        navigate("/orders")
    }

    const onClickWeeklyTotal = (endDate: Date, category: string) => {
        switch (category) {
            case "metro":
                setDeliveryFilter("All Locals");
                break;
            case "outOfTown":
                setDeliveryFilter("All Out of Town");
                break;
            case "dispatch":
                setDeliveryFilter("All");
                break;
        }
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 4); // Assuming 5-day weeks
        setDateRange([startDate, endDate])
        setDateMode("pick")
        navigate("/orders")
    }

    function renderCategory(
        label: string,
        key: "metro" | "outOfTown" | "dispatch",
        highlight = false
    ) {
        const metrics = ["orders", "weight", "cube", "pallets"] as const;

        // Determine if this category is hovered
        const isHovered = hoveredCategory === label;

        return metrics.map((metric, i) => (
            <tr
                key={label + metric}
                className={
                    (highlight
                        ? "summary-highlight"
                        : "") + 
                    (i === 3
                        ? " summary-bottom-border"
                        : "")
                }
                onMouseEnter={() => setHoveredCategory(label)}
                onMouseLeave={() => setHoveredCategory(null)}
            >
                {i === 0 && (
                    <td
                        className={
                            "summary-category summary-sticky-col" +
                            (isHovered ? " summary-category-hover" : "")
                        }
                        rowSpan={metrics.length}
                    >
                        {label}
                    </td>
                )}
                <td className={`summary-metric summary-sticky-col ${isHovered ? " summary-category-hover" : ""}`}>{metric}</td>
                {(() => {
                    let weekIdx = 0;
                    return data.map((day) => {
                        const cell = metric === "weight"
                            ? <td key={day.date.getTime()} onClick={() => onClickRow(key, day.date)}>{round(day[key][metric]).toLocaleString()}</td>
                            : <td key={day.date.getTime()} onClick={() => onClickRow(key, day.date)}>{round(day[key][metric])}</td>;
                        // Insert weekly total column after Friday
                        if (day.date.getDay() === 5 && weekIdx < totals.weekly.length) {
                            const weekTotal = totals.weekly[weekIdx]?.[metric] ?? 0;
                            weekIdx++;
                            return [cell,
                                <td key={"week-total-" + weekIdx + metric} className="summary-weekly-col summary-total-col" onClick={() => onClickWeeklyTotal(day.date, key)}>
                                    <b>{round(weekTotal).toLocaleString()}</b>
                                </td>
                            ];
                        }
                        return cell;
                    });
                })()}
                <td className="summary-total-col">
                    {round(
                        data.reduce((sum, d) => sum + d[key][metric], 0)
                    )}
                </td>
            </tr>
        ));
    }


    return (
        <div className="summary">
            <Header onImportClick={import_data} onExportClick={handleExport} showFilters={{ export: true }} />
            <div className="summary-content">

                <div className="summary-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <button
                        className="summary-month-btn"
                        style={{ marginRight: 16 }}
                        onClick={() => { setMonth(prev => (prev - 1 + 12) % 12); }}
                        aria-label="Previous Month"
                    >
                        &#8592;
                    </button>
                    <h2 className="summary-title" style={{ flex: 1, textAlign: 'center', margin: 0 }}>{monthNames[month]} Summary</h2>
                    <button
                        className="summary-month-btn"
                        style={{ marginLeft: 16 }}
                        onClick={() => { setMonth(prev => (prev + 1) % 12); }}
                        aria-label="Next Month"
                    >
                        &#8594;
                    </button>
                </div>

                {/* KPI CARDS */}
                <div className="summary-kpis">

                    <div className="kpi-card">
                        <div className="kpi-label">Total Orders/Total Parent Orders</div>
                        <div className="kpi-value">{totals.monthly.orders}/{parentOrders}</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Total Pallets</div>
                        <div className="kpi-value">{totals.monthly.pallets}</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Total Weight (kg)</div>
                        <div className="kpi-value">{round(totals.monthly.weight).toLocaleString()}</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Avg Orders / Day</div>
                        <div className="kpi-value">{avgOrders}</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Peak Day</div>
                        <div className="kpi-value">{peakDay?.date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</div>
                    </div>

                </div>


                {/* DAILY TABLE */}
                <div className="summary-table-container">
                    <table className="summary-table" id={"summary-table"}>
                        <thead>
                            <tr>
                                <th className="summary-sticky-col">Category</th>
                                <th className="summary-sticky-col">Pick Date</th>
                            {(() => {
                                let weekIdx = 0;
                                return data.map(day => {
                                const cell = <th key={day.date.getTime()}>
                                    {day.date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', weekday: 'short' })}
                                </th>;
                                // Insert weekly total header after Friday
                                if (day.date.getDay() === 5 && weekIdx < totals.weekly.length) {
                                    weekIdx++;
                                    return [cell,
                                        <th key={"week-total-header-" + day.date.getTime()} className="summary-weekly-col">
                                            Week Total
                                        </th>
                                    ];
                                }
                                return cell;
                            })})()
                            }
                                <th className="summary-total-col">Month Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* CHC METRO */}
                            {renderCategory("Metro", "metro")}
                            {/* OUT OF TOWN */}
                            {renderCategory("Out of Town", "outOfTown")}
                            {/* DISPATCH TOTAL */}
                            {renderCategory("TOTAL", "dispatch", true)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}