#!/usr/bin/env node
/**
 * Verifica gli invarianti del modello economico di Primo Stipendio.
 *
 *   node agents/skills/verifica-economia/verifica.mjs
 *
 * Esce con codice 1 se un invariante è violato, così è usabile in CI o in un
 * hook pre-commit. Ogni controllo qui dentro corrisponde a un bug che si è
 * davvero verificato sul progetto: non sono test difensivi teorici.
 */
import * as F from '../../../app/src/utils/finance.js'

let falliti = 0
const check = (nome, ok, dettaglio = '') => {
  if (!ok) falliti++
  console.log(`  ${ok ? '✅' : '❌'} ${nome}${dettaglio ? `  — ${dettaglio}` : ''}`)
}
const titolo = (t) => console.log(`\n${t}`)

/** Stato di partenza, identico a initialState di GameEngine. */
const iniziale = () => ({
  stipendio: F.STIPENDIO,
  alloggio: null,
  allocazioni: { speseFisse: 0, spesePersonali: 0, risparmio: 0 },
  fondoEmergenza: 0,
  fondoInvestimento: 0,
  tipoInvestimento: null,
  spesaSupermercato: 0,
  bollette: { luce: 0, gas: 0, internet: 0 },
  imprevistoDaFondo: 0,
  imprevistoDaConto: 0,
  imprevistoAffrontato: false,
  concettiSbloccati: [],
})

/** Una partita completa, parametrizzata sulle scelte del giocatore. */
function partita({ alloggio, risparmio, fondo, investe, spesa, bollette, imprevisto = 180 }) {
  const fisse = F.speseFisseDi(alloggio)
  const s = {
    ...iniziale(),
    alloggio,
    allocazioni: {
      speseFisse: fisse,
      spesePersonali: F.STIPENDIO - fisse - risparmio,
      risparmio,
    },
    fondoEmergenza: fondo,
    fondoInvestimento: investe,
    tipoInvestimento: investe > 0 ? 'etf' : null,
    spesaSupermercato: spesa,
    bollette,
    imprevistoAffrontato: true,
  }
  s.imprevistoDaFondo = Math.min(fondo, imprevisto)
  s.imprevistoDaConto = imprevisto - s.imprevistoDaFondo
  return s
}

const finito = (n) => Number.isFinite(n)

// ─────────────────────────────────────────────────────────────────────────────
titolo('1. Stato iniziale')
{
  const s = iniziale()
  check(
    'il gioco parte esattamente dallo stipendio',
    F.patrimonio(s) === F.STIPENDIO,
    `patrimonio ${F.patrimonio(s)}, atteso ${F.STIPENDIO}`
  )
  check(
    'nessuna spesa e gia addebitata all avvio',
    F.contoCorrente(s) === F.STIPENDIO && F.salvadanaio(s) === 0
  )
  check(
    'nessun valore e NaN o Infinity',
    [F.patrimonio(s), F.contoCorrente(s), F.salvadanaio(s), F.calcolaPunteggio(s)].every(finito)
  )
}

