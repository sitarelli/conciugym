import { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════
// STORAGE — localStorage + IndexedDB fallback per iPhone
// ═══════════════════════════════════════════════════════

const DB_NAME = 'ConsueloWorkout',
  DB_STORE = 'history',
  DB_VER = 1;
let dbInstance = null;

function openDB() {
  return new Promise((res, rej) => {
    if (dbInstance) return res(dbInstance);
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) =>
      e.target.result.createObjectStore(DB_STORE, { keyPath: 'id' });
    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      res(dbInstance);
    };
    req.onerror = () => rej(req.error);
  });
}

async function dbGetAll() {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  } catch {
    return lsGet();
  }
}

async function dbSave(item) {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(item);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    lsAdd(item);
  }
}

async function dbDelete(id) {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(id);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    lsDel(id);
  }
}

function lsGet() {
  try {
    return JSON.parse(localStorage.getItem('cw_history') || '[]');
  } catch {
    return [];
  }
}
function lsAdd(w) {
  try {
    const h = lsGet();
    h.push(w);
    localStorage.setItem('cw_history', JSON.stringify(h));
  } catch {}
}
function lsDel(id) {
  try {
    const h = lsGet().filter((w) => w.id !== id);
    localStorage.setItem('cw_history', JSON.stringify(h));
  } catch {}
}

// ═══════════════════════════════════════════════════════
// DATA — Scheda Consuelo
// ═══════════════════════════════════════════════════════

