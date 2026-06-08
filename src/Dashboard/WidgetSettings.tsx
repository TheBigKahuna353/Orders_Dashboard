import { useUIStore } from "../Stores/UIStore";
import React from "react";
import { WIDGET_DEFAULT_SETTINGS } from "../Widgets/WidgetDefaults";
import './WidgetSettings.css';

const RANGE_OPTIONS = [
    { value: "all", label: "All" },
    { value: "week", label: "This Week" },
    { value: "today", label: "Today" },
    { value: "month", label: "This Month" },
    { value: "7 days", label: "Last 7 Days" },
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
            <div className="widget-settings-panel">
                <button
                    className="widget-settings-close-btn"
                    onClick={onClose}
                    aria-label="Close widget settings"
                >
                    X
                </button>
                <h2 className="widget-settings-title">Widget Settings</h2>
                {/* Date Mode Toggle */}
                <div className="widget-settings-section">
                    <label className="widget-settings-label">Date Mode:</label>
                    <div className="widget-settings-date-toggle">
                        <div className="widget-settings-segmented">
                            <div
                                className={
                                    'widget-settings-segmented-highlight ' +
                                    (widgetSettings.dateMode === 'pick' ? 'left' : 'right')
                                }
                            />
                            <button
                                type="button"
                                className={
                                    'widget-settings-segmented-btn' +
                                    (widgetSettings.dateMode === 'pick' ? ' active' : '')
                                }
                                onClick={() => setWidgetSettings(widget.id, { ...widgetSettings, dateMode: 'pick' })}
                            >
                                Pick Date
                            </button>
                            <button
                                type="button"
                                className={
                                    'widget-settings-segmented-btn' +
                                    (widgetSettings.dateMode === 'delivery' ? ' active' : '')
                                }
                                onClick={() => setWidgetSettings(widget.id, { ...widgetSettings, dateMode: 'delivery' })}
                            >
                                Delivery Date
                            </button>
                        </div>
                    </div>
                </div>
                <div className="widget-settings-section">
                    <label className="widget-settings-label">Range:</label>
                    <select value={widgetSettings.range} onChange={handleRangeChange} style={{marginLeft: 12, padding: 4}}>
                        {RANGE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="widget-settings-section">
                    <label className="widget-settings-label">Order Filter:</label>
                    <select value={widgetSettings.orderFilter} onChange={handleFilterChange} style={{marginLeft: 12, padding: 4}}>
                        {FILTER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="widget-settings-section">
                    <label className="widget-settings-label">Columns:</label>
                    <div className="widget-settings-columns-list">
                        {ALL_COLUMNS.map(col => (
                            <label key={col.key} className="widget-settings-column-label">
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
                className="widget-settings-backdrop"
                onClick={onClose}
            />
        </>
    );
}