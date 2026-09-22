import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { INVESTIMENTI, proiezione, euro } from '../../utils/finance'

const ANNI = 20

const COLORI = {
  liquidita: '#60a5fa',
  etf: '#4ade80',
  azionario: '#fb923c',
}

/**
 * Il grafico parte dal versamento mensile che il giocatore ha davvero scelto:
 * senza props mostrava sempre la stessa curva, qualunque cosa allocasse.
 */
export default function CompoundInterestChart({ versamentoMensile = 100, evidenzia = null }) {
  const data = Array.from({ length: ANNI + 1 }, (_, anno) => {
    const punto = { anno }
    for (const inv of INVESTIMENTI) {
      punto[inv.nome] = proiezione(0, versamentoMensile, anno, inv.rendimento)
    }
    return punto
  })

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="anno"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{ value: 'anni', position: 'insideBottom', fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k€`}
          />
          <Tooltip
            formatter={(v) => euro(v)}
            labelFormatter={(a) => `Dopo ${a} anni`}
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #475569',
              borderRadius: 8,
              color: '#f1f5f9',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          {INVESTIMENTI.map((inv) => (
            <Line
              key={inv.id}
              type="monotone"
              dataKey={inv.nome}
              stroke={COLORI[inv.id]}
              strokeWidth={evidenzia === inv.id ? 3.5 : 1.5}
              strokeOpacity={evidenzia && evidenzia !== inv.id ? 0.35 : 1}
              dot={false}
              animationDuration={1500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-slate-500 text-xs italic text-center mt-1">
        Versando {euro(versamentoMensile)}/mese. Stime storiche medie, non garanzie future.
      </p>
    </div>
  )
}
