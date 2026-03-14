/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Header from "../Bars/Header";
import { onExcelUpload } from "../Data/Excel";
import { useUIStore } from "../Stores/UIStore";
import './CycleCount.css';
import useSortedData, { useWeeklyData } from "./Getdata";
import CycleCountDateModal from "./CycleCountDateModal";
import { displayDate } from "../Data/Dates";

export default function CycleCount() {

    const tableId = 'CycleCount'
    const { setTableSort, tableSort } = useUIStore()
    const data = useSortedData(tableId)
    const weeklyData = useWeeklyData()
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [showDateModal, setShowDateModal] = useState(false)
    const [importFormat, setImportFormat] = useState<'clear' | 'overwrite' | 'add'>('add')
    const { cycleCountView, setCycleCountView } = useUIStore()
    const displayData = cycleCountView === "weekly" ? weeklyData : data

    const import_data = async (file: File, format: 'clear' | 'overwrite' | 'add') => {
        if ( !file ) return;
        setPendingFile(file)
        setImportFormat(format)
        setShowDateModal(true)
    }

    const onConfirmDate = async (date: Date) => {
        setShowDateModal(false)
        if (pendingFile) {
            await onExcelUpload(pendingFile, date, importFormat)
            setPendingFile(null)
        }
    }

  const totalSkus = data.length
  const totalPalletVariance = data.reduce((sum, d) => sum + d.palletsVariance, 0)
  const totalCaseVariance = data.reduce((sum, d) => sum + d.casesVariance, 0)
  const varianceCount = data.filter(
    d => d.palletsVariance !== 0 || d.casesVariance !== 0
  ).length

  return (
    <div className="cycle-count-page">
        {showDateModal && (
            <CycleCountDateModal
                isOpen={showDateModal}
                onClose={() => setShowDateModal(false)}
                onConfirm={(date) => {
                    console.log("Selected date:", date)
                    onConfirmDate(date)
                }}
            />
        )}
        <div className="cycle-count-content">
            <Header onImportClick={import_data} showFilters={{date: true, filetype: '.xlsx'}}/>
            <div className="cycle-dashboard">

            <div className="view-toggle">
                <button
                    className={cycleCountView === "latest" ? "active" : ""}
                    onClick={() => setCycleCountView("latest")}
                >
                    Latest
                </button>

                <button
                    className={cycleCountView === "weekly" ? "active" : ""}
                    onClick={() => setCycleCountView("weekly")}
                >
                    Weekly
                </button>

                <button
                    className={cycleCountView === "all" ? "active" : ""}
                    onClick={() => setCycleCountView("all")}
                >
                    All Counts
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="summary-grid">
                <div className="summary-card">
                <div className="summary-label">Total SKUs</div>
                <div className="summary-value">{totalSkus}</div>
                </div>

                <div className="summary-card">
                <div className="summary-label">SKUs With Variance</div>
                <div className="summary-value">{varianceCount}</div>
                </div>

                <div className="summary-card">
                <div className="summary-label">Total Pallet Variance</div>
                <div className="summary-value">{totalPalletVariance}</div>
                </div>

                <div className="summary-card">
                <div className="summary-label">Total Case Variance</div>
                <div className="summary-value">{totalCaseVariance}</div>
                </div>
            </div>

            {/* TABLE */}
            <div className="table-wrapper">
                <table className="cycle-table">
                <thead>
                    <tr>
                        {cycleCountView !== "latest"  && (
                            <th
                                onClick={() => setTableSort(tableId, "countDate")}
                                className={
                                tableSort[tableId]?.column === "countDate" ? "active-sort" : ""
                                }
                            >
                                Date
                            </th>
                        )}
                    {[
                        cycleCountView !== "weekly" ? { key: "material", label: "Material" } : null,
                        { key: "pallets", label: "Pallets" },
                        { key: "cases", label: "Cases" },
                        { key: "palletsVariance", label: "Pallet Variance" },
                        { key: "casesVariance", label: "Case Variance" },
                    ].map(col => (
                        col &&
                        <th
                        key={col.key}
                        onClick={() => setTableSort(tableId, col.key)}
                        className={
                            tableSort[tableId] && tableSort[tableId].column === col.key
                            ? "active-sort"
                            : ""
                        }
                        >
                        {col.label}
                        {tableSort[tableId] && tableSort[tableId].column === col.key && (
                            <span className="sort-indicator">
                            {tableSort[tableId].direction === "asc" ? " ▲" : " ▼"}
                            </span>
                        )}
                        </th>
                    ))}
                    </tr>
                </thead>

                <tbody>
                    {displayData.map(record => {
                    const hasVariance =
                        record.palletsVariance !== 0 ||
                        record.casesVariance !== 0

                    return (
                        <tr
                        key={record.countDate + (cycleCountView === "weekly" ? record.countDate : (record as any).material)}
                        className={hasVariance ? "variance-row" : ""}
                        >
                        {cycleCountView !== "latest"  && (
                            <td>
                                {displayDate(record.countDate)}
                            </td>
                            )}
                        {cycleCountView !== "weekly" && (
                            <td className="material-cell">{(record as any).material}</td>
                        )}
                        <td>{record.pallets}</td>
                        <td>{record.cases}</td>
                        <td
                            className={
                                record.palletsVariance !== 0
                                ? `variance-cell ${
                                    record.palletsVariance > 0 ? "positive" : "negative"
                                    }`
                                : ""
                            }
                        >
                            {record.palletsVariance}
                        </td>
                        <td className={
                            record.casesVariance !== 0
                            ? "variance-cell"
                            : ""
                        }>
                            {record.casesVariance}
                        </td>
                        </tr>
                    )
                    })}
                </tbody>
                </table>
            </div>
            </div>
        </div>
    </div>
  )
}