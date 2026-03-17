import Header from "../Bars/Header"
import { exportTableToExcel } from "../Data/Excel";
import './Summary.css'
import { onCSVUpload } from "../Data/import_ecargo"
import { useDailySummary } from "./getSummary"
import { useMemo } from "react"
import { useUIStore } from "../Stores/UIStore"
import { useNavigate } from "react-router";


interface Totals {
    metro: {
        orders: number
        pallets: number
        weight: number
        cube: number
    },
    outOfTown: {
        orders: number
        pallets: number
        weight: number
        cube: number
    },
    dispatch: {
        orders: number
        pallets: number
        weight: number
        cube: number
    }
}

const addToTotal = (item1: Totals, item2: DailySummary): Totals => {
    return {
        metro: {
            orders: item1.metro.orders + item2.metro.orders,
            pallets: item1.metro.pallets + item2.metro.pallets,
            weight: item1.metro.weight + item2.metro.weight,
            cube: item1.metro.cube + item2.metro.cube,
        },
        outOfTown: {
            orders: item1.outOfTown.orders + item2.outOfTown.orders,
            pallets: item1.outOfTown.pallets + item2.outOfTown.pallets,
            weight: item1.outOfTown.weight + item2.outOfTown.weight,
            cube: item1.outOfTown.cube + item2.outOfTown.cube,
        },
        dispatch: {
            orders: item1.dispatch.orders + item2.dispatch.orders,
            pallets: item1.dispatch.pallets + item2.dispatch.pallets,
            weight: item1.dispatch.weight + item2.dispatch.weight,
            cube: item1.dispatch.cube + item2.dispatch.cube,
        }
    }
}

const getNewTotal = () => ({
    metro: { orders: 0, pallets: 0, weight: 0, cube: 0 },
    outOfTown: { orders: 0, pallets: 0, weight: 0, cube: 0 },
    dispatch: { orders: 0, pallets: 0, weight: 0, cube: 0 }
} as Totals)

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


import React from "react";

