import Header from "../Bars/Header";
import { onExcelUpload } from "../Data/Excel";
import { useUIStore } from "../Stores/UIStore";
import './CycleCount.css';
import useSortedData from "./Getdata";

export default function CycleCount() {

    const import_data = async (file: File) => {
        if ( !file ) return;
        await onExcelUpload(file);
    }
    const tableId = 'CycleCount'
    const { setTableSort, tableSort } = useUIStore()
    const data = useSortedData(tableId)


  const totalSkus = data.length
  const totalPalletVariance = data.reduce((sum, d) => sum + d.palletsVariance, 0)
  const totalCaseVariance = data.reduce((sum, d) => sum + d.casesVariance, 0)
  const varianceCount = data.filter(
    d => d.palletsVariance !== 0 || d.casesVariance !== 0
  ).length

  return (
    <div className="cycle-count-page">
        <div className="cycle-count-content">
            <Header onImportClick={import_data} showFilters={{date: true, filetype: '.xlsx'}}/>
            <div className="cycle-dashboard">

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
                    {[
                        { key: "material", label: "Material" },
                        { key: "pallets", label: "Pallets" },
                        { key: "cases", label: "Cases" },
                        { key: "palletsVariance", label: "Pallet Variance" },
                        { key: "casesVariance", label: "Case Variance" },
                    ].map(col => (
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
                    {data.map(record => {
                    const hasVariance =
                        record.palletsVariance !== 0 ||
                        record.casesVariance !== 0

                    return (
                        <tr
                        key={record.material}
                        className={hasVariance ? "variance-row" : ""}
                        >
                        <td className="material-cell">{record.material}</td>
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