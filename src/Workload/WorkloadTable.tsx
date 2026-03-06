import { toDateOnlyString } from "../Data/Dates";

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
                  const salesorders = salesordersByDay[dayKey] || [];
                  console.log(salesorders)
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>{day.date.toLocaleDateString()}</td>
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