const sessions = [
  {
    id: 1,
    label: 'Lunedì',
    subtitle: 'Upper Body · Schiena · Braccia · Spalle · Core',
    color: '#6C63FF',
    glow: 'rgba(108,99,255,0.45)',
    icon: '💪',
    type: 'workout',
    groups: [
      {
        name: 'Dorsali',
        icon: '🔙',
        exercises: [
          {
            name: 'Lat Machine presa larga',
            sets: 3,
            reps: '12',
            rest: 60,
            description:
              'Siediti, regola i cuscinetti sulle cosce. Afferra la barra larga (più larga delle spalle), palmi verso il basso. Schiena leggermente arcuata, petto in fuori. Tira verso il petto (non al collo!), immagina di schiacciare un arancio sotto le ascelle. Ritorna lentamente in 3-4 sec. Peso: 10-12 kg.',
          },
          {
            name: 'Rematore con manubrio (su panca)',
            sets: 3,
            reps: '12 per lato',
            rest: 60,
            description:
              'Ginocchio e mano sinistri sulla panca. Corpo parallelo al pavimento, schiena piatta. Manubrio con la mano destra, braccio disteso (allungamento). Porta il gomito verso il soffitto, spremi la scapola a fine movimento. Ridiscendi in 3 sec. 4→6 kg.',
          },
          {
            name: 'Face Pull con elastico',
            sets: 3,
            reps: '15',
            rest: 45,
            description:
              "Fissa l'elastico ad altezza testa. Tieni un'estremità per mano, palmi verso il basso. Un passo indietro, elastico in tensione. Porta i pugni verso le orecchie, gomiti alti e larghi (forma una W). Tieni 1 sec, ritorna lentamente. Fondamentale per postura e spalle posteriori.",
          },
        ],
      },
      {
        name: 'Lombari',
        icon: '🦴',
        exercises: [
          {
            name: 'Estensioni lombari (hyperextension)',
            sets: 3,
            reps: '15',
            rest: 60,
            description:
              'Sulla panca iperestensioni (o da terra a pancia in giù). Fianchi sul supporto, piedi bloccati. Parti con busto abbassato (allungamento). Contrai glutei e lombari, solleva il busto fino in linea con le gambe. NON iperestendere. Tieni 1-2 sec, scendi lentamente. Testa sempre in posizione neutra.',
          },
          {
            name: 'Good Morning con bilancino',
            sets: 3,
            reps: '12',
            rest: 60,
            description:
              'In piedi, bilancino leggero sulle spalle (5-8 kg). Ginocchia leggermente piegate, schiena dritta. Spingi i fianchi indietro inclinando il busto in avanti, senti i femorali allungarsi. Risali contraendo i glutei e i lombari. Mai curvar la schiena.',
          },
          {
            name: 'Superman (da terra)',
            sets: 3,
            reps: '12',
            rest: 45,
            isTime: false,
            description:
              'Sdraiata a pancia in giù, braccia distese sopra la testa. Contrai glutei e lombari, solleva contemporaneamente braccia e gambe (o alternato destra+sinistra). Altezza massima 10-15 cm. Tieni 2 sec, torna giù lentamente. Rinforza tutta la catena posteriore.',
            duration: 2,
          },
        ],
      },
      {
        name: 'Bicipiti & Tricipiti',
        icon: '💪',
        exercises: [
          {
            name: 'Curl manubri alternato',
            sets: 3,
            reps: '12 per braccio',
            rest: 45,
            description:
              "In piedi, schiena dritta, addome contratto. Manubri con palme verso l'alto. Porta un manubrio verso la spalla tenendo il GOMITO FERMO al fianco. Ruota il polso verso l'esterno in cima. Abbassa in 3 sec. NON oscillare il busto. 4 kg.",
          },
          {
            name: 'Curl a martello (Hammer Curl)',
            sets: 3,
            reps: '12',
            rest: 45,
            description:
              "Presa neutra (pollice in alto). Stessa esecuzione del curl alternato. Lavora anche l'avambraccio e il brachioradiale. Gomito sempre fermo, movimento controllato. 4 kg.",
          },
          {
            name: 'French Press (tricipite) con manubrio',
            sets: 3,
            reps: '12',
            rest: 45,
            description:
              'Seduta con schienale, schiena dritta. Manubrio con entrambe le mani sopra la testa, braccia distese. Abbassa il manubrio DIETRO la testa piegando i gomiti, che restano puntati al soffitto. Risali espirando. Inizia con 3 kg.',
          },
          {
            name: 'Tricipite con elastico (pushdown)',
            sets: 3,
            reps: '15',
            rest: 45,
            description:
              'In piedi davanti al cavo/elastico alto. Gomiti INCOLLATI ai fianchi, non si muovono. Estendi le braccia verso il basso, poi torna su lentamente. Piegati leggermente in avanti per isolare meglio il tricipite.',
          },
        ],
      },
      {
        name: 'Spalle',
        icon: '🏋️',
        exercises: [
          {
            name: 'Lento avanti con manubri (Military Press)',
            sets: 3,
            reps: '12',
            rest: 60,
            description:
              "Seduta, schiena appoggiata allo schienale. Manubri all'altezza delle orecchie, gomiti a 90°, palmi avanti. Spingi verso l'alto quasi fino a distendere le braccia (no blocco gomiti). Riabbassa lentamente in 3 sec. Schiena incollata allo schienale! 4 kg.",
          },
          {
            name: 'Alzate laterali con manubri',
            sets: 3,
            reps: '12',
            rest: 45,
            description:
              "In piedi, gambe alla larghezza delle spalle. Manubri lungo i fianchi, braccia leggermente piegate. Solleva le braccia ai lati come un uccello che apre le ali, fermati all'altezza delle spalle. Pollici leggermente verso il basso. Abbassa in 3-4 sec. Pesi leggeri: 2-3 kg!",
          },
          {
            name: 'Alzate frontali alternate',
            sets: 3,
            reps: '10 per braccio',
            rest: 45,
            description:
              'In piedi, core contratto. Porta un braccio alla volta in avanti a 90°. Tieni 1 sec in cima. Abbassa lentamente. Non dondolare il busto. 2-3 kg.',
          },
        ],
      },
      {
        name: 'Core',
        icon: '🔥',
        exercises: [
          {
            name: 'Plank frontale',
            sets: 3,
            reps: '20-30 sec',
            rest: 45,
            isTime: true,
            duration: 25,
            description:
              'Sui gomiti e punte dei piedi. Corpo dritto dalla testa ai talloni. Addome contratto come se stessi per prendere un pugno. Glutei contratti, fianchi né in alto né in basso. Respira normalmente. Aumenta di 5 sec ogni settimana.',
          },
          {
            name: 'Crunch con rotazione (obliqui)',
            sets: 3,
            reps: '15 per lato',
            rest: 45,
            description:
              'Sdraiata, ginocchia piegate. Mani dietro la testa. Porta il gomito destro verso il ginocchio sinistro ruotando il busto. Solo le spalle si staccano dal suolo, non il collo. Alterna i lati.',
          },
          {
            name: 'Hollow Body Hold',
            sets: 3,
            reps: '15-20 sec',
            rest: 45,
            isTime: true,
            duration: 17,
            description:
              'Schiena SCHIACCIATA al pavimento (zona lombare incollata). Gambe e braccia distese, solleva leggermente gambe e spalle. Core completamente incavato. Tieni la posizione respirando normalmente.',
          },
          {
            name: 'Dead Bug',
            sets: 3,
            reps: '10 per lato',
            rest: 45,
            description:
              "Sdraiata, schiena completamente piatta al suolo. Braccia verso il soffitto, gambe a 90° (tabletop). Abbassa braccio destro + gamba sinistra lentamente espirando. La schiena non si stacca mai dal pavimento. Ritorna al centro, poi l'altro lato. Uno degli esercizi più efficaci per i muscoli profondi!",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    label: 'Mercoledì',
    subtitle: 'Lower Body · Glutei · Gambe · Addominali',
    color: '#FF6B6B',
    glow: 'rgba(255,107,107,0.45)',
    icon: '🦵',
    type: 'workout',
    groups: [
      {
        name: 'Glutei',
        icon: '🍑',
        exercises: [
          {
            name: 'Hip Thrust con manubrio',
            sets: 4,
            reps: '12',
            rest: 90,
            description:
              "Schiena appoggiata al bordo della panca (altezza ginocchio). Piedi piatti, larghezza spalle, punte aperte. Manubrio sul bacino (con asciugamano). Spingi i fianchi verso l'alto contraendo FORTEMENTE i glutei. In cima: corpo dritto dalla spalla al ginocchio, TIENI 2 secondi. Abbassa in 3 sec senza toccare terra. Spingi con i TALLONI! Inizia: 4→6→8 kg.",
          },
          {
            name: 'Stacco Rumeno con manubri',
            sets: 3,
            reps: '12',
            rest: 90,
            description:
              'In piedi, manubri davanti alle cosce. Ginocchia leggermente piegate. Spingi i fianchi INDIETRO lasciando scendere i manubri lungo le gambe. Senti femorali e glutei allungarsi (allungamento). Abbassa fino a metà stinco. Contrai i glutei per risalire spingendo i fianchi avanti. Schiena SEMPRE dritta. 6-8 kg per mano.',
          },
          {
            name: 'Bulgarian Split Squat',
            sets: 3,
            reps: '10 per gamba',
            rest: 90,
            description:
              'Piede posteriore su sedia/panca. Piede anteriore un passo avanti. Manubri ai fianchi, schiena dritta. Scendi lentamente verso terra, il ginocchio anteriore non supera la punta del piede. Senti il gluteo anteriore allungarsi intensamente. Risali spingendo con il tallone anteriore. Inizia senza pesi! 4 kg per mano.',
          },
          {
            name: 'Donkey Kick con elastico',
            sets: 3,
            reps: '15 per gamba',
            rest: 60,
            description:
              "A quattro zampe, elastico sopra il ginocchio. Porta il piede verso il soffitto contraendo il gluteo in cima. Movimento lento e controllato, non usare l'inerzia. Tieni 1 sec in cima. Elastico medio.",
          },
          {
            name: 'Abductor lateral walk con elastico',
            sets: 3,
            reps: '20 passi',
            rest: 45,
            description:
              "Elastico sopra le ginocchia. Posizione semi-squat. Cammina lateralmente mantenendo la tensione sull'elastico. 10 passi a destra, 10 a sinistra. Tensione costante: non lasciare mai che l'elastico si allenti. Elastico leggero.",
          },
        ],
      },
      {
        name: 'Quadricipiti & Femorali',
        icon: '🦵',
        exercises: [
          {
            name: 'Goblet Squat con manubrio',
            sets: 3,
            reps: '15',
            rest: 75,
            description:
              "Piedi alla larghezza delle spalle o più larghi, punte aperte 30-45°. Manubrio verticale davanti al petto con entrambe le mani. Scendi come su una sedia molto bassa. Ginocchia nella direzione delle punte (NON verso l'interno!). Calcagni sempre a terra. Cosce parallele al pavimento. Risali con i talloni. Ottimo per la densità ossea! 6-8 kg.",
          },
          {
            name: 'Affondi camminati con manubri',
            sets: 3,
            reps: '10 per gamba',
            rest: 75,
            description:
              'Manubri ai lati. Passo avanti lungo, scendi col ginocchio posteriore verso terra. Il ginocchio anteriore non supera la punta del piede. Spingiti in avanti col piede anteriore. Busto eretto, core contratto. 4 kg per mano.',
          },
          {
            name: 'Leg curl con elastico (da sdraiata)',
            sets: 3,
            reps: '15 per gamba',
            rest: 60,
            description:
              'Sdraiata a pancia in giù, elastico attorno alla caviglia fissato a un punto fisso. Piega il ginocchio portando il tallone verso il gluteo. Lenta risalita, non usare lo slancio. Elastico medio.',
          },
        ],
      },
      {
        name: 'Addominali',
        icon: '🔥',
        exercises: [
          {
            name: 'Leg Raise (sollevamento gambe)',
            sets: 3,
            reps: '12',
            rest: 45,
            description:
              'Sdraiata a pancia in su, schiena piatta, mani sotto i glutei. Gambe tese, solleva fino a 90°, poi abbassa lentamente senza toccare terra. Zona lombare incollata al suolo. Espira salendo, inspira scendendo.',
          },
          {
            name: 'Russian Twist con manubrio',
            sets: 3,
            reps: '12 per lato',
            rest: 45,
            description:
              'Seduta, ginocchia piegate, piedi sollevati (o a terra se troppo difficile). Busto a 45°. Manubrio davanti al petto. Ruota verso destra portando il manubrio vicino al fianco, poi a sinistra. Gli occhi seguono il manubrio. Respira regolarmente. 2-3 kg.',
          },
          {
            name: 'Plank laterale',
            sets: 3,
            reps: '20 sec per lato',
            rest: 45,
            isTime: true,
            duration: 20,
            description:
              'Su un avambraccio e il lato del piede. Corpo dritto di lato, anca alta (non far cedere i fianchi). Core contratto. Respira normalmente. 20 sec per lato.',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    label: 'Venerdì',
    subtitle: 'Full Body · Equilibrato',
    color: '#00D4AA',
    glow: 'rgba(0,212,170,0.45)',
    icon: '🌟',
    type: 'workout',
    groups: [
      {
        name: 'Upper Body',
        icon: '💪',
        exercises: [
          {
            name: 'Push Up modificato (sulle ginocchia)',
            sets: 3,
            reps: '10-12',
            rest: 60,
            description:
              'A quattro zampe, ginocchia a terra. Mani più larghe delle spalle, dita in avanti. Corpo dritto dalle ginocchia alle spalle. Abbassa il petto verso terra, gomiti a 45°. Risali espirando. Progressione: quando fai 15 rep perfette, sposta le ginocchia più indietro.',
          },
          {
            name: 'Rematore con elastico (seduta)',
            sets: 3,
            reps: '15',
            rest: 60,
            description:
              "Seduta, piedi contro il muro o fermi. Elastico attorno ai piedi. Tira verso l'ombelico, gomiti indietro. Spremi le scapole verso la spina dorsale. Rilascia lentamente mantenendo la tensione.",
          },
          {
            name: 'Lento avanti con manubri',
            sets: 3,
            reps: '12',
            rest: 60,
            description:
              "Come da Lunedì. Seduta, schienale. Manubri alle orecchie, spingi verso l'alto. 4 kg.",
          },
          {
            name: 'Curl manubri (simultaneo)',
            sets: 2,
            reps: '12',
            rest: 45,
            description:
              'Entrambe le braccia insieme questa volta. Stessa tecnica del curl alternato: gomiti fissi, niente dondolii. 4 kg.',
          },
        ],
      },
      {
        name: 'Lower Body',
        icon: '🦵',
        exercises: [
          {
            name: 'Hip Thrust a corpo libero (veloce)',
            sets: 3,
            reps: '20',
            rest: 60,
            description:
              'Come il Hip Thrust ma senza peso. Velocità media, SPREMI i glutei in cima ad ogni rep. Focus sulla contrazione massima. Non far toccare mai i glutei al suolo tra le ripetizioni.',
          },
          {
            name: 'Squat sumo con manubrio',
            sets: 3,
            reps: '15',
            rest: 75,
            description:
              'Piedi molto larghi, punte aperte. Un manubrio tenuto verticale con entrambe le mani davanti al corpo. Scendi tra le gambe. Lavora il gluteo medio. 8 kg.',
          },
          {
            name: 'Affondi statici (in loco)',
            sets: 3,
            reps: '12 per gamba',
            rest: 60,
            description:
              'Stessa gamba: scendi e risali sullo stesso piede. Ginocchio posteriore quasi a terra. Non oscillare il busto. 4 kg per mano.',
          },
          {
            name: 'Ponte glutei con pausa',
            sets: 3,
            reps: '15',
            rest: 45,
            description:
              'Sdraiata, ginocchia piegate, piedi piatti. Spingi i fianchi verso il soffitto. TIENI 3 secondi in cima. Abbassa senza toccare terra con i glutei. Spingi sempre con i TALLONI per isolare i glutei.',
          },
        ],
      },
      {
        name: 'Core Finale',
        icon: '🔥',
        exercises: [
          {
            name: 'Plank frontale',
            sets: 3,
            reps: '30 sec',
            rest: 30,
            isTime: true,
            duration: 30,
            description:
              'Tieni duro! Corpo dritto, core e glutei contratti. Respira.',
          },
          {
            name: 'Mountain Climber lento',
            sets: 3,
            reps: '10 per gamba',
            rest: 30,
            description:
              'Posizione plank su mani tese. Porta il ginocchio destro verso il petto lentamente (2 sec), ritorna (2 sec), poi il sinistro. Schiena piatta, no al sedere alto. Combina core, spalle e coordinazione.',
          },
          {
            name: 'Crunch classico',
            sets: 3,
            reps: '15',
            rest: 30,
            description:
              'Sdraiata, ginocchia piegate. Mani dietro la testa senza tirare il collo. Solleva SOLO le spalle dal suolo. Espira salendo, inspira scendendo. Movimento breve e controllato.',
          },
        ],
      },
    ],
  },
  {
    id: 4,
    label: 'Sabato',
    subtitle: 'Riposo Attivo · Movimento Dolce',
    color: '#FFA500',
    glow: 'rgba(255,165,0,0.45)',
    icon: '🌿',
    type: 'extra',
    activities: [
      {
        name: 'Camminata',
        icon: '🚶',
        description:
          "Camminata a passo sostenuto all'aperto. Avvia il timer e goditi il movimento. Obiettivo: 20-30 minuti.",
      },
      {
        name: 'Stretching',
        icon: '🧘',
        description:
          'Sessione di stretching completa. Tieni ogni posizione 30-40 sec: gluteo piramidale, femorali, cat-cow, spalle, psoas. Poi respirazione diaframmatica.',
      },
      {
        name: 'Yoga dolce',
        icon: '🌸',
        description:
          'Sequenza di yoga dolce. Avvia il timer e segui il tuo ritmo. Anche 20 minuti fanno la differenza!',
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════

function useTimer(sec) {
  const [time, setTime] = useState(sec);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (running && time > 0)
      ref.current = setInterval(() => setTime((t) => t - 1), 1000);
    else if (time === 0) setRunning(false);
    return () => clearInterval(ref.current);
  }, [running, time]);
  return {
    time,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => {
      setRunning(false);
      setTime(sec);
    },
  };
}

function fmt(s) {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = s % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════

function RestTimerModal({ seconds, onClose }) {
  const { time, running, start, pause, reset } = useTimer(seconds);
  useEffect(() => {
    start();
  }, []);
  const pct = (time / seconds) * 100,
    C = 2 * Math.PI * 54;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalCard} onClick={(e) => e.stopPropagation()}>
        <p style={S.modalTitle}>⏱ Recupero</p>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle
            cx="65"
            cy="65"
            r="54"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="65"
            cy="65"
            r="54"
            fill="none"
            stroke={time <= 10 ? '#FF6B6B' : '#6C63FF'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct / 100)}
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dashoffset 0.9s linear,stroke 0.3s' }}
          />
          <text
            x="65"
            y="70"
            textAnchor="middle"
            fill="white"
            fontSize="26"
            fontWeight="700"
            fontFamily="monospace"
          >
            {fmt(time)}
          </text>
        </svg>
        <div style={S.row}>
          {running ? (
            <button
              style={{ ...S.btn, background: 'rgba(255,255,255,0.15)' }}
              onClick={pause}
            >
              ⏸ Pausa
            </button>
          ) : (
            <button
              style={{ ...S.btn, background: 'rgba(108,99,255,0.6)' }}
              onClick={start}
            >
              ▶ Riprendi
            </button>
          )}
          <button
            style={{ ...S.btn, background: 'rgba(255,107,107,0.4)' }}
            onClick={reset}
          >
            ↺
          </button>
          <button
            style={{ ...S.btn, background: 'rgba(255,255,255,0.08)' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {time === 0 && (
          <p style={{ color: '#00D4AA', fontWeight: '700', marginTop: '10px' }}>
            ✅ Recupero completato!
          </p>
        )}
      </div>
    </div>
  );
}

function ExTimer({ duration }) {
  const { time, running, start, pause, reset } = useTimer(duration);
  const pct = (time / duration) * 100,
    col = time <= 10 ? '#FF6B6B' : '#00D4AA';
  return (
    <div style={S.exTimer}>
      <div style={{ ...S.timerBar, width: `${pct}%`, background: col }} />
      <span style={S.timerTxt}>{fmt(time)}</span>
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginLeft: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {running ? (
          <button style={S.sm} onClick={pause}>
            ⏸
          </button>
        ) : (
          <button
            style={{ ...S.sm, background: 'rgba(0,212,170,0.4)' }}
            onClick={start}
          >
            ▶
          </button>
        )}
        <button
          style={{ ...S.sm, background: 'rgba(255,107,107,0.3)' }}
          onClick={reset}
        >
          ↺
        </button>
      </div>
    </div>
  );
}

function ExCard({ ex, color, done, onSet }) {
  const [open, setOpen] = useState(false);
  const [showRest, setShowRest] = useState(false);
  return (
    <>
      {showRest && (
        <RestTimerModal
          seconds={ex.rest || 90}
          onClose={() => setShowRest(false)}
        />
      )}
      <div style={{ ...S.card, borderColor: `${color}44` }}>
        <div style={S.cardHead}>
          <div style={{ flex: 1 }}>
            <p style={S.exName}>{ex.name}</p>
            <p style={S.exMeta}>
              {ex.sets} serie · {ex.reps}
              {ex.rest > 0 ? ` · rec.${ex.rest}s` : ''}
            </p>
          </div>
          <button
            style={{ ...S.infoBtn, borderColor: `${color}66`, color }}
            onClick={() => setOpen(!open)}
          >
            {open ? '✕' : 'ℹ'}
          </button>
        </div>
        {open && (
          <div style={{ ...S.desc, borderColor: `${color}33` }}>
            <p style={S.descTxt}>{ex.description}</p>
          </div>
        )}
        {ex.isTime && ex.duration && <ExTimer duration={ex.duration} />}
        <div style={S.sets}>
          {Array.from({ length: ex.sets }).map((_, i) => (
            <button
              key={i}
              style={{
                ...S.dot,
                background: done > i ? color : 'rgba(255,255,255,0.08)',
                borderColor: done > i ? color : 'rgba(255,255,255,0.2)',
                boxShadow: done > i ? `0 0 10px ${color}88` : 'none',
              }}
              onClick={() => onSet(i)}
            >
              {done > i ? '✓' : i + 1}
            </button>
          ))}
          {ex.rest > 0 && (
            <button
              style={{ ...S.restBtn, borderColor: `${color}55`, color }}
              onClick={() => setShowRest(true)}
            >
              ⏱ Recupero
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function Group({ group, color, completedSets, onSetComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '2px',
        }}
      >
        <span style={{ fontSize: '20px' }}>{group.icon}</span>
        <span style={{ fontSize: '16px', fontWeight: '700', color }}>
          {group.name}
        </span>
      </div>
      {group.exercises.map((ex, i) => (
        <ExCard
          key={ex.name}
          ex={ex}
          color={color}
          done={completedSets[i]}
          onSet={(si) => onSetComplete(i, si)}
        />
      ))}
    </div>
  );
}

function WorkoutSession({ session, onFinish }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState(() =>
    session.groups.map((g) => g.exercises.map(() => 0))
  );
  const ref = useRef(null);
  useEffect(() => {
    if (running)
      ref.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const handleSetComplete = (gIdx, eIdx, setIdx) => {
    setCompletedSets((prev) => {
      const next = prev.map((g) => [...g]);
      next[gIdx][eIdx] = next[gIdx][eIdx] >= setIdx + 1 ? setIdx : setIdx + 1;
      return next;
    });
  };

  const handleFinish = async () => {
    const exercises = [];
    session.groups.forEach((g, gIdx) =>
      g.exercises.forEach((ex, eIdx) => {
        exercises.push({
          name: ex.name,
          setsCompleted: completedSets[gIdx][eIdx],
          setsTotal: ex.sets,
          reps: ex.reps,
        });
      })
    );
    const w = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      sessionId: session.id,
      sessionName: session.label,
      duration: elapsed,
      completed: true,
      exercises,
      totalSets: exercises.reduce((s, e) => s + e.setsTotal, 0),
      completedSets: exercises.reduce((s, e) => s + e.setsCompleted, 0),
    };
    await dbSave(w);
    lsAdd(w); // double save
    onFinish();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          ...S.watch,
          borderColor: `${session.color}44`,
          boxShadow: `0 0 30px ${session.glow}`,
        }}
      >
        <div>
          <p style={S.wLabel}>Durata sessione</p>
          <p style={{ ...S.wTime, color: session.color }}>{fmt(elapsed)}</p>
        </div>
        <div style={S.row}>
          {running ? (
            <button
              style={{ ...S.btn, background: 'rgba(255,255,255,0.1)' }}
              onClick={() => setRunning(false)}
            >
              ⏸ Pausa
            </button>
          ) : (
            <button
              style={{ ...S.btn, background: `${session.color}99` }}
              onClick={() => setRunning(true)}
            >
              ▶ {elapsed === 0 ? 'Inizia' : 'Riprendi'}
            </button>
          )}
          <button
            style={{ ...S.btn, background: 'rgba(255,107,107,0.3)' }}
            onClick={() => {
              setRunning(false);
              setElapsed(0);
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>
      {session.groups.map((g, gIdx) => (
        <Group
          key={g.name}
          group={g}
          color={session.color}
          completedSets={completedSets[gIdx]}
          onSetComplete={(eIdx, setIdx) =>
            handleSetComplete(gIdx, eIdx, setIdx)
          }
        />
      ))}
      <button
        style={{ ...S.finishBtn, background: `${session.color}99` }}
        onClick={handleFinish}
      >
        ✅ Completa Sessione
      </button>
    </div>
  );
}

function ExtraSession({ session, onFinish }) {
  const [active, setActive] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (running)
      ref.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const handleFinish = async () => {
    const w = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      sessionId: session.id,
      sessionName: `${session.label} · ${active.name}`,
      activityType: active.name,
      duration: elapsed,
      completed: true,
      exercises: [],
      totalSets: 0,
      completedSets: 0,
    };
    await dbSave(w);
    lsAdd(w);
    setActive(null);
    setElapsed(0);
    setRunning(false);
    onFinish();
  };

  if (active)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ ...S.card, borderColor: `${session.color}44` }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '36px' }}>{active.icon}</span>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '700',
                  color: session.color,
                }}
              >
                {active.name}
              </h3>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.55)',
                }}
              >
                {active.description}
              </p>
            </div>
          </div>
          <div
            style={{
              ...S.watch,
              borderColor: `${session.color}44`,
              marginTop: '16px',
            }}
          >
            <div>
              <p style={S.wLabel}>Durata</p>
              <p style={{ ...S.wTime, color: session.color }}>{fmt(elapsed)}</p>
            </div>
            <div style={S.row}>
              {running ? (
                <button
                  style={{ ...S.btn, background: 'rgba(255,255,255,0.1)' }}
                  onClick={() => setRunning(false)}
                >
                  ⏸ Pausa
                </button>
              ) : (
                <button
                  style={{ ...S.btn, background: `${session.color}99` }}
                  onClick={() => setRunning(true)}
                >
                  ▶ Riprendi
                </button>
              )}
              <button
                style={{ ...S.btn, background: 'rgba(255,107,107,0.3)' }}
                onClick={() => {
                  setRunning(false);
                  setElapsed(0);
                }}
              >
                ↺
              </button>
            </div>
          </div>
        </div>
        <button
          style={{ ...S.finishBtn, background: `${session.color}99` }}
          onClick={handleFinish}
        >
          ✅ Completa
        </button>
        <button
          style={{
            ...S.btn,
            background: 'rgba(255,255,255,0.08)',
            width: '100%',
            padding: '12px',
          }}
          onClick={() => {
            setActive(null);
            setElapsed(0);
            setRunning(false);
          }}
        >
          ← Torna
        </button>
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p
        style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.65)',
          margin: '0 0 8px',
        }}
      >
        Seleziona attività:
      </p>
      {session.activities.map((a) => (
        <div
          key={a.name}
          style={{
            ...S.card,
            borderColor: `${session.color}44`,
            cursor: 'pointer',
          }}
          onClick={() => {
            setActive(a);
            setElapsed(0);
            setRunning(true);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '42px' }}>{a.icon}</span>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#fff',
                }}
              >
                {a.name}
              </h3>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: '1.5',
                }}
              >
                {a.description}
              </p>
            </div>
            <span style={{ fontSize: '24px', color: session.color }}>▶</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard({ onBack }) {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    dbGetAll().then((h) =>
      setHistory(h.sort((a, b) => new Date(b.date) - new Date(a.date)))
    );
  }, []);

  const filterDays = { '7d': 7, '30d': 30, '90d': 90, year: 365 };
  const cutoff =
    filter === 'all'
      ? null
      : new Date(Date.now() - filterDays[filter] * 86400000);
  const filtered = cutoff
    ? history.filter((w) => new Date(w.date) >= cutoff)
    : history;
  const total = filtered.length;
  const totalSets = filtered.reduce((s, w) => s + (w.completedSets || 0), 0);
  const avgDur =
    total > 0
      ? Math.round(filtered.reduce((s, w) => s + w.duration, 0) / total)
      : 0;

  const sorted = [...history]
    .map((w) => new Date(w.date).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  const now = new Date();
  for (const d of sorted) {
    const diff = Math.floor((now - new Date(d)) / 86400000);
    if (diff === streak) streak++;
    else break;
  }

  const sessionCounts = filtered.reduce((acc, w) => {
    const k = w.sessionId || 'other';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const exFreq = {};
  filtered.forEach((w) =>
    (w.exercises || []).forEach((ex) => {
      exFreq[ex.name] = (exFreq[ex.name] || 0) + ex.setsCompleted;
    })
  );
  const topEx = Object.entries(exFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo allenamento?')) return;
    await dbDelete(id);
    lsDel(id);
    setHistory((h) => h.filter((w) => w.id !== id));
  };

  const exportData = () => {
    const json = JSON.stringify(history, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consuelo_workout_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        for (const w of data) {
          await dbSave(w);
          lsAdd(w);
        }
        dbGetAll().then((h) =>
          setHistory(h.sort((a, b) => new Date(b.date) - new Date(a.date)))
        );
        alert('✅ Dati importati!');
      } catch {
        alert('❌ File non valido');
      }
    };
    reader.readAsText(file);
  };

  const cards = [
    { label: 'Streak 🔥', value: `${streak}g`, color: '#FF6B6B' },
    { label: 'Sessioni', value: total, color: '#6C63FF' },
    { label: 'Serie Tot.', value: totalSets, color: '#00D4AA' },
    { label: 'Durata Media', value: fmt(avgDur), color: '#FFA500' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingBottom: '40px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: '800',
            color: '#fff',
          }}
        >
          📊 Dashboard
        </h2>
        <button
          style={{ ...S.btn, background: 'rgba(255,255,255,0.08)' }}
          onClick={onBack}
        >
          ← Indietro
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all', '7d', '30d', '90d', 'year'].map((f) => (
          <button
            key={f}
            style={{
              ...S.btn,
              background:
                filter === f
                  ? 'rgba(108,99,255,0.6)'
                  : 'rgba(255,255,255,0.08)',
              border: filter === f ? '1px solid #6C63FF' : 'none',
            }}
            onClick={() => setFilter(f)}
          >
            {f === 'all'
              ? 'Tutto'
              : f === '7d'
              ? '7g'
              : f === '30d'
              ? '30g'
              : f === '90d'
              ? '90g'
              : 'Anno'}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))',
          gap: '10px',
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{ ...S.card, borderColor: `${c.color}44`, padding: '14px' }}
          >
            <p
              style={{
                margin: '0 0 4px',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {c.label}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '800',
                color: c.color,
              }}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {Object.keys(sessionCounts).length > 0 && (
        <div style={{ ...S.card, borderColor: 'rgba(255,255,255,0.12)' }}>
          <h3
            style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '700' }}
          >
            Distribuzione Sessioni
          </h3>
          {Object.entries(sessionCounts).map(([id, count]) => {
            const s = sessions.find((s) => s.id === parseInt(id));
            const color = s ? s.color : '#999',
              label = s ? s.label : 'Altro';
            const pct = ((count / total) * 100).toFixed(0);
            return (
              <div key={id} style={{ marginBottom: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '600', color }}>
                    {label}
                  </span>
                  <span
                    style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}
                  >
                    {count}× ({pct}%)
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {topEx.length > 0 && (
        <div style={{ ...S.card, borderColor: 'rgba(255,255,255,0.12)' }}>
          <h3
            style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '700' }}
          >
            Top 5 Esercizi
          </h3>
          {topEx.map(([name, sets], i) => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.3)',
                  minWidth: '22px',
                }}
              >
                #{i + 1}
              </span>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#fff',
                  }}
                >
                  {name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {sets} serie
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Backup */}
      <div style={{ ...S.card, borderColor: 'rgba(255,165,0,0.3)' }}>
        <h3
          style={{
            margin: '0 0 12px',
            fontSize: '14px',
            fontWeight: '700',
            color: '#FFA500',
          }}
        >
          💾 Backup Dati
        </h3>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          Su iPhone i dati possono essere persi se Safari cancella i dati del
          sito. Esporta regolarmente!
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            style={{
              ...S.btn,
              background: 'rgba(255,165,0,0.3)',
              border: '1px solid #FFA500',
              color: '#FFA500',
            }}
            onClick={exportData}
          >
            📤 Esporta JSON
          </button>
          <label
            style={{
              ...S.btn,
              background: 'rgba(0,212,170,0.2)',
              border: '1px solid #00D4AA',
              color: '#00D4AA',
              cursor: 'pointer',
            }}
          >
            📥 Importa
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <button
        style={{
          ...S.btn,
          background: 'rgba(108,99,255,0.3)',
          width: '100%',
          padding: '12px',
        }}
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? 'Nascondi Storico ▲' : 'Mostra Storico ▼'}
      </button>

      {showHistory && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.length === 0 && (
            <p
              style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.45)',
                padding: '20px',
              }}
            >
              Nessun allenamento registrato
            </p>
          )}
          {history.map((w) => {
            const s = sessions.find((s) => s.id === w.sessionId);
            const color = s ? s.color : '#999';
            const d = new Date(w.date);
            return (
              <div
                key={w.id}
                style={{
                  ...S.card,
                  borderColor: `${color}33`,
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: '0 0 2px',
                        fontSize: '14px',
                        fontWeight: '700',
                        color,
                      }}
                    >
                      {w.sessionName}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.45)',
                      }}
                    >
                      {d.toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {d.toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    style={{
                      ...S.sm,
                      background: 'rgba(255,107,107,0.3)',
                      width: '28px',
                      height: '28px',
                      fontSize: '12px',
                    }}
                    onClick={() => handleDelete(w.id)}
                  >
                    🗑
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  <span>⏱ {fmt(w.duration)}</span>
                  {w.completedSets > 0 && (
                    <span>💪 {w.completedSets} serie</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════

export default function App() {
  const [view, setView] = useState('tabs');
  const [activeIdx, setActiveIdx] = useState(0);

  const session = sessions[activeIdx];

  if (view === 'dashboard')
    return (
      <div style={S.root}>
        <div style={S.b1} />
        <div style={S.b2} />
        <div style={S.b3} />
        <div style={S.wrap}>
          <Dashboard onBack={() => setView('tabs')} />
        </div>
      </div>
    );

  if (view === 'session')
    return (
      <div style={S.root}>
        <div style={S.b1} />
        <div style={S.b2} />
        <div style={S.b3} />
        <div style={S.wrap}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: session.color,
              }}
            >
              {session.icon} {session.label}
            </h2>
            <button
              style={{ ...S.btn, background: 'rgba(255,255,255,0.08)' }}
              onClick={() => setView('tabs')}
            >
              ← Indietro
            </button>
          </div>
          {session.type === 'extra' ? (
            <ExtraSession
              session={session}
              onFinish={() => {
                alert('✅ Attività salvata!');
                setView('tabs');
              }}
            />
          ) : (
            <WorkoutSession
              session={session}
              onFinish={() => {
                alert('✅ Sessione salvata!');
                setView('tabs');
              }}
            />
          )}
        </div>
      </div>
    );

  return (
    <div style={S.root}>
      <div style={S.b1} />
      <div style={S.b2} />
      <div style={S.b3} />
      <div style={S.wrap}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={S.title}>💪 Scheda Consuelo</h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '13px',
              margin: 0,
            }}
          >
            4 giorni · Tonifica · Rafforza le ossa
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            justifyContent: 'center',
          }}
        >
          <button
            style={{
              ...S.btn,
              background: 'rgba(108,99,255,0.5)',
              padding: '10px 20px',
            }}
            onClick={() => setView('dashboard')}
          >
            📊 Dashboard
          </button>
        </div>
        <div style={S.tabs}>
          {sessions.map((s, i) => (
            <button
              key={s.id}
              style={{
                ...S.tab,
                background: `linear-gradient(135deg,${s.color}66,${s.color}33)`,
                borderColor: `${s.color}88`,
              }}
              onClick={() => {
                setActiveIdx(i);
                setView('session');
              }}
            >
              <span style={{ fontSize: '32px', marginBottom: '4px' }}>
                {s.icon}
              </span>
              <span
                style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.65)',
                  textAlign: 'center',
                  marginTop: '2px',
                  lineHeight: '1.3',
                }}
              >
                {s.subtitle}
              </span>
            </button>
          ))}
        </div>
        <div
          style={{
            marginTop: '24px',
            padding: '14px',
            background: 'rgba(255,165,0,0.08)',
            border: '1px solid rgba(255,165,0,0.2)',
            borderRadius: '12px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: '1.6',
            }}
          >
            ⚠️ <strong style={{ color: '#FFA500' }}>Nota iPhone:</strong> Vai in
            Dashboard → Backup per esportare i tuoi dati regolarmente. Su Safari
            i dati possono essere persi se si cancella la cache del sito.
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#0a0a1a 0%,#0d1224 50%,#0a0a1a 100%)',
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    color: '#fff',
    position: 'relative',
    overflowX: 'hidden',
  },
  b1: {
    position: 'fixed',
    top: '-120px',
    left: '-120px',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle,rgba(108,99,255,0.18) 0%,transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  b2: {
    position: 'fixed',
    bottom: '-100px',
    right: '-100px',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle,rgba(255,107,107,0.15) 0%,transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  b3: {
    position: 'fixed',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle,rgba(0,212,170,0.08) 0%,transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  wrap: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '760px',
    margin: '0 auto',
    padding: '24px 16px 80px',
  },
  title: {
    fontSize: 'clamp(22px,5vw,34px)',
    fontWeight: '800',
    margin: '0 0 6px',
    background: 'linear-gradient(90deg,#6C63FF,#FF6B6B,#00D4AA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  tabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
    gap: '12px',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '20px 12px',
    border: '1px solid',
    borderRadius: '16px',
    cursor: 'pointer',
    backdropFilter: 'blur(14px)',
  },
  watch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid',
    borderRadius: '20px',
    padding: '18px 20px',
  },
  wLabel: {
    margin: '0 0 4px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  wTime: {
    margin: 0,
    fontSize: '36px',
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: '2px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(16px)',
    border: '1px solid',
    borderRadius: '16px',
    padding: '16px',
  },
  cardHead: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  exName: {
    margin: '0 0 4px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
  },
  exMeta: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.45)' },
  infoBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid',
    borderRadius: '10px',
    padding: '12px 14px',
    margin: '12px 0 8px',
  },
  descTxt: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.65',
    color: 'rgba(255,255,255,0.75)',
  },
  exTimer: {
    position: 'relative',
    height: '38px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '10px',
    margin: '10px 0 2px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    gap: '10px',
    overflow: 'hidden',
  },
  timerBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: '10px',
    opacity: 0.15,
    transition: 'width 0.9s linear',
  },
  timerTxt: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: '16px',
    color: '#fff',
    zIndex: 1,
  },
  sets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    marginTop: '12px',
  },
  dot: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '2px solid',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restBtn: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    marginLeft: 'auto',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(28px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '24px',
    padding: '32px 28px',
    textAlign: 'center',
    minWidth: '260px',
  },
  modalTitle: {
    margin: '0 0 16px',
    fontSize: '18px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  btn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
  },
  sm: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.1)',
  },
  row: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '14px',
  },
  finishBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
  },
};
