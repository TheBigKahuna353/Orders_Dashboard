import { useUIStore } from "../Stores/UIStore";



import React from "react";
import { WIDGET_DEFAULT_SETTINGS } from "../Widgets/Widgets";

const RANGE_OPTIONS = [
    { value: "all", label: "All" },
    { value: "week", label: "This Week" },
    { value: "today", label: "Today" },
];
const FILTER_OPTIONS: { value: Filter; label: string }[] = [
    { value: "All", label: "All" },
    { value: "All Out of Town", label: "All Out of Town" },
    { value: "Out of town small", label: "Out of town small" },
    { value: "All Locals", label: "All Locals" },
    { value: "Locals small", label: "Locals small" },
    { value: "Bulk", label: "Bulk" },
];

// Fixed list of possible columns
const ALL_COLUMNS = [
    { key: "customer", label: "Customer" },
    { key: "totalPallets", label: "Pallets" },
    { key: "totalWeight", label: "Weight" },
    { key: "totalVolume", label: "Volume" },
    { key: "orders", label: "Orders" },
    { key: "status", label: "Status" },
    { key: "deliverDate", label: "Delivery Date" },
];


export function WidgetSettingsPanel({ widget, onClose }: { widget: DashboardWidget | null, onClose: () => void }) {
    const widgetSettings = useUIStore(s => widget?.id ? s.widgetSettings[widget.id] : undefined);
    const setWidgetSettings = useUIStore(s => s.setWidgetSettings);

    console.log("Rendering settings for widget", widget?.id, widgetSettings);
    if (!widget?.id) {
        return null;
    }
    if (!widgetSettings) {
        // initialize settings if not present (can happen if widget was just added)
        setWidgetSettings(widget.id, WIDGET_DEFAULT_SETTINGS[widget.type]);
        return null; // will re-render with settings on next tick
    }


    // visibleColumns: ColumnConfig[]
    const visibleColumns: ColumnConfig[] = widgetSettings.columns || ALL_COLUMNS;

    const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setWidgetSettings(widget?.id, { ...widgetSettings, range: e.target.value as "all" | "week" | "today" });
    };
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setWidgetSettings(widget?.id, { ...widgetSettings, orderFilter: e.target.value as Filter });
    };
    const handleColumnToggle = (key: string) => {
        let next: ColumnConfig[];
        if (visibleColumns.some(col => col.key === key)) {
            next = visibleColumns.filter(col => col.key !== key);
        } else {
            const colToAdd = ALL_COLUMNS.find(col => col.key === key);
            next = colToAdd ? [...visibleColumns, colToAdd] : visibleColumns;
        }
        setWidgetSettings(widget?.id, { ...widgetSettings, columns: next });
    };

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '400px',
                    height: '100vh',
                    background: 'var(--bg-panel, #fff)',
                    boxShadow: '-2px 0 16px rgba(0,0,0,0.15)',
                    zIndex: 3000,
                    transition: 'transform 0.2s',
                    padding: 32,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <button
                    style={{ position: 'absolute', top: 16, right: 16, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={onClose}
                    aria-label="Close widget settings"
                >
                    ×
                </button>
                <h2 style={{marginTop: 0}}>Widget Settings</h2>
                <div style={{marginBottom: 24}}>
                    <label style={{fontWeight: 500}}>Range:</label>
                    <select value={widgetSettings.range} onChange={handleRangeChange} style={{marginLeft: 12, padding: 4}}>
                        {RANGE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div style={{marginBottom: 24}}>
                    <label style={{fontWeight: 500}}>Order Filter:</label>
                    <select value={widgetSettings.orderFilter} onChange={handleFilterChange} style={{marginLeft: 12, padding: 4}}>
                        {FILTER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div style={{marginBottom: 24}}>
                    <label style={{fontWeight: 500}}>Columns:</label>
                    <div style={{marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6}}>
                        {ALL_COLUMNS.map(col => (
                            <label key={col.key} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.some(vcol => vcol.key === col.key)}
                                    onChange={() => handleColumnToggle(col.key)}
                                />
                                {col.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.18)',
                    zIndex: 2999,
                }}
                onClick={onClose}
            />
        </>
    );
}