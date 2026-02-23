import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

type Props = {
  day?: WorkloadDay
}

export function NextDayChart({ day }: Props) {

  if (!day) return null

  const data = [
    {
      name: "Workload",
      FullPallets: day.fullPallets,
      VoicePicks: day.voicePicks
    }
  ]

  return (
    <div className="workload-chart">
      <h3>Next Pick Day Breakdown</h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="FullPallets" />
          <Bar dataKey="VoicePicks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}