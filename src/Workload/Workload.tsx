
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

function Workload() {

    const handleSalesImport = async (file: File) => {
        importSalesData(file)
    }

    const { workload, salesordersByDay } = useWorkload();
    const nextPickDay = workload[1];

    return (
        <div className="workload-page">
            <div className="workload-content">
                <Header onImportClick={handleSalesImport} showFilters={{layout: false, filter: false, date: true, filetype: '.txt'}}/>
                <div className="workload-main">
                    {nextPickDay && ( <NextDayCard day={nextPickDay} />)}
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