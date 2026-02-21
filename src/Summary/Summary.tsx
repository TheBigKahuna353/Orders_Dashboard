import Header from "../Bars/Header"
import './Summary.css'
import { onCSVUpload } from "../Data/import_ecargo"
import { useDailySummary } from "./getSummary"
import { useMemo } from "react"
import { useUIStore } from "../Stores/UIStore"
import { useNavigate } from "react-router";


import React from "react";

export default function Summary() {
    const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);

    const import_data = async (file: File) => {
        if (!file) return;
        onCSVUpload(file);
    };

    const {data, parentOrders} = useDailySummary();
    const setDateRange = useUIStore(s => s.setDateRange)
    const setDateMode = useUIStore(s => s.setDateMode)
    const setDeliveryFilter = useUIStore(s => s.setDeliveryFilter)
    const navigate = useNavigate();

    const totals = useMemo(() => {
        return data.reduce((acc, day) => {
            acc.orders += day.dispatch.orders;
            acc.pallets += day.dispatch.pallets;
            acc.weight += day.dispatch.weight;
            acc.cube += day.dispatch.cube;
            return acc;
        }, { orders: 0, pallets: 0, weight: 0, cube: 0 });
    }, [data]);

    const avgOrders = data.length > 0 ? Math.round(totals.orders / data.length) : 0;

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
                <td className="summary-metric summary-sticky-col">{metric}</td>
                {data.map((day) => {
                    if (metric === "weight") {
                        return (
                            <td key={day.date.getTime()}
                                onClick={() => onClickRow(key, day.date)}
                            >
                                {round(day[key][metric]).toLocaleString()}
                            </td>
                        );
                    }
                    return (
                        <td key={day.date.getTime()}
                            onClick={() => onClickRow(key, day.date)}
                        >
                            {round(day[key][metric])}</td>
                    );
                })}
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
            <Header onImportClick={import_data} />
            <div className="summary-content">

                <h2 className="summary-title">Monthly Summary</h2>

                {/* KPI CARDS */}
                <div className="summary-kpis">

                    <div className="kpi-card">
                        <div className="kpi-label">Total Orders/Total Parent Orders</div>
                        <div className="kpi-value">{totals.orders}/{parentOrders}</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Total Pallets</div>
                        <div className="kpi-value">{totals.pallets}</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Total Weight (kg)</div>
                        <div className="kpi-value">{round(totals.weight).toLocaleString()}</div>
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
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th className="summary-sticky-col">Category</th>
                                <th className="summary-sticky-col">Pick Date</th>
                                {data.map(day => (
                                    <th key={day.date.getTime()}>
                                        {day.date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', weekday: 'short' })}
                                    </th>
                                ))}
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