export default function Summary() {
    const [showBulk, setShowBulk] = React.useState(true);

    const handleExport = () => {
        exportTableToExcel('summary-table', 'SummaryTable.xlsx');
    };
    const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);

    const import_data = async (file: File, importType: 'clear' | 'overwrite' | 'add') => {
        if (!file) return;
        onCSVUpload(file, importType);
    };


    const [month, setMonth] = React.useState(new Date().getMonth());
    const [year, setYear] = React.useState(new Date().getFullYear());
    const {data, parentOrders} = useDailySummary(month, year, showBulk);
    const setDateRange = useUIStore(s => s.setDateRange)
    const setDateMode = useUIStore(s => s.setDateMode)
    const setDeliveryFilter = useUIStore(s => s.setDeliveryFilter)
    const navigate = useNavigate();

    const totals = useMemo(() => {
        const weekly: Totals[] = [];
        let acc: Totals = getNewTotal();
        data.forEach((day) => {
            acc = addToTotal(acc, day);
            // Friday (5) marks end of week
            if (day.date.getDay() === 5) {
                weekly.push({ ...acc });
                acc = getNewTotal();
            }
        });
        // If last week is incomplete, add remaining
        if (acc.dispatch.orders > 0 || acc.dispatch.pallets > 0 || acc.dispatch.weight > 0 || acc.dispatch.cube > 0) {
            weekly.push({ ...acc });
        }
        const monthly: Totals = weekly.reduce(
            (sum, w) => ({
                metro: {
                    orders: sum.metro.orders + w.metro.orders,
                    pallets: sum.metro.pallets + w.metro.pallets,
                    weight: sum.metro.weight + w.metro.weight,
                    cube: sum.metro.cube + w.metro.cube
                },
                outOfTown: {
                    orders: sum.outOfTown.orders + w.outOfTown.orders,
                    pallets: sum.outOfTown.pallets + w.outOfTown.pallets,
                    weight: sum.outOfTown.weight + w.outOfTown.weight,
                    cube: sum.outOfTown.cube + w.outOfTown.cube
                },
                dispatch: {
                    orders: sum.dispatch.orders + w.dispatch.orders,
                    pallets: sum.dispatch.pallets + w.dispatch.pallets,
                    weight: sum.dispatch.weight + w.dispatch.weight,
                    cube: sum.dispatch.cube + w.dispatch.cube
                }
            }),
            getNewTotal()
        );
        return { weekly, monthly };
    }, [data]);

    const avgOrders = data.length > 0 ? Math.round(totals.monthly.dispatch.orders / data.length) : 0;

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
            case "bulk":
                setDeliveryFilter("Bulk");
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
            case "bulk":
                setDeliveryFilter("Bulk");
                break;
        }
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 4); // Assuming 5-day weeks
        setDateRange([startDate, endDate])
        setDateMode("pick")
        navigate("/orders")
    }

    const onClickNextMonth = () => {
        setYear(prev => prev + (month === 11 ? 1 : 0));
        setMonth(prev => (prev + 1) % 12);
    }
    const onClickPrevMonth = () => {
        setYear(prev => prev - (month === 0 ? 1 : 0));
        setMonth(prev => (prev - 1 + 12) % 12);
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
                            const weekTotal = totals.weekly[weekIdx]?.[key]?.[metric] ?? 0;
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
                        style={{ marginRight: 16, padding: '4px 12px', borderRadius: 4, border: '1px solid #bbb', background: showBulk ? 'var(--panel-bg)' : 'var(--bg-header)', cursor: 'pointer' }}
                        onClick={() => setShowBulk(b => !b)}
                    >
                        {showBulk ? 'Hide Bulk Orders' : 'Show Bulk Orders'}
                    </button>
                    <button
                        className="summary-month-btn"
                        style={{ marginRight: 16 }}
                        onClick={onClickPrevMonth}
                        aria-label="Previous Month"
                    >
                        &#8592;
                    </button>
                    <h2 className="summary-title" style={{ flex: 1, textAlign: 'center', margin: 0 }}>{monthNames[month]} {year} Summary</h2>
                    <button
                        className="summary-month-btn"
                        style={{ marginLeft: 16 }}
                        onClick={onClickNextMonth}
                        aria-label="Next Month"
                    >
                        &#8594;
                    </button>
                </div>

                {/* KPI CARDS */}
                <div className="summary-kpis">

                    <div className="kpi-card">
                        <div className="kpi-label">Total Orders/Total Parent Orders</div>
                        <div className="kpi-value">{totals.monthly.dispatch.orders}/{parentOrders}</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Total Pallets</div>
                        <div className="kpi-value">{totals.monthly.dispatch.pallets}</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-label">Total Weight (kg)</div>
                        <div className="kpi-value">{round(totals.monthly.dispatch.weight).toLocaleString()}</div>
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
                        </tbody>
                        {/* BULK SECTION */}
                        {showBulk && (
                        <tbody>
                            <tr>
                                <td className="summary-category summary-sticky-col" rowSpan={3}>Bulk</td>
                                <td className="summary-metric summary-sticky-col">WW</td>
                                {(() => {
                                    let weekIdx = 0;
                                    return data.map(day => {
                                        const cell = <td key={day.date.getTime()} onClick={() => onClickRow("bulk", day.date)}>{day.bulk.woolworths}</td>;
                                        if (day.date.getDay() === 5 && weekIdx < totals.weekly.length) {
                                            const weekTotal = data
                                                .filter(d => d.date <= day.date && d.date >= new Date(day.date.getTime() - 4 * 24 * 60 * 60 * 1000))
                                                .reduce((sum, d) => sum + d.bulk.woolworths, 0);
                                            weekIdx++;
                                            return [cell,
                                                <td 
                                                key={"week-total-bulk-ww-" + day.date.getTime()} 
                                                className="summary-weekly-col summary-total-col" 
                                                onClick={() => onClickWeeklyTotal(day.date, "bulk")}>
                                                    <b>{weekTotal}</b>
                                                </td>
                                            ];
                                        }
                                        return cell;
                                    });
                                })()}
                                <td className="summary-total-col">{data.reduce((sum, d) => sum + d.bulk.woolworths, 0)}</td>
                            </tr>
                            <tr>
                                <td className="summary-metric summary-sticky-col">FS Dunedin</td>
                                {(() => {
                                    let weekIdx = 0;
                                    return data.map(day => {
                                        const cell = <td key={day.date.getTime()}>{day.bulk.foodstuffsDunedin}</td>;
                                        if (day.date.getDay() === 5 && weekIdx < totals.weekly.length) {
                                            const weekTotal = data
                                                .filter(d => d.date <= day.date && d.date >= new Date(day.date.getTime() - 4 * 24 * 60 * 60 * 1000))
                                                .reduce((sum, d) => sum + d.bulk.foodstuffsDunedin, 0);
                                            weekIdx++;
                                            return [cell,
                                                <td 
                                                    key={"week-total-bulk-fsd-" + day.date.getTime()} 
                                                    className="summary-weekly-col summary-total-col" 
                                                    onClick={() => onClickWeeklyTotal(day.date, "bulk")}>
                                                    <b>{weekTotal}</b>
                                                </td>
                                            ];
                                        }
                                        return cell;
                                    });
                                })()}
                                <td className="summary-total-col">{data.reduce((sum, d) => sum + d.bulk.foodstuffsDunedin, 0)}</td>
                            </tr>
                            <tr>
                                <td className="summary-metric summary-sticky-col">FS CHCH</td>
                                {(() => {
                                    let weekIdx = 0;
                                    return data.map(day => {
                                        const cell = <td key={day.date.getTime()} onClick={() => onClickRow("bulk", day.date)}>{day.bulk.foodstuffsChristchurch}</td>;
                                        if (day.date.getDay() === 5 && weekIdx < totals.weekly.length) {
                                            const weekTotal = data
                                                .filter(d => d.date <= day.date && d.date >= new Date(day.date.getTime() - 4 * 24 * 60 * 60 * 1000))
                                                .reduce((sum, d) => sum + d.bulk.foodstuffsChristchurch, 0);
                                            weekIdx++;
                                            return [cell,
                                                <td 
                                                    key={"week-total-bulk-fsc-" + day.date.getTime()} 
                                                    className="summary-weekly-col summary-total-col" 
                                                    onClick={() => onClickWeeklyTotal(day.date, "bulk")}>
                                                    <b>{weekTotal}</b>
                                                </td>
                                            ];
                                        }
                                        return cell;
                                    });
                                })()}
                                <td className="summary-total-col">{data.reduce((sum, d) => sum + d.bulk.foodstuffsChristchurch, 0)}</td>
                            </tr>
                        </tbody>
                        )}
                        <tbody>
                            {renderCategory("TOTAL", "dispatch", true)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}