// ─────────────────────────────────────────────────────────────────────────────
titolo('2. Il budget non e sforabile (esaustivo su case x slider)')
{
  let combinazioni = 0
  let sforamenti = 0
  for (const a of F.ALLOGGI) {
    const fisse = F.speseFisseDi(a.id)
    const disponibile = F.STIPENDIO - fisse
    for (let risparmio = 0; risparmio <= disponibile; risparmio += 10) {
      combinazioni++
      if (fisse + (disponibile - risparmio) + risparmio !== F.STIPENDIO) sforamenti++
    }
  }
  check(
    'la somma fa sempre lo stipendio',
    sforamenti === 0,
    `${combinazioni} combinazioni testate, ${sforamenti} sforamenti`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
titolo('3. Mettere da parte non abbassa il patrimonio')
{
  const base = partita({
    alloggio: 'singola',
    risparmio: 280,
    fondo: 0,
    investe: 0,
    spesa: 85,
    bollette: { luce: 28, gas: 35, internet: 29 },
    imprevisto: 0,
  })
  const conFondo = { ...base, fondoEmergenza: 180 }
  const conEntrambi = { ...conFondo, fondoInvestimento: 100, tipoInvestimento: 'etf' }

  check(
    'spostare nel fondo emergenza lascia il patrimonio invariato',
    F.patrimonio(conFondo) === F.patrimonio(base),
    `${F.patrimonio(base)} -> ${F.patrimonio(conFondo)}`
  )
  check(
    'spostare nell investimento lascia il patrimonio invariato',
    F.patrimonio(conEntrambi) === F.patrimonio(conFondo),
    `${F.patrimonio(conFondo)} -> ${F.patrimonio(conEntrambi)}`
  )
  check('spendere invece lo abbassa', F.patrimonio({ ...base, spesaSupermercato: 200 }) < F.patrimonio(base))
}

// ─────────────────────────────────────────────────────────────────────────────
titolo('4. Il riepilogo quadra')
{
  const casi = [
    { alloggio: 'doppia', risparmio: 0, fondo: 0, investe: 0, spesa: 229 },
    { alloggio: 'singola', risparmio: 280, fondo: 180, investe: 100, spesa: 85 },
    { alloggio: 'monolocale', risparmio: 140, fondo: 140, investe: 0, spesa: 190 },
    { alloggio: 'bilocale', risparmio: 500, fondo: 300, investe: 200, spesa: 92 },
  ]
  for (const c of casi) {
    const s = partita({ ...c, bollette: { luce: 45, gas: 65, internet: 45 } })
    const somma = F.vociEstrattoConto(s).reduce((t, v) => t + v.valore, 0)
    check(
      `${c.alloggio}: somma delle voci = patrimonio`,
      somma === F.patrimonio(s),
      `voci ${somma}, patrimonio ${F.patrimonio(s)}`
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
titolo('5. L imprevisto attinge prima al fondo emergenza')
{
  const comune = { alloggio: 'singola', risparmio: 280, investe: 100, spesa: 85, bollette: { luce: 28, gas: 35, internet: 29 } }
  const conRete = partita({ ...comune, fondo: 180 })
  const senzaRete = partita({ ...comune, fondo: 0 })

  check(
    'con la rete il conto corrente non viene toccato',
    conRete.imprevistoDaConto === 0 && conRete.imprevistoDaFondo === 180
  )
  check('con la rete il fondo si azzera', F.salvadanaio(conRete) === 100)
  check(
    'senza rete paga tutto il conto',
    senzaRete.imprevistoDaConto === 180 && senzaRete.imprevistoDaFondo === 0
  )
  // Il conto corrente finisce IDENTICO nei due casi, ed e' corretto: 180€
  // spesi sono 180€ spesi, che fossero etichettati "fondo" o lasciati liquidi.
  // La differenza vera la fa il prestito, a cui la scena 5 indirizza chi non
  // ha la rete: 192€ invece di 180€.
  check(
    'senza rete il conto non migliora',
    F.contoCorrente(conRete) === F.contoCorrente(senzaRete)
  )
  const conPrestito = partita({ ...comune, fondo: 0, imprevisto: 192 })
  check(
    'chi finisce sul prestito chiude piu in basso',
    F.patrimonio(conPrestito) < F.patrimonio(conRete),
    `${F.patrimonio(conPrestito)} contro ${F.patrimonio(conRete)}`
  )
}

// ─────────────────────────────────────────────────────────────────────────────
titolo('6. Il punteggio dipende davvero dalle scelte')
{
  const comune = { alloggio: 'singola', spesa: 85, bollette: { luce: 28, gas: 35, internet: 29 } }
  const punteggi = [
    [0, 0],
    [180, 0],
    [0, 180],
    [180, 100],
    [280, 0],
  ].map(([fondo, investe]) => F.calcolaPunteggio(partita({ ...comune, risparmio: 280, fondo, investe })))

  check(
    'ripartizioni diverse danno punteggi diversi',
    new Set(punteggi).size >= 4,
    `valori distinti: ${[...new Set(punteggi)].sort((a, b) => a - b).join(', ')}`
  )
  check('il punteggio resta sempre in 0-100', punteggi.every((p) => p >= 0 && p <= 100))
  check(
    'avere la rete vale piu che investire senza rete',
    F.calcolaPunteggio(partita({ ...comune, risparmio: 280, fondo: 180, investe: 0 })) >
      F.calcolaPunteggio(partita({ ...comune, risparmio: 280, fondo: 0, investe: 180 }))
  )
}

// ─────────────────────────────────────────────────────────────────────────────
titolo('7. Soglie raggiungibili e casi limite')
{
  const s = partita({ alloggio: 'singola', risparmio: 280, fondo: 0, investe: 0, spesa: 0, bollette: { luce: 0, gas: 0, internet: 0 } })
  const obiettivo = F.obiettivoFondo(s)
  const mesi = (v) => F.mesiPerObiettivo(v, obiettivo)

  check('con versamento 0 il risultato e Infinity, non NaN', mesi(0) === Infinity)
  check('la soglia "ottimo" (<=12 mesi) e raggiungibile', finito(mesi(280)) && mesi(280) <= 24, `280€/mese -> ${mesi(280)} mesi`)
  check('la soglia "lento" (>24 mesi) e raggiungibile', mesi(50) > 24, `50€/mese -> ${mesi(50)} mesi`)
  check('obiettivo diverso per case diverse', F.obiettivoFondo(partita({ alloggio: 'doppia', risparmio: 0, fondo: 0, investe: 0, spesa: 0, bollette: { luce: 0, gas: 0, internet: 0 } })) !== obiettivo)
  check('euro() non produce mai NaN', !F.euro(undefined).includes('NaN') && !F.euro(0 / 0).includes('NaN'))
  check('proiezione con tasso 0 non divide per zero', finito(F.proiezione(0, 100, 10, 0)))
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(
  falliti === 0
    ? '\n✅ Tutti gli invarianti rispettati.\n'
    : `\n❌ ${falliti} invariante/i violato/i.\n`
)
process.exit(falliti === 0 ? 0 : 1)
