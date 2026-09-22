import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function capitaleFinal(anni, tassoAnnuo, versamento = 100) {
  const r = tassoAnnuo / 12
  if (r === 0) return versamento * anni * 12
  const n = anni * 12
  return Math.round(versamento * ((Math.pow(1 + r, n) - 1) / r))
}

const data = Array.from({ length: 21 }, (_, y) => ({
  anno: y,
  '3%': capitaleFinal(y, 0.03),
  '7%': capitaleFinal(y, 0.07),
  '10%': capitaleFinal(y, 0.10),
}))

export default function CompoundInterestChart() {
  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="anno" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'anni', position: 'insideBottom', fill: '#64748b', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
          <Tooltip
            formatter={(v) => `${v.toLocaleString('it')}€`}
            contentStyle={{ background: '#1e293b', border: '1px solid #475569', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          <Line type="monotone" dataKey="3%" stroke="#60a5fa" strokeWidth={2} dot={false} animationDuration={1500} />
          <Line type="monotone" dataKey="7%" stroke="#4ade80" strokeWidth={2} dot={false} animationDuration={1500} />
          <Line type="monotone" dataKey="10%" stroke="#fb923c" strokeWidth={2} dot={false} animationDuration={1500} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-slate-500 text-xs italic text-center mt-1">Versando 100€/mese. Stime storiche medie, non garanzie future.</p>
    </div>
  )
}
