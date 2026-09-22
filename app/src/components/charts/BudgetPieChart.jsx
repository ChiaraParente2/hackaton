import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { euro, pct } from '../../utils/finance'

const VOCI = [
  { key: 'speseFisse', name: 'Spese fisse', fill: '#ef4444', icona: '🏠' },
  { key: 'spesePersonali', name: 'Vita quotidiana', fill: '#facc15', icona: '🍕' },
  { key: 'risparmio', name: 'Futuro', fill: '#22c55e', icona: '🌱' },
]

export default function BudgetPieChart({ speseFisse, spesePersonali, risparmio }) {
  const valori = { speseFisse, spesePersonali, risparmio }
  const data = VOCI.map((v) => ({ ...v, value: valori[v.key] })).filter((d) => d.value > 0)
  const totale = speseFisse + spesePersonali + risparmio

  return (
    <div className="flex items-center gap-2">
      <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              stroke="#0f172a"
              strokeWidth={2}
              isAnimationActive
              animationDuration={500}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name) => [`${euro(v)} · ${pct(v, totale)}%`, name]}
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* totale al centro del donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-[9px] text-slate-500 leading-none">totale</span>
          <span className="font-mono text-sm font-bold text-slate-100 leading-tight">
            {euro(totale)}
          </span>
        </div>
      </div>

      {/* legenda leggibile, con euro e percentuale */}
      <div className="flex-1 space-y-1.5 min-w-0">
        {VOCI.map((v) => {
          const valore = valori[v.key]
          return (
            <div key={v.key} className="flex items-center gap-2">
              <span className="text-sm shrink-0">{v.icona}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-1">
                  <span className="font-mono text-[10px] text-slate-400 truncate">{v.name}</span>
                  <span className="font-mono text-[11px] font-bold shrink-0" style={{ color: v.fill }}>
                    {euro(valore)}
                  </span>
                </div>
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct(valore, totale)}%`, background: v.fill }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
