
import React from "react";
import DatePicker from "react-datepicker";
import { usePickupPlans } from "./GetPickupPlans";
import "./MobilePickups.css";

interface Props {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}

// Helper: is pickupTime in the past?
function pastTime(time: string) {
    if (!time || time === "Next Day" || time === "--" || time === "Unassigned") return false;
    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    return hours < nowHours || (hours === nowHours && minutes < nowMinutes);
}

export const MobilePickups: React.FC<Props> = ({ selectedDate, setSelectedDate }) => {
    const { groupedByTime } = usePickupPlans(selectedDate);
    const [showSummary, setShowSummary] = React.useState<{ [time: string]: boolean }>({});

    // Sort time keys: earliest first, unassigned last
    const sortedTimeGroups = Object.entries(groupedByTime).sort(([a], [b]) => {
        if (a === "--") return 1;
        if (b === "--") return -1;
        if (a === b) return 0;
        const [ah, am] = a.split(":").map(Number);
        const [bh, bm] = b.split(":").map(Number);
        if (isNaN(ah) || isNaN(am)) return 1;
        if (isNaN(bh) || isNaN(bm)) return -1;
        return ah !== bh ? ah - bh : am - bm;
    });

    const isEmpty = sortedTimeGroups.length === 0 || sortedTimeGroups.every(([, plans]) => plans.length === 0);

    return (
        <div className="mobile-pickups-root">
            {/* Sticky header */}
            <div className="mobile-pickups-header">
                <div className="mobile-pickups-header-row">
                    <span className="mobile-pickups-title">Pickups</span>
                    <div className="mobile-pickups-datepicker-wrapper">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date: string | number | Date | null) => {
                                if (date) setSelectedDate(new Date(date));
                            }}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select date"
                            popperPlacement="bottom-end"
                            className="mobile-pickups-datepicker"
                        />
                    </div>
                </div>
            </div>

            <div className="mobile-pickups-list">
                {isEmpty ? (
                    <div className="mobile-pickups-empty">
                        No pickups
                    </div>
                ) : (
                    sortedTimeGroups.map(([time, plans]) => {
                        // Calculate summary
                        const totalPallets = plans.reduce((sum, p) => sum + p.order.totalPallets, 0);
                        const locations = Array.from(new Set(plans.map(p => p.plan.location).filter(Boolean).map(l => l!.toUpperCase())));
                        const isSummaryOpen = showSummary[time] || false;
                        return (
                            <div key={time} className="mobile-pickups-group">
                                <div className="mobile-pickups-group-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                    <span>{time === '--' ? 'Unassigned' : time}</span>
                                    <button
                                        className="mobile-pickups-summary-btn"
                                        onClick={() => setShowSummary(s => ({ ...s, [time]: !isSummaryOpen }))}
                                        style={{ fontSize: 13, padding: '2px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-panel)', color: 'var(--text-primary)', cursor: 'pointer' }}
                                    >
                                        {isSummaryOpen ? 'Hide' : 'Summarise'}
                                    </button>
                                </div>
                                {isSummaryOpen ? (
                                    <div className="mobile-pickups-summary" style={{ margin: '8px 0 12px 0', padding: '8px 12px', background: 'var(--highlight-bg)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14 }}>
                                        <div><strong>Total Pallets:</strong> {totalPallets}</div>
                                        <div><strong>Locations:</strong> {locations.length > 0 ? locations.join(', ') : '—'}</div>
                                    </div>
                                ) : (
                                    <div className="mobile-pickups-cards">
                                        {plans.map(({ order, plan }) => (
                                            <div
                                                key={order.groupId}
                                                className={
                                                    'mobile-pickups-card' + (pastTime(plan.pickupTime || time) ? ' past' : '')
                                                }
                                            >
                                                <div className="mobile-pickups-card-customer">
                                                    {order.customer}
                                                </div>
                                                <div className="mobile-pickups-card-row">
                                                    <span className="mobile-pickups-card-pallets">
                                                        Pallets: {order.totalPallets}
                                                    </span>
                                                    {plan.location && (
                                                        <span className="mobile-pickups-card-location">
                                                            {plan.location.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mobile-pickups-card-deliveries">
                                                    {order.orders.map(o => (
                                                        <span key={o.deliveryNo} className="mobile-pickups-card-badge">
                                                            {o.deliveryNo}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

