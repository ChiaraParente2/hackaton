import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function BudgetPieChart({ speseFisse, spesePersonali, risparmio }) {
  const data = [
    { name: 'Spese fisse', value: speseFisse, fill: '#ef4444' },
    { name: 'Vita personale', value: spesePersonali, fill: '#facc15' },
    { name: 'Futuro', value: risparmio, fill: '#22c55e' },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={70}
          dataKey="value"
          isAnimationActive
          animationDuration={600}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => `${v}€`}
          contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
