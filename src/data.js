import { addDays, iso, weekStart } from './lib'

export const ME = 'p1'
const KEY = 'cantine-hermes-demo-v2'

const person = (id, name, role, dept, place, status, note, sharedGroups, extra = {}) => ({
  id, name, role, dept, place, status, note, sharedGroups,
  email: `${name.toLowerCase().replace(/ /g, '.')}@cantinehermes.example`,
  phone: `+39 06 5550 ${String(100 + Number(id.slice(1)) * 7).padStart(4, '0')}`,
  ...extra,
})

function seed() {
  const mon = weekStart(new Date())
  const ev = (d, start, end, title, cal, owner, place = '') => ({
    id: `e${d}${start}${owner}${cal}`, date: iso(addDays(mon, d)), start, end, title, cal, owner, place,
  })
  return {
    people: [
      person('p1', 'Giulia Marchetti', 'Responsabile Commerciale', 'Commerciale', 'Sede centrale', 'sede', '', ['g1','g2','g3','g5']),
      person('p2', 'Marco Bellini', 'Enologo', 'Produzione', 'Cantina', 'fuori', 'In fiera a Düsseldorf, rientra venerdì', ['g2'], { changed: true }),
      person('p3', 'Sofia Ricci', 'Direttrice', 'Direzione', 'Sede centrale', 'sede', '', ['g5']),
      person('p4', 'Luca Fontana', 'Responsabile di cantina', 'Produzione', 'Cantina', 'sede', 'In cantina', ['g2']),
      person('p5', 'Chiara Gallo', 'Responsabile amministrativa', 'Amministrazione', 'Sede centrale', 'sede', '', ['g4','g5']),
      person('p6', 'Davide Conti', 'Agente export', 'Commerciale', 'Sede centrale', 'remoto', 'Da casa fino alle 14', ['g1']),
      person('p7', 'Elena Romano', 'Accoglienza e visite', 'Accoglienza', 'Enoteca', 'sede', '', ['g3']),
      person('p8', 'Paolo Greco', 'Agronomo', 'Produzione', 'Vigneti', 'sede', 'In vigna', ['g2']),
      person('p9', 'Martina Costa', 'Marketing', 'Commerciale', 'Sede centrale', 'ferie', 'Torna lunedì prossimo', []),
      person('p10', 'Andrea Leone', 'Contabilità', 'Amministrazione', 'Sede centrale', 'sede', '', []),
      person('p11', 'Federica Moretti', 'Logistica', 'Produzione', 'Magazzino', 'remoto', '', ['g2']),
      person('p12', 'Stefano Barbieri', 'Sommelier', 'Accoglienza', 'Enoteca', 'sede', '', ['g3']),
    ],
    groups: [
      { id: 'g1', name: 'Commerciale', color: 1, members: ['p1', 'p3', 'p6', 'p9'] },
      { id: 'g2', name: 'Vendemmia', color: 0, members: ['p1', 'p2', 'p3', 'p4', 'p8', 'p11'] },
      { id: 'g3', name: 'Visite e degustazioni', color: 4, members: ['p1', 'p7', 'p9', 'p12'] },
      { id: 'g4', name: 'Amministrazione', color: 2, members: ['p3', 'p5', 'p10'] },
      { id: 'g5', name: 'Direzione', color: 3, members: ['p1', 'p3', 'p5'] },
    ],
    events: [
      ev(0, '15:00', '16:00', 'Chiamata fornitore bottiglie', 'personal', 'p1'),
      ev(1, '09:00', '18:00', 'Fiera Düsseldorf', 'personal', 'p2', 'Düsseldorf'),
      ev(2, '10:00', '11:00', 'Pranzo con cliente', 'personal', 'p1', 'Ristorante Il Tralcio'),
      ev(0, '09:00', '10:00', 'Riunione commerciale', 'personal', 'p6'),
      ev(1, '10:00', '11:30', 'Degustazione per distributori', 'personal', 'p7', 'Enoteca'),
      ev(2, '16:00', '17:30', 'Visita guidata – 12 persone', 'personal', 'p12', 'Cantina'),
      ev(3, '09:00', '12:00', 'Vendemmia – blocco Nord', 'personal', 'p8', 'Vigneti'),
      ev(4, '09:00', '11:00', 'Assaggio vasche rosso 2026', 'personal', 'p4', 'Cantina'),
      ev(0, '11:00', '12:30', 'Controllo uve in arrivo', 'personal', 'p4', 'Cantina'),
      ev(3, '14:00', '15:00', 'Chiusura contabile mese', 'personal', 'p5'),
      ev(2, '09:00', '18:00', 'Fiera Düsseldorf', 'personal', 'p2', 'Düsseldorf'),
      ev(3, '15:30', '16:30', 'Colloquio nuova risorsa', 'personal', 'p1'),
      ev(4, '11:30', '12:30', 'Piano ferie estate', 'personal', 'p1'),
    ],
    notes: [
      { id: 'n1', title: 'Idee per il listino 2027', body: 'Valutare un formato 0,375 l per il rosso di punta.\nChiedere a Marco il costo bottiglie.\nRiallineare i prezzi export con Davide.', pinned: true, updated: Date.now() - 3600e3 },
      { id: 'n2', title: 'Riunione con distributori', body: 'Richiesta principale: più disponibilità del bianco.\nDa mandare: schede tecniche aggiornate.', pinned: false, updated: Date.now() - 26 * 3600e3 },
      { id: 'n3', title: 'Da ricordare', body: 'Rinnovo certificazione biologica a novembre.', pinned: false, updated: Date.now() - 4 * 86400e3 },
    ],
  }
}

export function loadDb() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* storage non disponibile: si riparte dai dati demo */ }
  return seed()
}

export function saveDb(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* ignora */ }
}

export function resetDb() {
  try { localStorage.removeItem(KEY) } catch { /* ignora */ }
}
