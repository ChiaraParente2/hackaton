// ─── Modello economico del gioco ────────────────────────────────────────────
// Unica fonte di verità per i numeri. Nessuna scena ricalcola formule a mano:
// se un valore serve da qualche parte, esce da qui.

export const STIPENDIO = 1400

// ─── Casa ───────────────────────────────────────────────────────────────────
// L'affitto è la voce che pesa di più su un primo stipendio: sceglierlo è già
// mezzo budget. Una volta scelto è una spesa FISSA e non si tocca più.
export const ALLOGGI = [
  {
    id: 'doppia',
    gradiente: 'from-emerald-500 to-teal-700',
    nome: 'Stanza in doppia',
    emoji: '🛏️',
    affitto: 250,
    privacy: 1,
    tag: '💰 massimo margine',
    descrizione: 'Dividi la camera con un altro. Poca privacy, tantissimo margine.',
  },
  {
    id: 'singola',
    gradiente: 'from-sky-500 to-indigo-700',
    nome: 'Stanza singola',
    emoji: '🚪',
    affitto: 400,
    privacy: 2,
    tag: '⚖️ il compromesso',
    descrizione: 'Camera tua in appartamento condiviso. La scelta più comune.',
  },
  {
    id: 'monolocale',
    gradiente: 'from-amber-500 to-orange-700',
    nome: 'Monolocale',
    emoji: '🏠',
    affitto: 550,
    privacy: 3,
    tag: '🎯 esattamente il 50%',
    descrizione: 'Tutto tuo, ma piccolo. Nessun coinquilino da sopportare.',
  },
  {
    id: 'bilocale',
    gradiente: 'from-rose-500 to-red-800',
    nome: 'Bilocale',
    emoji: '🏡',
    affitto: 750,
    privacy: 4,
    tag: '⚠️ mezzo stipendio',
    descrizione: 'Spazio vero, camera e soggiorno separati. Si paga, però.',
  },
]

// Trasporti, telefono, assicurazione: fisse qualunque casa tu scelga.
export const ALTRE_SPESE_FISSE = 150

export function alloggioDi(id) {
  return ALLOGGI.find((a) => a.id === id) ?? null
}

export function speseFisseDi(id) {
  const a = alloggioDi(id)
  return a ? a.affitto + ALTRE_SPESE_FISSE : 0
}

// ─── Fondo emergenza ────────────────────────────────────────────────────────
// Spesa alimentare e bollette tipiche: la parte che non dipende dalla casa.
export const SPESE_VARIABILI_TIPICHE = 350
export const MESI_OBIETTIVO = 3

/** Spese mensili totali stimate, in base alla casa scelta. */
export function speseMensiliStimate(s) {
  return (s.allocazioni?.speseFisse || 0) + SPESE_VARIABILI_TIPICHE
}

/** Obiettivo fondo emergenza: 3 mesi delle TUE spese, non di una media. */
export function obiettivoFondo(s) {
  return MESI_OBIETTIVO * speseMensiliStimate(s)
}

// ─── Investimenti ───────────────────────────────────────────────────────────
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

// ─── Formattazione e calcoli ────────────────────────────────────────────────
const fmtEuro = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function euro(n) {
  return fmtEuro.format(Math.round(Number(n) || 0))
}

