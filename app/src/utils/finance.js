export function capitaleFinal(anni, tassoAnnuo, versamentoMensile = 100) {
  const r = tassoAnnuo / 12
  if (r === 0) return versamentoMensile * anni * 12
  const n = anni * 12
  return versamentoMensile * ((Math.pow(1 + r, n) - 1) / r)
}

export function mesiPerFondoEmergenza(fondoEmergenza, speseBase = 1400) {
  return (fondoEmergenza / speseBase).toFixed(1)
}

export const INVESTIMENTI = [
  {
    id: 'liquidita',
    nome: 'Conto deposito',
    rendimento: 0.03,
    rischio: 1,
    descrizione: 'Tasso fisso ~3%. Sicuro, liquidabile.',
  },
  {
    id: 'etf',
    nome: 'ETF globale',
    rendimento: 0.07,
    rischio: 3,
    descrizione: 'Indice mondiale diversificato. Storico ~7% annuo.',
  },
  {
    id: 'azionario',
    nome: 'Azionario attivo',
    rendimento: 0.10,
    rischio: 5,
    descrizione: 'Alto potenziale, alta volatilità. Non garantito.',
  },
]

export const CONCETTI = [
  { id: 'budget', nome: 'Budget 50/30/20', icona: '📊' },
  { id: 'risparmio', nome: 'Pagati prima', icona: '🏦' },
  { id: 'emergenza', nome: 'Fondo emergenza', icona: '🛡️' },
  { id: 'interesse_composto', nome: 'Interesse composto', icona: '📈' },
  { id: 'investimento', nome: 'Investire i risparmi', icona: '💹' },
  { id: 'spesa_consapevole', nome: 'Spesa consapevole', icona: '🛒' },
  { id: 'bollette', nome: 'Gestione bollette', icona: '⚡' },
  { id: 'imprevisti', nome: 'Gestione imprevisti', icona: '🔧' },
  { id: 'pianificazione', nome: 'Pianificazione', icona: '🗓️' },
]
