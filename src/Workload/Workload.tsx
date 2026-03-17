
import './Workload.css';
import { importSalesData } from "../Data/SalesData";
import { useWorkload } from "./getWorkload";
import Header from "../Bars/Header";
import { NextDayChart } from "./NextdayCharts";
import { WorkloadTable } from "./WorkloadTable";


const WorkloadCard = ({ title, day }: { title: string, day: WorkloadDay | null }) => {
    if (!day) return null;
    return (
        <div className="next-day-card">
            <h2>{title}</h2>
            <h3>{day.date.toLocaleDateString()}</h3>
            <div className="next-day-stats">
                <div>Full Pallets: {day.fullPallets}</div>
                <div>Voice Picks: {day.voicePicks}</div>
            </div>
        </div>
    )
}

const BackOrdersCard = ({ backOrders, numBackOrders }: { backOrders: { voiceqty: number; pallets: number }[], numBackOrders: number }) => {
    return (
        <div className="next-day-card">
            <h2>Back Orders</h2>
            <h3>{numBackOrders} orders</h3>
            <div className="next-day-stats">
                <div>Full Pallets: {backOrders.reduce((sum, order) => sum + order.pallets, 0)}</div>
                <div>Voice Picks: {backOrders.reduce((sum, order) => sum + order.voiceqty, 0)}</div>
            </div>
        </div>
    )
}

function Workload() {

    const handleSalesImport = async (file: File) => {
        importSalesData(file)
    }

    const { workload, salesordersByDay, backOrders, numBackOrders } = useWorkload();
    const currentDay = workload[0] || null;
    const nextPickDay = workload[1] || null;

    return (
        <div className="workload-page">
            <div className="workload-content">
                <Header onImportClick={handleSalesImport} showFilters={{date: true, filetype: '.txt'}}/>
                <div className="workload-main">
                    <div className="workload-cards-row">
                        <WorkloadCard title="Current Day" day={currentDay} />
                        <WorkloadCard title="Next Pick Day" day={nextPickDay} />
                        <BackOrdersCard backOrders={backOrders} numBackOrders={numBackOrders} />
                    </div>
                    <NextDayChart day={nextPickDay} />
                    <WorkloadTable
                        workload={workload}
                        salesordersByDay={salesordersByDay}
                    />
                </div>
            </div>
        </div>
    );
}

export default Workload;