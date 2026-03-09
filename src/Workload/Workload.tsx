
import './Workload.css';
import { importSalesData } from "../Data/SalesData";
import { useWorkload } from "./getWorkload";
import Header from "../Bars/Header";
import { NextDayChart } from "./NextdayCharts";
import { WorkloadTable } from "./WorkloadTable";

const NextDayCard = ({ day }: { day: WorkloadDay }) => {
    return (
        <div className="next-day-card">
            <h2>Next Pick Day</h2>
            <h3>{day.date.toLocaleDateString()}</h3>
            <div className="next-day-stats">
                <div>Full Pallets: {day.fullPallets}</div>
                <div>Voice Picks: {day.voicePicks}</div>
            </div>
        </div>
    )
}

const BackOrdersCard = ({ backOrders }: { backOrders: { voiceqty: number; pallets: number }[] }) => {
    return (
        <div className="next-day-card">
            <h2>Back Orders</h2>
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

    const { workload, salesordersByDay, backOrders } = useWorkload();
    const nextPickDay = workload[1];
    console.log(backOrders)

    return (
        <div className="workload-page">
            <div className="workload-content">
                <Header onImportClick={handleSalesImport} showFilters={{layout: false, filter: false, date: true, filetype: '.txt'}}/>
                <div className="workload-main">
                    {nextPickDay && ( <NextDayCard day={nextPickDay} />)}
                    <BackOrdersCard backOrders={backOrders} />
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