import { toDateOnlyString } from "../Data/Dates";
import { getMaterialsFromOrders } from "../Data/SalesData";

type TableProps = {
  workload: WorkloadDay[];
  salesordersByDay: Record<string, Salesorder[]>;
}

export function WorkloadTable({ workload, salesordersByDay }: TableProps) {
  if (!workload.length) {
    return <div className="workload-empty">No workload data</div>;
  }


  return (
    <div className="workload-table-wrapper">
      <h3>Upcoming Pick Days</h3>
      <table className="workload-table">
        <thead>
          <tr>
            <th>Pick Date</th>
            <th>Number of Orders</th>
            <th>Full Pallets</th>
            <th>Voice Picks</th>
          </tr>
        </thead>
        <tbody>
          {workload.map(day => {
            const dayKey = toDateOnlyString(day.date);
            return (
              <tr
                key={day.date.toISOString()}
                onClick={() => {
                  const mats = getMaterialsFromOrders(salesordersByDay[dayKey] || []);
                  console.log(mats)
                  console.log(salesordersByDay[dayKey])
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>{day.date.toLocaleDateString()}</td>
                <td>{day.salesOrderNumbers.size}</td>
                <td>{day.fullPallets}</td>
                <td>{day.voicePicks}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}