/** Quota sullo stipendio, arrotondata: è l'unità con cui si ragiona di budget. */
export function pct(valore, totale = STIPENDIO) {
  return totale > 0 ? Math.round((valore / totale) * 100) : 0
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
export function mesiCoperti(fondoTotale, speseMensili) {
  return speseMensili > 0 ? fondoTotale / speseMensili : 0
}

/** Mesi necessari a raggiungere l'obiettivo versando `mensile` ogni mese. */
export function mesiPerObiettivo(mensile, obiettivo) {
  return mensile > 0 ? Math.ceil(obiettivo / mensile) : Infinity
}

export function totaleBollette(bollette) {
  return bollette.luce + bollette.gas + bollette.internet
}

// ─── I tuoi soldi ───────────────────────────────────────────────────────────
// Tre grandezze distinte, per non confondere "spendere" con "mettere da parte":
//
//   conto corrente  quello che ti resta libero questo mese
//   salvadanaio     fondo emergenza (al netto di quanto hai dovuto usarne)
//                   + investimento
//   patrimonio      conto + salvadanaio = il vero punteggio
//
// Spostare soldi nel salvadanaio NON abbassa il patrimonio: lo abbassa solo
// spendere. Prima risparmiare faceva scendere il contatore, premiando la
// scelta sbagliata.

/** Quanto hai effettivamente da parte: il fondo può essere stato intaccato. */
export function salvadanaio(s) {
  return Math.max(0, s.fondoEmergenza - s.imprevistoDaFondo) + s.fondoInvestimento
}

/** Conto corrente: i soldi liberi rimasti questo mese. */
export function contoCorrente(s) {
  return (
    s.stipendio -
    s.allocazioni.speseFisse -
    s.fondoEmergenza -
    s.fondoInvestimento -
    s.spesaSupermercato -
    totaleBollette(s.bollette) -
    s.imprevistoDaConto
  )
}

/** Patrimonio = conto + salvadanaio. Scende solo quando spendi davvero. */
export function patrimonio(s) {
  return contoCorrente(s) + salvadanaio(s)
}

/** Le voci del riepilogo, nello stesso ordine in cui compongono il patrimonio. */
export function vociEstrattoConto(s) {
  const casa = alloggioDi(s.alloggio)
  return [
    { label: 'Stipendio netto', valore: s.stipendio, tipo: 'entrata' },
    {
      label: casa ? `Affitto e fisse (${casa.nome.toLowerCase()})` : 'Spese fisse',
      valore: -s.allocazioni.speseFisse,
      tipo: 'uscita',
    },
    { label: 'Spesa supermercato', valore: -s.spesaSupermercato, tipo: 'uscita' },
    { label: 'Bollette', valore: -totaleBollette(s.bollette), tipo: 'uscita' },
    { label: 'Imprevisto — dal fondo', valore: -s.imprevistoDaFondo, tipo: 'uscita' },
    { label: 'Imprevisto — dal conto', valore: -s.imprevistoDaConto, tipo: 'uscita' },
  ].filter((v) => v.valore !== 0)
}

/**
 * Punteggio 0-100 basato sui COMPORTAMENTI.
 * Il calcolo precedente (fondoEmergenza + fondoInvestimento) era sempre uguale
 * al budget della scena 1, perché le due voci sommano al totale allocato: la
 * ripartizione scelta dal giocatore non spostava nulla.
 */
export function calcolaPunteggio(s) {
  const conto = contoCorrente(s)
  const mesi = mesiPerObiettivo(s.fondoEmergenza, obiettivoFondo(s))
  let p = 0
  // 35 — quanto in fretta costruisci la rete di sicurezza
  if (Number.isFinite(mesi)) p += Math.round(35 * Math.min(1, 12 / mesi))
  // 25 — investire vale, ma vale molto meno se non hai prima il fondo:
  // prima la rete, poi la crescita.
  if (s.fondoInvestimento > 0) p += s.fondoEmergenza > 0 ? 25 : 10
  if (s.tipoInvestimento === 'etf') p += 5 // diversificare vale qualcosa
  // 20 — chiudere il mese senza andare in rosso
  if (conto >= 0) p += 20
  // 15 — l'imprevisto assorbito dal fondo, senza intaccare il conto
  if (s.imprevistoAffrontato && s.imprevistoDaConto === 0) p += 15
  return Math.max(0, Math.min(100, p))
}

// ─── Glossario ──────────────────────────────────────────────────────────────
// I termini che il gioco usa davvero. Vengono mostrati col componente
// <Termine id="..."> e spiegati al tocco: un gioco di educazione finanziaria
// non può usare "TAEG" senza dire cosa significa.
export const GLOSSARIO = {
  tan: {
    sigla: 'TAN',
    nome: 'Tasso Annuo Nominale',
    testo:
      'Il tasso di interesse puro, senza le spese. È il numero che le pubblicità mettono in grande, perché è il più basso.',
  },
  taeg: {
    sigla: 'TAEG',
    nome: 'Tasso Annuo Effettivo Globale',
    testo:
      'Il costo vero del prestito: interessi PIÙ tutte le spese obbligatorie. È sempre maggiore del TAN. Quando confronti due prestiti, guarda solo questo.',
  },
  interesseComposto: {
    sigla: 'Interesse composto',
    nome: null,
    testo:
      'Gli interessi che maturano anche sugli interessi già guadagnati. È il motivo per cui il tempo conta più della cifra che versi: 10 anni battono 10.000 €.',
  },
  etf: {
    sigla: 'ETF',
    nome: 'Exchange Traded Fund',
    testo:
      'Un unico prodotto che contiene centinaia di aziende diverse. Comprandolo diversifichi in automatico e paghi commissioni molto basse.',
  },
  diversificazione: {
    sigla: 'Diversificazione',
    nome: null,
    testo:
      'Non mettere tutto in una cosa sola. Se una va male, le altre reggono. È il modo più economico di ridurre il rischio.',
  },
  liquidita: {
    sigla: 'Liquidità',
    nome: null,
    testo:
      'Quanto in fretta puoi trasformare una cosa in soldi spendibili senza perderci. Il conto è liquido, un investimento molto meno.',
  },
  inflazione: {
    sigla: 'Inflazione',
    nome: null,
    testo:
      'I prezzi che salgono nel tempo. 100 € fermi sul conto fra dieci anni comprano meno di oggi: non perdi soldi, perdi potere d\'acquisto.',
  },
  rendimento: {
    sigla: 'Rendimento',
    nome: null,
    testo:
      'Quanto guadagna un investimento in un anno, in percentuale. Quelli storici sono medie: dentro ci sono anni ottimi e anni in perdita.',
  },
  fondoEmergenza: {
    sigla: 'Fondo emergenza',
    nome: null,
    testo:
      'Da tre a sei mesi delle tue spese, tenuti liquidi e mai toccati. Serve a non finire a chiedere un prestito per una lavatrice rotta.',
  },
  regola503020: {
    sigla: 'Regola 50/30/20',
    nome: null,
    testo:
      'Una traccia, non una legge: 50% alle spese necessarie, 30% a ciò che ti fa stare bene, 20% al futuro. Se l\'affitto sfora il 50%, il resto si stringe.',
  },
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
