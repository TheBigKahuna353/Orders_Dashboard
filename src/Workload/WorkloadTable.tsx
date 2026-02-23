type TableProps = {
  workload: WorkloadDay[]
}

export function WorkloadTable({ workload }: TableProps) {

  if (!workload.length) {
    return <div className="workload-empty">No workload data</div>
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
          {workload.map(day => (
            <tr key={day.date.toISOString()}>
              <td>
                {day.date.toLocaleDateString()}
              </td>
              <td>{day.fullPallets}</td>
              <td>{day.voicePicks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}