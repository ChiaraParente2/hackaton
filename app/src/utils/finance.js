// ─── Modello economico del gioco ────────────────────────────────────────────
// Unica fonte di verità per i numeri. Nessuna scena ricalcola formule a mano:
// se un valore serve da qualche parte, esce da qui.

export const STIPENDIO = 1400

// Spese mensili tipiche di chi vive da solo con 1.400€ netti.
// Il fondo emergenza si misura in mesi di SPESE, mai in mesi di stipendio.
export const SPESE_MENSILI = 950

export const MESI_OBIETTIVO = 3
export const OBIETTIVO_FONDO = SPESE_MENSILI * MESI_OBIETTIVO // 2.850€

export const INVESTIMENTI = [
  {
    id: 'liquidita',
    nome: 'Conto deposito',
    rendimento: 0.03,
    rischio: 1,
    descrizione: 'Tasso fisso ~3% lordo. Capitale sempre disponibile.',
  },
  {
    id: 'etf',
    nome: 'ETF globale',
    rendimento: 0.07,
    rischio: 3,
    descrizione: 'Indice mondiale diversificato. Media storica ~7% annuo, ma con anni in perdita.',
  },
  {
    id: 'azionario',
    nome: 'Azionario attivo',
    rendimento: 0.08,
    rischio: 5,
    descrizione: "Punta a battere l'indice: spesso non ci riesce e costa di più in commissioni.",
  },
]

const fmtEuro = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function euro(n) {
  return fmtEuro.format(Math.round(Number(n) || 0))
}

/** Valore futuro di un capitale iniziale più versamenti mensili costanti. */
export function proiezione(capitaleIniziale, versamentoMensile, anni, tassoAnnuo) {
  const r = tassoAnnuo / 12
  const n = anni * 12
  const daVersamenti =
    r === 0 ? versamentoMensile * n : versamentoMensile * ((Math.pow(1 + r, n) - 1) / r)
  return Math.round(capitaleIniziale * Math.pow(1 + r, n) + daVersamenti)
}

/** Mesi di spese coperti da un fondo già accumulato. */
export function mesiCoperti(fondoTotale, spese = SPESE_MENSILI) {
  return spese > 0 ? fondoTotale / spese : 0
}

/** Mesi necessari a raggiungere l'obiettivo versando `mensile` ogni mese. */
export function mesiPerObiettivo(mensile, obiettivo = OBIETTIVO_FONDO) {
  return mensile > 0 ? Math.ceil(obiettivo / mensile) : Infinity
}

export function totaleBollette(bollette) {
  return bollette.luce + bollette.gas + bollette.internet
}

/**
 * Unica verità sul saldo di fine mese.
 * Il saldo NON vive nello stato: si ricava sempre da qui, così l'estratto
 * conto non può mostrare voci che non incidono sul totale.
 */
export function calcolaSaldo(s) {
  return (
    s.stipendio -
    s.allocazioni.speseFisse -
    s.spesaSupermercato -
    totaleBollette(s.bollette) -
    s.costoImprevisto -
    s.fondoEmergenza -
    s.fondoInvestimento
  )
}

/** Le voci dell'estratto conto, nello stesso ordine in cui compongono il saldo. */
export function vociEstrattoConto(s) {
  return [
    { label: 'Stipendio netto', valore: s.stipendio, tipo: 'entrata' },
    { label: 'Spese fisse', valore: -s.allocazioni.speseFisse, tipo: 'uscita' },
    { label: 'Spesa supermercato', valore: -s.spesaSupermercato, tipo: 'uscita' },
    { label: 'Bollette', valore: -totaleBollette(s.bollette), tipo: 'uscita' },
    { label: 'Imprevisto', valore: -s.costoImprevisto, tipo: 'uscita' },
    { label: 'Fondo emergenza', valore: -s.fondoEmergenza, tipo: 'risparmio' },
    { label: 'Investimento', valore: -s.fondoInvestimento, tipo: 'risparmio' },
  ].filter((v) => v.valore !== 0)
}

/**
 * Punteggio 0-100 basato sui COMPORTAMENTI.
 * Il calcolo precedente (fondoEmergenza + fondoInvestimento) era sempre uguale
 * al budget della scena 1, perché le due voci sommano al totale allocato: la
 * ripartizione scelta dal giocatore non spostava nulla.
 */
export function calcolaPunteggio(s) {
  const saldo = calcolaSaldo(s)
  const mesi = mesiPerObiettivo(s.fondoEmergenza)
  let p = 0
  if (Number.isFinite(mesi)) p += Math.round(40 * Math.min(1, 12 / mesi))
  if (s.fondoInvestimento > 0) p += 25
  if (s.tipoInvestimento === 'etf') p += 5 // diversificare vale qualcosa
  if (saldo >= 0) p += 20
  if (s.imprevistoAffrontato && saldo >= 0) p += 10
  return Math.max(0, Math.min(100, p))
}

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
