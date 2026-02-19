import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
// STORAGE — IndexedDB + localStorage doppio salvataggio
// ═══════════════════════════════════════════════════════
const DB_NAME="ConsueloHome", DB_STORE="history", DB_VER=1;
let dbInst=null;
function openDB(){
  return new Promise((res,rej)=>{
    if(dbInst) return res(dbInst);
    const r=indexedDB.open(DB_NAME,DB_VER);
    r.onupgradeneeded=e=>e.target.result.createObjectStore(DB_STORE,{keyPath:"id"});
    r.onsuccess=e=>{dbInst=e.target.result;res(dbInst);};
    r.onerror=()=>rej(r.error);
  });
}
async function dbGetAll(){try{const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(DB_STORE,"readonly");const req=tx.objectStore(DB_STORE).getAll();req.onsuccess=()=>res(req.result||[]);req.onerror=()=>rej(req.error);});}catch{return lsGet();}}
async function dbSave(item){try{const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(DB_STORE,"readwrite");tx.objectStore(DB_STORE).put(item);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}catch{lsAdd(item);}}
async function dbDelete(id){try{const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction(DB_STORE,"readwrite");tx.objectStore(DB_STORE).delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}catch{lsDel(id);}}
function lsGet(){try{return JSON.parse(localStorage.getItem("cw_home")||"[]");}catch{return[];}}
function lsAdd(w){try{const h=lsGet();h.push(w);localStorage.setItem("cw_home",JSON.stringify(h));}catch{}}
function lsDel(id){try{const h=lsGet().filter(w=>w.id!==id);localStorage.setItem("cw_home",JSON.stringify(h));}catch{}}

// ═══════════════════════════════════════════════════════
// DATA — Scheda Casa Consuelo
// ═══════════════════════════════════════════════════════
const sessions = [
  {
    id:1, label:"Lunedì", subtitle:"Upper Body · Schiena · Spalle · Braccia",
    color:"#6C63FF", glow:"rgba(108,99,255,0.45)", icon:"💪", type:"workout",
    warmup:"1 min corda (o jumping jack) · 20 cerchi braccia avanti+indietro · 10 rotazioni busto · 10 inclinazioni laterali · 5 respiri profondi",
    groups:[
      { name:"Schiena — Dorsali", icon:"🔙", exercises:[
        { name:"Rematore con manubrio su sedia", sets:4, reps:"12 per lato", rest:60, description:"Appoggia ginocchio e mano sinistri sulla sedia. Corpo parallelo al pavimento, schiena piatta. Manubrio con la mano destra, braccio disteso verso il basso (allungamento dorsali). ESPIRA portando il gomito verso il soffitto il più in alto possibile. Spremi la scapola verso la colonna 1-2 sec (accorciamento). Ridiscendi in 3 sec. È il GOMITO che guida, non la mano! 4→6 kg." },
        { name:"Rematore elastico seduta — presa larga", sets:3, reps:"15", rest:60, description:"Siediti sul tappetino, elastico attorno ai piedi. Tira verso l'ombelico con i gomiti aperti verso l'esterno. Spremi le scapole verso la colonna in cima. Rilascia lentamente mantenendo la tensione. Elastico medio." },
        { name:"Rematore elastico seduta — presa stretta", sets:3, reps:"15", rest:60, description:"Stessa posizione della presa larga, ma gomiti che sfiorano i fianchi durante la trazione. Attiva la parte bassa dei dorsali. Stessa cura nel rilascio lento." },
        { name:"Pull-over con manubrio (da sdraiata)", sets:3, reps:"12", rest:60, description:"Sdraiata sul tappetino, ginocchia piegate, piedi piatti. Manubrio con entrambe le mani sopra il petto, braccia quasi distese. INSPIRA e abbassa lentamente il manubrio sopra la testa verso il pavimento — senti un profondo allungamento sotto le ascelle (dorsali!). ESPIRA e riporta sopra il petto contraendo i dorsali. Testa e schiena sempre a contatto col tappetino. 4-6 kg." },
        { name:"Alzate posteriori piegate (rear delt)", sets:3, reps:"15", rest:45, description:"In piedi, busto inclinato a 45° in avanti, braccia pendenti con i manubri. Apri le braccia lateralmente come le ali di un aereo. Fermati all'altezza delle spalle. Abbassa lentamente in 3 sec. Lavora il fascio posteriore della spalla. 2-3 kg." },
      ]},
      { name:"Schiena — Lombari", icon:"🦴", exercises:[
        { name:"Superman (braccia e gambe)", sets:4, reps:"12", rest:45, description:"Sdraiata a pancia in giù, braccia distese sopra la testa, gambe dritte. Contrai contemporaneamente glutei, lombari e muscoli tra le scapole. Solleva braccia e gambe di 10-15 cm da terra. Tieni 2 secondi. Torna giù lentamente. La testa rimane neutra — guarda il pavimento. Rinforza tutta la catena posteriore!" },
        { name:"Bird Dog (Uccello-Cane)", sets:3, reps:"10 per lato", rest:45, description:"A quattro zampe, mani sotto le spalle, ginocchia sotto i fianchi. Schiena piatta come un tavolo. ESPIRA distendendo braccio destro in avanti e gamba sinistra indietro simultaneamente. Tieni 2-3 sec in linea retta. Ritorna senza toccare terra tra le reps. Poi lato opposto. Se i fianchi ruotano, rallenta. Fondamentale per la stabilità lombare!" },
        { name:"Good Morning con manubrio leggero", sets:3, reps:"12", rest:60, description:"In piedi, manubrio leggero dietro la nuca (2-4 kg). Ginocchia leggermente piegate. Inclina il busto in avanti fino a 45° tenendo la schiena DRITTA. Senti i femorali allungarsi. Risali contraendo glutei e lombari. Mai curvare la schiena!" },
        { name:"Stacco con manubri (controllato)", sets:3, reps:"12", rest:75, description:"In piedi, manubri davanti alle cosce. Piega le ginocchia abbassando i manubri verso il pavimento, schiena sempre dritta. Spingi i fianchi indietro. Senti i femorali lavorare. Risali espirando, contraendo i glutei. 4-6 kg per mano." },
      ]},
      { name:"Spalle", icon:"🏋️", exercises:[
        { name:"Lento avanti con manubri (seduta)", sets:4, reps:"12", rest:60, description:"Seduta sulla sedia con schienale, schiena appoggiata. Manubri all'altezza delle orecchie, gomiti a 90°, palmi avanti. ESPIRA spingendo verso l'alto e leggermente al centro. Distendi le braccia senza bloccare i gomiti. Riabbassa lentamente in 3 sec. Schiena incollata allo schienale! 4→5 kg." },
        { name:"Alzate laterali con manubri", sets:3, reps:"15", rest:45, description:"In piedi, braccia leggermente piegate lungo i fianchi. Solleva le braccia ai lati come ali fino all'altezza delle spalle — NON oltre! Pollici leggermente verso il basso. Abbassa in 3-4 sec. Pesi leggeri obbligatori: 2→3 kg!" },
        { name:"Alzate frontali alternate", sets:3, reps:"12 per braccio", rest:45, description:"In piedi, core contratto. Porta un braccio alla volta in avanti fino a 90°, l'altro rimane lungo il fianco. Tieni 1 sec in cima. Abbassa lentamente. Non dondolare il busto. 2-3 kg." },
        { name:"Face Pull con elastico", sets:3, reps:"15", rest:45, description:"Ancora l'elastico ad altezza testa (maniglia porta, corrimano). Fai un passo indietro per metterlo in tensione. Porta le mani verso le orecchie con i GOMITI ALTI e aperti — forma una W con le braccia. Tieni 1 sec, sentirai lavorare la spalla posteriore. Ritorna lentamente in 3 sec. Fondamentale per postura e cervicale!" },
        { name:"Alzate posteriori piegate (con manubri)", sets:3, reps:"15", rest:45, description:"Busto inclinato a 45° in avanti, manubri pendenti. Apri le braccia come le ali di un aereo. Fascio posteriore della spalla. 2 kg." },
      ]},
      { name:"Bicipiti & Tricipiti", icon:"🦾", exercises:[
        { name:"Curl manubri alternato (bicipite)", sets:4, reps:"12 per braccio", rest:45, description:"In piedi o seduta senza schienale, schiena dritta, addome contratto. Manubri lungo i fianchi, palmi verso l'alto. Porta UN manubrio verso la spalla con il GOMITO FERMO al fianco. A fine salita ruota il polso verso l'esterno (mignolo in su) per la contrazione massima. Tieni 1 sec, ridiscendi in 3 sec. NON oscillare le spalle! 4→5 kg." },
        { name:"Hammer Curl (presa neutra)", sets:3, reps:"12", rest:45, description:"Presa neutra, pollice in alto. Stessa tecnica del curl ma senza ruotare il polso. Lavora bicipite, brachiale e avambraccio. Gomito sempre fermo al fianco. 4 kg." },
        { name:"Curl con elastico (entrambe le braccia)", sets:3, reps:"15", rest:45, description:"Piedi sull'elastico, tira con entrambe le mani verso le spalle contemporaneamente. La tensione è costante per tutto il movimento. Gomiti fermi ai fianchi. Elastico medio." },
        { name:"French Press con manubrio (tricipite)", sets:4, reps:"12", rest:45, description:"Seduta, schiena appoggiata. Manubrio con entrambe le mani sopra la testa, braccia quasi distese. INSPIRA abbassando DIETRO la testa piegando i gomiti — puntati verso il soffitto, non ai lati! Abbassa finché avambracci oltre i 90°. ESPIRA risalendo distendendo completamente. Inizia con 3→4 kg. Il tricipite è 2/3 del volume del braccio!" },
        { name:"Kick back tricipite con elastico", sets:3, reps:"15 per braccio", rest:45, description:"Busto a 45° in avanti. Gomito alto e fermo vicino al fianco. Distendi il braccio indietro completamente, senti il tricipite bruciare in contrazione massima. Ritorna lentamente. Elastico leggero." },
      ]},
    ],
  },
  {
    id:2, label:"Mercoledì", subtitle:"Lower Body · Glutei · Gambe · Core",
    color:"#FF6B6B", glow:"rgba(255,107,107,0.45)", icon:"🦵", type:"workout",
    warmup:"1 min corda (o marcia ginocchia alte) · 15 kick back per gamba · 10 squat lenti · 10 circonduzioni anca per lato · 1-2 min hula-hoop pesato",
    groups:[
      { name:"Glutei — La tua priorità!", icon:"🍑", exercises:[
        { name:"Stacco Rumeno con manubri", sets:4, reps:"12", rest:90, description:"ALLUNGAMENTO. In piedi, manubri davanti alle cosce. Ginocchia leggermente piegate — restano così! Spingi i fianchi INDIETRO (come toccare il muro dietro). I manubri scendono lungo le gambe. Sentirai femorali e glutei allungarsi intensamente — questo è il momento di crescita! Scendi fino a metà stinco. ESPIRA contraendo i glutei e torna su. Schiena SEMPRE dritta. 5→7 kg per mano." },
        { name:"Bulgarian Split Squat", sets:3, reps:"10 per gamba", rest:90, description:"ALLUNGAMENTO profondo. Dorso del piede posteriore sulla sedia, piede anteriore un passo avanti. Manubri ai fianchi, schiena dritta, sguardo avanti. INSPIRA scendendo lentamente verso terra. Ginocchio anteriore segue la direzione del piede (NON verso l'interno!). Senti il gluteo anteriore aprirsi profondamente. ESPIRA risalendo spingendo con il tallone anteriore. Inizia SENZA pesi! 3→5 kg per mano." },
        { name:"Hip Thrust con manubrio (schiena su divano)", sets:4, reps:"12", rest:90, description:"CONTRAZIONE — il re dei glutei! Schiena appoggiata al bordo del divano o sedia robusta. Piedi piatti, larghezza spalle, punte aperte. Manubrio sul bacino con asciugamano. ESPIRA spingendo i fianchi verso l'alto contraendo FORTEMENTE i glutei. In cima coscia e busto in linea retta: TIENI 2 secondi! Abbassa in 3 sec senza toccare terra. Spingi con i TALLONI sempre. 6→10 kg." },
        { name:"Donkey Kick con elastico", sets:3, reps:"15 per gamba", rest:60, description:"CONTRAZIONE. A quattro zampe, elastico attorno alla caviglia. Porta il piede verso il soffitto con ginocchio a 90°. Premi il tacco verso l'alto, spremi il gluteo in cima. Movimento lento e controllato, no inerzia. Tieni 1 sec. Elastico medio." },
        { name:"Lateral Walk con elastico", sets:3, reps:"20 passi per lato", rest:60, description:"TENSIONE COSTANTE. Elastico sopra le ginocchia. Posizione semi-squat. Cammina lateralmente con passi ampi mantenendo la tensione sull'elastico — non lasciare mai che si allenti. 10 passi a destra, 10 a sinistra. Brucia il gluteo medio!" },
        { name:"Ponte glutei con pausa", sets:3, reps:"15", rest:45, description:"CONTRAZIONE finale. Sdraiata, ginocchia piegate, piedi piatti. Spingi i fianchi verso il soffitto contraendo i glutei. TIENI 3 secondi stringendo forte. Abbassa senza toccare terra — mantieni la tensione. Spingi con i TALLONI per isolare i glutei rispetto alle cosce. Corpo libero." },
      ]},
      { name:"Gambe & Femorali", icon:"🦵", exercises:[
        { name:"Goblet Squat con manubrio", sets:4, reps:"15", rest:75, description:"Piedi alla larghezza delle spalle o più larghi, punte aperte 30-45°. Manubrio verticale al petto con entrambe le mani. INSPIRA scendendo come su una sedia invisibile bassa. Ginocchia nella direzione delle punte (MAI verso l'interno!). Talloni SEMPRE a terra. Cosce parallele al pavimento. ESPIRA risalendo spingendo con i talloni. Ottimo per la densità ossea! 6→8 kg." },
        { name:"Squat Sumo con manubrio", sets:3, reps:"15", rest:75, description:"Piedi MOLTO larghi, punte aperte 45°. Manubrio tenuto al centro con entrambe le mani. Scendi verticalmente tra le gambe. Lavora gluteo medio e interno coscia. Talloni a terra, ginocchia fuori. 8 kg." },
        { name:"Affondi camminati con manubri", sets:3, reps:"10 per gamba", rest:75, description:"Passo lungo in avanti, scendi con il ginocchio posteriore quasi a terra. Il ginocchio anteriore non supera la punta del piede. Spingiti avanti col piede anteriore. Busto eretto, core contratto. Alternate le gambe camminando. 4 kg per mano." },
        { name:"Leg Curl con elastico (da sdraiata)", sets:3, reps:"15 per gamba", rest:60, description:"Sdraiata a pancia in su, elastico attorno alla caviglia ancorato in basso (gamba del divano). Piega il ginocchio portando il tallone verso il gluteo. Lenta risalita, no slancio. Elastico medio." },
        { name:"Calf Raise (sollevamento punte)", sets:3, reps:"20", rest:45, description:"In piedi vicino alla parete, manubri in mano. Solleva sulle punte dei piedi il più in alto possibile. Abbassa lentamente — il tallone scende sotto il livello del pavimento se possibile (usa un gradino). 6-8 kg." },
      ]},
      { name:"Core & Addominali", icon:"🔥", exercises:[
        { name:"Plank frontale su gomiti", sets:4, reps:"30 sec → 45 sec", rest:45, isTime:true, duration:35, description:"Gomiti sotto le spalle, punte dei piedi a terra. Corpo dritto dalla testa ai talloni — addome incavato verso la colonna. Non lasciare cadere i fianchi né alzarli. Respira normalmente. Aumenta di 5 sec ogni settimana." },
        { name:"Dead Bug", sets:3, reps:"10 per lato", rest:45, description:"Sdraiata, PREMI la lombare contro il pavimento — nessuno spazio! Braccia verso il soffitto, gambe a 90° tabletop. INSPIRA, poi ESPIRA abbassando braccio destro + gamba sinistra lentamente (3 sec). La schiena NON si stacca mai. Ritorna piano, poi l'altro lato. Uno degli esercizi più efficaci e sicuri per l'osteopenia!" },
        { name:"Hollow Body Hold", sets:3, reps:"20 sec", rest:45, isTime:true, duration:20, description:"Sdraiata, SCHIACCIA la lombare al pavimento — nessuno spazio! Solleva leggermente spalle, braccia e gambe (15-20 cm). L'addome si incava: ombelico verso la colonna. Schiena piatta durante tutta la posizione. Respira normalmente. Se troppo difficile, tieni le gambe a 45°." },
        { name:"Russian Twist con manubrio", sets:3, reps:"12 per lato", rest:45, description:"Seduta a 45°, piedi sollevati (o a terra all'inizio). Manubrio davanti al petto. Ruota il busto portando il manubrio verso il fianco destro, poi sinistro. Gli occhi seguono il manubrio per aumentare la rotazione. Respira regolarmente. 2-3 kg." },
        { name:"Crunch con rotazione (obliqui)", sets:3, reps:"15 per lato", rest:40, description:"Sdraiata, ginocchia piegate. Porta il gomito destro verso il ginocchio sinistro ruotando il busto. Solo le spalle si staccano — non il collo! Movimento lentissimo e controllato." },
        { name:"Leg Raise (sollevamento gambe)", sets:3, reps:"12", rest:45, description:"Sdraiata, schiena piatta, mani sotto i glutei. Gambe dritte, solleva fino a 90°. Abbassa lentamente SENZA toccare terra. Zona lombare incollata al suolo. Espira salendo, inspira scendendo." },
      ]},
      { name:"Bonus — Hula-Hoop", icon:"⭕", exercises:[
        { name:"Hula-Hoop pesato", sets:1, reps:"5-10 min", rest:0, isTime:true, duration:300, description:"Aggiungi 5-10 minuti di hula-hoop pesato DOPO la sessione. Il movimento rotatorio fortifica i muscoli profondi della vita, i glutei medi e migliora l'equilibrio. Inizia con 2-3 minuti, aumenta gradualmente. Ottimo senza impatto sulle articolazioni!" },
      ]},
    ],
  },
  {
    id:3, label:"Venerdì", subtitle:"Full Body · Tutto il corpo",
    color:"#00D4AA", glow:"rgba(0,212,170,0.45)", icon:"🌟", type:"workout",
    warmup:"1 min corda (o marcia ginocchia alte) · 15 rotazioni spalle avanti+indietro · 10 squat lenti + 10 cerchi fianchi · 5 respiri profondi",
    groups:[
      { name:"Parte Superiore", icon:"💪", exercises:[
        { name:"Rematore a due braccia (piegata)", sets:3, reps:"12", rest:60, description:"In piedi, ginocchia leggermente piegate, busto inclinato a 45°, schiena piatta. Tieni i manubri con entrambe le mani, braccia distese. ESPIRA tirando ENTRAMBI i manubri verso i fianchi, gomiti indietro e verso l'alto. Spremi le scapole verso la colonna 1 sec. Ridiscendi in 3 sec. Non oscillare il busto! 4-5 kg per mano." },
        { name:"Push Up modificato (sulle ginocchia)", sets:3, reps:"12", rest:60, description:"Ginocchia a terra sul tappetino. Mani più larghe delle spalle, dita in avanti. Corpo dritto dalla testa alle ginocchia. INSPIRA abbassando il petto verso il pavimento: gomiti a 45° (NON aperti a 90°!). Abbassa finché il petto quasi tocca. ESPIRA risalendo. Progressione: quando fai 15 perfetti, sposta le ginocchia più indietro." },
        { name:"Lento avanti con manubri (seduta)", sets:3, reps:"12", rest:60, description:"Come da Lunedì. Seduta, schienale. Manubri alle orecchie, spingi verso l'alto. Schiena incollata. 4 kg." },
        { name:"Curl + French Press (superset)", sets:3, reps:"10+10", rest:75, description:"SUPERSET: fai 10 curl bicipite (4 kg) poi SUBITO senza pausa 10 French Press tricipite (3 kg). Poi riposa 75 sec. Braccia in fiamme! Tecnica identica agli esercizi singoli dei giorni precedenti." },
        { name:"Superman (richiamo lombare)", sets:3, reps:"12", rest:45, description:"Mantieni i lombari allenati anche nel full body. A pancia in giù, solleva braccia e gambe 10-15 cm. Tieni 2 sec. Catena posteriore sempre attiva!" },
      ]},
      { name:"Parte Inferiore", icon:"🦵", exercises:[
        { name:"Stacco Rumeno con manubri", sets:3, reps:"12", rest:75, description:"ALLUNGAMENTO glutei e femorali. Fianchi indietro, schiena dritta, abbassa i manubri lungo le gambe fino a metà stinco. Risali contraendo i glutei. 5-6 kg per mano." },
        { name:"Goblet Squat con manubrio", sets:3, reps:"15", rest:75, description:"Manubrio al petto, scendi come su una sedia. Talloni a terra, ginocchia fuori. Core contratto. 6-8 kg." },
        { name:"Ponte glutei con pausa", sets:3, reps:"15", rest:60, description:"CONTRAZIONE: fianchi su, TIENI 3 sec, abbassa senza toccare terra. Talloni sempre! Corpo libero." },
        { name:"Affondi statici alternati", sets:3, reps:"10 per gamba", rest:60, description:"Passo lungo, abbassa il ginocchio posteriore quasi a terra. Risali, poi cambia gamba. Busto eretto. 3-4 kg per mano." },
        { name:"Lateral Walk + Donkey Kick (superset)", sets:3, reps:"10+10 per lato", rest:60, description:"SUPERSET: 10 passi laterali con elastico poi SUBITO 10 donkey kick per gamba. Gluteo in fiamme! Elastico sopra le ginocchia. Recupera 60 sec dopo il superset completo." },
      ]},
      { name:"Core Finale", icon:"🔥", exercises:[
        { name:"Plank frontale", sets:3, reps:"30-40 sec", rest:30, isTime:true, duration:35, description:"Corpo dritto, addome contratto, respira. Aumenta di 5 sec ogni settimana." },
        { name:"Plank laterale (fianco)", sets:3, reps:"20 sec per lato", rest:30, isTime:true, duration:20, description:"Sul gomito o sulla mano, corpo dritto di lato, anca alta. Obliqui e gluteo medio al lavoro. 20 sec per lato." },
        { name:"Crunch classico lento", sets:3, reps:"15", rest:30, description:"Solo le spalle si sollevano (non il collo!). Mani leggere dietro la testa. Sali E scendi lentamente — il controllo è tutto." },
        { name:"Respirazione diaframmatica (chiusura)", sets:1, reps:"5 respiri", rest:0, isTime:true, duration:60, description:"Sdraiata. Inspira 4 sec (pancia gonfia), pausa 2 sec, espira 6 sec. Abbassa il cortisolo e chiudi la sessione con calma." },
      ]},
    ],
  },
  {
    id:4, label:"Sabato", subtitle:"Riposo Attivo · Movimento Dolce",
    color:"#FFA500", glow:"rgba(255,165,0,0.45)", icon:"🌿", type:"extra",
    activities:[
      { name:"Camminata", icon:"🚶", description:"Camminata a passo sostenuto all'aperto. Obiettivo: 20-30 minuti. Avvia il timer e goditi il movimento!" },
      { name:"Hula-Hoop", icon:"⭕", description:"10 minuti di hula-hoop pesato per vita, fianchi e gluteo medio. Inizia con 3 min e aumenta gradualmente." },
      { name:"Stretching", icon:"🧘", description:"8-10 min: piriforme (30s per lato), femorali, psoas cavaliere, gatto-cammello, spalle, allungamento laterale obliqui. Respira profondamente su ogni posizione." },
      { name:"Corda", icon:"🪢", description:"Cardio bonus: 10 min di salti con la corda a ritmo moderato. Inizio a piedi uniti lenti, poi aumenta il ritmo." },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════
function useTimer(sec){
  const [time,setTime]=useState(sec);
  const [running,setRunning]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(running&&time>0) ref.current=setInterval(()=>setTime(t=>t-1),1000);
    else if(time===0) setRunning(false);
    return()=>clearInterval(ref.current);
  },[running,time]);
  return{time,running,start:()=>setRunning(true),pause:()=>setRunning(false),reset:()=>{setRunning(false);setTime(sec);}};
}
function fmt(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;if(h>0)return`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;return`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;}

// ═══════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════
function RestTimerModal({seconds,onClose}){
  const{time,running,start,pause,reset}=useTimer(seconds);
  useEffect(()=>{start();},[]);
  const pct=(time/seconds)*100,C=2*Math.PI*54;
  return(<div style={S.overlay} onClick={onClose}><div style={S.modalCard} onClick={e=>e.stopPropagation()}>
    <p style={S.modalTitle}>⏱ Recupero</p>
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
      <circle cx="65" cy="65" r="54" fill="none" stroke={time<=10?"#FF6B6B":"#6C63FF"} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-pct/100)} transform="rotate(-90 65 65)" style={{transition:"stroke-dashoffset 0.9s linear,stroke 0.3s"}}/>
      <text x="65" y="70" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="monospace">{fmt(time)}</text>
    </svg>
    <div style={S.row}>
      {running?<button style={{...S.btn,background:"rgba(255,255,255,0.15)"}} onClick={pause}>⏸ Pausa</button>:<button style={{...S.btn,background:"rgba(108,99,255,0.6)"}} onClick={start}>▶ Riprendi</button>}
      <button style={{...S.btn,background:"rgba(255,107,107,0.4)"}} onClick={reset}>↺</button>
      <button style={{...S.btn,background:"rgba(255,255,255,0.08)"}} onClick={onClose}>✕</button>
    </div>
    {time===0&&<p style={{color:"#00D4AA",fontWeight:"700",marginTop:"10px"}}>✅ Recupero completato!</p>}
  </div></div>);
}

function ExTimer({duration}){
  const{time,running,start,pause,reset}=useTimer(duration);
  const pct=(time/duration)*100,col=time<=10?"#FF6B6B":"#00D4AA";
  return(<div style={S.exTimer}>
    <div style={{...S.timerBar,width:`${pct}%`,background:col}}/>
    <span style={S.timerTxt}>{fmt(time)}</span>
    <div style={{display:"flex",gap:"6px",marginLeft:"auto",position:"relative",zIndex:1}}>
      {running?<button style={S.sm} onClick={pause}>⏸</button>:<button style={{...S.sm,background:"rgba(0,212,170,0.4)"}} onClick={start}>▶</button>}
      <button style={{...S.sm,background:"rgba(255,107,107,0.3)"}} onClick={reset}>↺</button>
    </div>
  </div>);
}

function ExCard({ex,color,done,onSet}){
  const[open,setOpen]=useState(false);
  const[showRest,setShowRest]=useState(false);
  return(<>
    {showRest&&<RestTimerModal seconds={ex.rest||90} onClose={()=>setShowRest(false)}/>}
    <div style={{...S.card,borderColor:`${color}44`}}>
      <div style={S.cardHead}>
        <div style={{flex:1}}>
          <p style={S.exName}>{ex.name}</p>
          <p style={S.exMeta}>{ex.sets} serie · {ex.reps}{ex.rest>0?` · rec.${ex.rest}s`:""}</p>
        </div>
        <button style={{...S.infoBtn,borderColor:`${color}66`,color}} onClick={()=>setOpen(!open)}>{open?"✕":"ℹ"}</button>
      </div>
      {open&&<div style={{...S.desc,borderColor:`${color}33`}}><p style={S.descTxt}>{ex.description}</p></div>}
      {ex.isTime&&ex.duration&&<ExTimer duration={ex.duration}/>}
      <div style={S.sets}>
        {Array.from({length:ex.sets}).map((_,i)=>(
          <button key={i} style={{...S.dot,background:done>i?color:"rgba(255,255,255,0.08)",borderColor:done>i?color:"rgba(255,255,255,0.2)",boxShadow:done>i?`0 0 10px ${color}88`:"none"}} onClick={()=>onSet(i)}>{done>i?"✓":i+1}</button>
        ))}
        {ex.rest>0&&<button style={{...S.restBtn,borderColor:`${color}55`,color}} onClick={()=>setShowRest(true)}>⏱ Recupero</button>}
      </div>
    </div>
  </>);
}

function Group({group,color,completedSets,onSetComplete}){
  return(<div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
    <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"2px"}}>
      <span style={{fontSize:"20px"}}>{group.icon}</span>
      <span style={{fontSize:"16px",fontWeight:"700",color}}>{group.name}</span>
    </div>
    {group.exercises.map((ex,i)=>(
      <ExCard key={ex.name} ex={ex} color={color} done={completedSets[i]} onSet={si=>onSetComplete(i,si)}/>
    ))}
  </div>);
}

function WorkoutSession({session,onFinish}){
  const[elapsed,setElapsed]=useState(0);
  const[running,setRunning]=useState(false);
  const[completedSets,setCompletedSets]=useState(()=>session.groups.map(g=>g.exercises.map(()=>0)));
  const[showWarmup,setShowWarmup]=useState(true);
  const ref=useRef(null);
  useEffect(()=>{if(running)ref.current=setInterval(()=>setElapsed(e=>e+1),1000);else clearInterval(ref.current);return()=>clearInterval(ref.current);},[running]);

  const handleSetComplete=(gIdx,eIdx,setIdx)=>{
    setCompletedSets(prev=>{const next=prev.map(g=>[...g]);next[gIdx][eIdx]=next[gIdx][eIdx]>=setIdx+1?setIdx:setIdx+1;return next;});
  };

  const handleFinish=async()=>{
    const exercises=[];
    session.groups.forEach((g,gIdx)=>g.exercises.forEach((ex,eIdx)=>{exercises.push({name:ex.name,setsCompleted:completedSets[gIdx][eIdx],setsTotal:ex.sets,reps:ex.reps});}));
    const w={id:Date.now().toString(),date:new Date().toISOString(),sessionId:session.id,sessionName:session.label,duration:elapsed,completed:true,exercises,totalSets:exercises.reduce((s,e)=>s+e.setsTotal,0),completedSets:exercises.reduce((s,e)=>s+e.setsCompleted,0)};
    await dbSave(w);lsAdd(w);onFinish();
  };

  return(<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
    {showWarmup&&session.warmup&&(
      <div style={{...S.card,borderColor:"rgba(255,200,0,0.4)",background:"rgba(255,200,0,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
          <span style={{fontSize:"14px",fontWeight:"700",color:"#FFD93D"}}>🔥 Riscaldamento (5-7 min)</span>
          <button style={{...S.sm,background:"rgba(255,217,61,0.2)",fontSize:"11px",width:"auto",padding:"4px 10px",borderRadius:"12px"}} onClick={()=>setShowWarmup(false)}>✓ Fatto</button>
        </div>
        <p style={{margin:0,fontSize:"13px",color:"rgba(255,255,255,0.7)",lineHeight:"1.7"}}>{session.warmup}</p>
      </div>
    )}
    <div style={{...S.watch,borderColor:`${session.color}44`,boxShadow:`0 0 30px ${session.glow}`}}>
      <div><p style={S.wLabel}>Durata sessione</p><p style={{...S.wTime,color:session.color}}>{fmt(elapsed)}</p></div>
      <div style={S.row}>
        {running?<button style={{...S.btn,background:"rgba(255,255,255,0.1)"}} onClick={()=>setRunning(false)}>⏸ Pausa</button>:<button style={{...S.btn,background:`${session.color}99`}} onClick={()=>setRunning(true)}>▶ {elapsed===0?"Inizia":"Riprendi"}</button>}
        <button style={{...S.btn,background:"rgba(255,107,107,0.3)"}} onClick={()=>{setRunning(false);setElapsed(0);}}>↺ Reset</button>
      </div>
    </div>
    {session.groups.map((g,gIdx)=>(
      <Group key={g.name} group={g} color={session.color} completedSets={completedSets[gIdx]} onSetComplete={(eIdx,setIdx)=>handleSetComplete(gIdx,eIdx,setIdx)}/>
    ))}
    <button style={{...S.finishBtn,background:`${session.color}99`}} onClick={handleFinish}>✅ Completa Sessione</button>
  </div>);
}

function ExtraSession({session,onFinish}){
  const[active,setActive]=useState(null);
  const[elapsed,setElapsed]=useState(0);
  const[running,setRunning]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{if(running)ref.current=setInterval(()=>setElapsed(e=>e+1),1000);else clearInterval(ref.current);return()=>clearInterval(ref.current);},[running]);
  const handleFinish=async()=>{
    const w={id:Date.now().toString(),date:new Date().toISOString(),sessionId:session.id,sessionName:`${session.label} · ${active.name}`,activityType:active.name,duration:elapsed,completed:true,exercises:[],totalSets:0,completedSets:0};
    await dbSave(w);lsAdd(w);setActive(null);setElapsed(0);setRunning(false);onFinish();
  };
  if(active)return(<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
    <div style={{...S.card,borderColor:`${session.color}44`}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px"}}>
        <span style={{fontSize:"36px"}}>{active.icon}</span>
        <div><h3 style={{margin:0,fontSize:"20px",fontWeight:"700",color:session.color}}>{active.name}</h3><p style={{margin:"4px 0 0",fontSize:"13px",color:"rgba(255,255,255,0.55)"}}>{active.description}</p></div>
      </div>
      <div style={{...S.watch,borderColor:`${session.color}44`,marginTop:"16px"}}>
        <div><p style={S.wLabel}>Durata</p><p style={{...S.wTime,color:session.color}}>{fmt(elapsed)}</p></div>
        <div style={S.row}>
          {running?<button style={{...S.btn,background:"rgba(255,255,255,0.1)"}} onClick={()=>setRunning(false)}>⏸ Pausa</button>:<button style={{...S.btn,background:`${session.color}99`}} onClick={()=>setRunning(true)}>▶ Riprendi</button>}
          <button style={{...S.btn,background:"rgba(255,107,107,0.3)"}} onClick={()=>{setRunning(false);setElapsed(0);}}>↺</button>
        </div>
      </div>
    </div>
    <button style={{...S.finishBtn,background:`${session.color}99`}} onClick={handleFinish}>✅ Completa</button>
    <button style={{...S.btn,background:"rgba(255,255,255,0.08)",width:"100%",padding:"12px"}} onClick={()=>{setActive(null);setElapsed(0);setRunning(false);}}>← Torna</button>
  </div>);
  return(<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
    <p style={{fontSize:"15px",color:"rgba(255,255,255,0.65)",margin:"0 0 8px"}}>Seleziona attività:</p>
    {session.activities.map(a=>(
      <div key={a.name} style={{...S.card,borderColor:`${session.color}44`,cursor:"pointer"}} onClick={()=>{setActive(a);setElapsed(0);setRunning(true);}}>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <span style={{fontSize:"42px"}}>{a.icon}</span>
          <div style={{flex:1}}><h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:"#fff"}}>{a.name}</h3><p style={{margin:"4px 0 0",fontSize:"13px",color:"rgba(255,255,255,0.55)",lineHeight:"1.5"}}>{a.description}</p></div>
          <span style={{fontSize:"24px",color:session.color}}>▶</span>
        </div>
      </div>
    ))}
  </div>);
}

function Dashboard({onBack}){
  const[history,setHistory]=useState([]);
  const[filter,setFilter]=useState("all");
  const[showHistory,setShowHistory]=useState(false);
  useEffect(()=>{dbGetAll().then(h=>setHistory(h.sort((a,b)=>new Date(b.date)-new Date(a.date))));},[]);
  const fDays={"7d":7,"30d":30,"90d":90,"year":365};
  const cutoff=filter==="all"?null:new Date(Date.now()-fDays[filter]*86400000);
  const filtered=cutoff?history.filter(w=>new Date(w.date)>=cutoff):history;
  const total=filtered.length;
  const totalSets=filtered.reduce((s,w)=>s+(w.completedSets||0),0);
  const avgDur=total>0?Math.round(filtered.reduce((s,w)=>s+w.duration,0)/total):0;
  const sorted=[...history].map(w=>new Date(w.date).toDateString()).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>new Date(b)-new Date(a));
  let streak=0;const now=new Date();
  for(const d of sorted){const diff=Math.floor((now-new Date(d))/86400000);if(diff===streak)streak++;else break;}
  const sCounts=filtered.reduce((acc,w)=>{const k=w.sessionId||"other";acc[k]=(acc[k]||0)+1;return acc;},{});
  const exFreq={};filtered.forEach(w=>(w.exercises||[]).forEach(ex=>{exFreq[ex.name]=(exFreq[ex.name]||0)+ex.setsCompleted;}));
  const topEx=Object.entries(exFreq).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const handleDelete=async(id)=>{if(!confirm("Eliminare?"))return;await dbDelete(id);lsDel(id);setHistory(h=>h.filter(w=>w.id!==id));};
  const exportData=()=>{const json=JSON.stringify(history,null,2);const blob=new Blob([json],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`consuelo_home_${new Date().toISOString().slice(0,10)}.json`;a.click();};
  const importData=(e)=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=async ev=>{try{const data=JSON.parse(ev.target.result);for(const w of data){await dbSave(w);lsAdd(w);}dbGetAll().then(h=>setHistory(h.sort((a,b)=>new Date(b.date)-new Date(a.date))));alert("✅ Dati importati!");}catch{alert("❌ File non valido");}};reader.readAsText(file);};

  const cards=[{label:"Streak 🔥",value:`${streak}g`,color:"#FF6B6B"},{label:"Sessioni",value:total,color:"#6C63FF"},{label:"Serie Tot.",value:totalSets,color:"#00D4AA"},{label:"Media",value:fmt(avgDur),color:"#FFA500"}];
  return(<div style={{display:"flex",flexDirection:"column",gap:"20px",paddingBottom:"40px"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <h2 style={{margin:0,fontSize:"22px",fontWeight:"800",color:"#fff"}}>📊 Dashboard</h2>
      <button style={{...S.btn,background:"rgba(255,255,255,0.08)"}} onClick={onBack}>← Indietro</button>
    </div>
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
      {["all","7d","30d","90d","year"].map(f=>(
        <button key={f} style={{...S.btn,background:filter===f?"rgba(108,99,255,0.6)":"rgba(255,255,255,0.08)",border:filter===f?"1px solid #6C63FF":"none"}} onClick={()=>setFilter(f)}>
          {f==="all"?"Tutto":f==="7d"?"7g":f==="30d"?"30g":f==="90d"?"90g":"Anno"}
        </button>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"10px"}}>
      {cards.map(c=>(<div key={c.label} style={{...S.card,borderColor:`${c.color}44`,padding:"14px"}}><p style={{margin:"0 0 4px",fontSize:"10px",color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{c.label}</p><p style={{margin:0,fontSize:"24px",fontWeight:"800",color:c.color}}>{c.value}</p></div>))}
    </div>
    {Object.keys(sCounts).length>0&&(<div style={{...S.card,borderColor:"rgba(255,255,255,0.12)"}}>
      <h3 style={{margin:"0 0 12px",fontSize:"15px",fontWeight:"700"}}>Distribuzione Sessioni</h3>
      {Object.entries(sCounts).map(([id,count])=>{const s=sessions.find(s=>s.id===parseInt(id));const color=s?s.color:"#999",label=s?s.label:"Altro";const pct=(count/total*100).toFixed(0);return(<div key={id} style={{marginBottom:"10px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{fontSize:"13px",fontWeight:"600",color}}>{label}</span><span style={{fontSize:"12px",color:"rgba(255,255,255,0.5)"}}>{count}× ({pct}%)</span></div><div style={{height:"6px",background:"rgba(255,255,255,0.08)",borderRadius:"3px",overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:color}}/></div></div>);})}
    </div>)}
    {topEx.length>0&&(<div style={{...S.card,borderColor:"rgba(255,255,255,0.12)"}}>
      <h3 style={{margin:"0 0 12px",fontSize:"15px",fontWeight:"700"}}>Top 5 Esercizi</h3>
      {topEx.map(([name,sets],i)=>(<div key={name} style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"8px"}}><span style={{fontSize:"16px",fontWeight:"700",color:"rgba(255,255,255,0.3)",minWidth:"22px"}}>#{i+1}</span><div><p style={{margin:0,fontSize:"13px",fontWeight:"600",color:"#fff"}}>{name}</p><p style={{margin:0,fontSize:"11px",color:"rgba(255,255,255,0.5)"}}>{sets} serie</p></div></div>))}
    </div>)}
    <div style={{...S.card,borderColor:"rgba(255,165,0,0.3)"}}>
      <h3 style={{margin:"0 0 8px",fontSize:"14px",fontWeight:"700",color:"#FFA500"}}>💾 Backup Dati</h3>
      <p style={{margin:"0 0 12px",fontSize:"12px",color:"rgba(255,255,255,0.5)"}}>Su iPhone esporta regolarmente per non perdere i progressi!</p>
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
        <button style={{...S.btn,background:"rgba(255,165,0,0.3)",border:"1px solid #FFA500",color:"#FFA500"}} onClick={exportData}>📤 Esporta JSON</button>
        <label style={{...S.btn,background:"rgba(0,212,170,0.2)",border:"1px solid #00D4AA",color:"#00D4AA",cursor:"pointer"}}>📥 Importa<input type="file" accept=".json" onChange={importData} style={{display:"none"}}/></label>
      </div>
    </div>
    <button style={{...S.btn,background:"rgba(108,99,255,0.3)",width:"100%",padding:"12px"}} onClick={()=>setShowHistory(!showHistory)}>{showHistory?"Nascondi Storico ▲":"Mostra Storico ▼"}</button>
    {showHistory&&(<div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
      {history.length===0&&<p style={{textAlign:"center",color:"rgba(255,255,255,0.45)",padding:"20px"}}>Nessun allenamento registrato</p>}
      {history.map(w=>{const s=sessions.find(s=>s.id===w.sessionId);const color=s?s.color:"#999";const d=new Date(w.date);return(<div key={w.id} style={{...S.card,borderColor:`${color}33`,padding:"14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}><div><p style={{margin:"0 0 2px",fontSize:"14px",fontWeight:"700",color}}>{w.sessionName}</p><p style={{margin:0,fontSize:"11px",color:"rgba(255,255,255,0.45)"}}>{d.toLocaleDateString("it-IT",{day:"numeric",month:"short",year:"numeric"})} · {d.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}</p></div><button style={{...S.sm,background:"rgba(255,107,107,0.3)",width:"28px",height:"28px",fontSize:"12px"}} onClick={()=>handleDelete(w.id)}>🗑</button></div><div style={{display:"flex",gap:"16px",fontSize:"12px",color:"rgba(255,255,255,0.55)"}}><span>⏱ {fmt(w.duration)}</span>{w.completedSets>0&&<span>💪 {w.completedSets} serie</span>}</div></div>);})}
    </div>)}
  </div>);
}

export default function App(){
  const[view,setView]=useState("tabs");
  const[activeIdx,setActiveIdx]=useState(0);
  const session=sessions[activeIdx];
  if(view==="dashboard")return(<div style={S.root}><div style={S.b1}/><div style={S.b2}/><div style={S.b3}/><div style={S.wrap}><Dashboard onBack={()=>setView("tabs")}/></div></div>);
  if(view==="session")return(<div style={S.root}><div style={S.b1}/><div style={S.b2}/><div style={S.b3}/><div style={S.wrap}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
      <h2 style={{margin:0,fontSize:"18px",fontWeight:"700",color:session.color}}>{session.icon} {session.label}</h2>
      <button style={{...S.btn,background:"rgba(255,255,255,0.08)"}} onClick={()=>setView("tabs")}>← Indietro</button>
    </div>
    {session.type==="extra"?<ExtraSession session={session} onFinish={()=>{alert("✅ Attività salvata!");setView("tabs");}}/>:<WorkoutSession session={session} onFinish={()=>{alert("✅ Sessione salvata!");setView("tabs");}}/>}
  </div></div>);
  return(<div style={S.root}><div style={S.b1}/><div style={S.b2}/><div style={S.b3}/><div style={S.wrap}>
    <div style={{textAlign:"center",marginBottom:"24px"}}>
      <h1 style={S.title}>🏠 Scheda Casa — Consuelo</h1>
      <p style={{color:"rgba(255,255,255,0.45)",fontSize:"12px",margin:"4px 0 0"}}>Manubri · Elastico · Tappetino · Hula-hoop · Corda</p>
    </div>
    <div style={{display:"flex",gap:"10px",marginBottom:"20px",justifyContent:"center"}}>
      <button style={{...S.btn,background:"rgba(108,99,255,0.5)",padding:"10px 20px"}} onClick={()=>setView("dashboard")}>📊 Dashboard</button>
    </div>
    <div style={S.tabs}>
      {sessions.map((s,i)=>(<button key={s.id} style={{...S.tab,background:`linear-gradient(135deg,${s.color}66,${s.color}33)`,borderColor:`${s.color}88`}} onClick={()=>{setActiveIdx(i);setView("session");}}>
        <span style={{fontSize:"32px",marginBottom:"4px"}}>{s.icon}</span>
        <span style={{fontSize:"14px",fontWeight:"700",color:"#fff"}}>{s.label}</span>
        <span style={{fontSize:"11px",color:"rgba(255,255,255,0.65)",textAlign:"center",marginTop:"2px",lineHeight:"1.3"}}>{s.subtitle}</span>
      </button>))}
    </div>
    <div style={{marginTop:"20px",padding:"12px 14px",background:"rgba(255,165,0,0.06)",border:"1px solid rgba(255,165,0,0.2)",borderRadius:"12px"}}>
      <p style={{margin:0,fontSize:"12px",color:"rgba(255,255,255,0.55)",lineHeight:"1.6"}}>
        ⚠️ <strong style={{color:"#FFA500"}}>iPhone:</strong> Vai in Dashboard → Backup per esportare i dati. Aggiungi questa pagina alla Schermata Home di Safari per usarla come app!
      </p>
    </div>
  </div></div>);
}

const S={
  root:{minHeight:"100vh",background:"linear-gradient(135deg,#0a0a1a 0%,#0d1224 50%,#0a0a1a 100%)",fontFamily:"'Segoe UI',system-ui,sans-serif",color:"#fff",position:"relative",overflowX:"hidden"},
  b1:{position:"fixed",top:"-120px",left:"-120px",width:"420px",height:"420px",borderRadius:"50%",background:"radial-gradient(circle,rgba(108,99,255,0.18) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  b2:{position:"fixed",bottom:"-100px",right:"-100px",width:"380px",height:"380px",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,107,107,0.15) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  b3:{position:"fixed",top:"40%",left:"50%",transform:"translate(-50%,-50%)",width:"300px",height:"300px",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,170,0.08) 0%,transparent 70%)",pointerEvents:"none",zIndex:0},
  wrap:{position:"relative",zIndex:1,maxWidth:"760px",margin:"0 auto",padding:"24px 16px 80px"},
  title:{fontSize:"clamp(20px,5vw,30px)",fontWeight:"800",margin:"0 0 6px",background:"linear-gradient(90deg,#6C63FF,#FF6B6B,#00D4AA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"},
  tabs:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"12px"},
  tab:{display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",padding:"20px 12px",border:"1px solid",borderRadius:"16px",cursor:"pointer",backdropFilter:"blur(14px)"},
  watch:{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid",borderRadius:"20px",padding:"18px 20px"},
  wLabel:{margin:"0 0 4px",fontSize:"12px",color:"rgba(255,255,255,0.5)",letterSpacing:"0.05em",textTransform:"uppercase"},
  wTime:{margin:0,fontSize:"36px",fontWeight:"800",fontFamily:"monospace",letterSpacing:"2px"},
  card:{background:"rgba(255,255,255,0.05)",backdropFilter:"blur(16px)",border:"1px solid",borderRadius:"16px",padding:"16px"},
  cardHead:{display:"flex",alignItems:"flex-start",gap:"12px"},
  exName:{margin:"0 0 4px",fontSize:"15px",fontWeight:"700",color:"#fff"},
  exMeta:{margin:0,fontSize:"12px",color:"rgba(255,255,255,0.45)"},
  infoBtn:{width:"32px",height:"32px",borderRadius:"50%",border:"1px solid",background:"transparent",cursor:"pointer",fontSize:"14px",fontWeight:"700",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"},
  desc:{background:"rgba(255,255,255,0.04)",border:"1px solid",borderRadius:"10px",padding:"12px 14px",margin:"12px 0 8px"},
  descTxt:{margin:0,fontSize:"13px",lineHeight:"1.65",color:"rgba(255,255,255,0.75)"},
  exTimer:{position:"relative",height:"38px",background:"rgba(255,255,255,0.06)",borderRadius:"10px",margin:"10px 0 2px",display:"flex",alignItems:"center",padding:"0 12px",gap:"10px",overflow:"hidden"},
  timerBar:{position:"absolute",left:0,top:0,height:"100%",borderRadius:"10px",opacity:0.15,transition:"width 0.9s linear"},
  timerTxt:{fontFamily:"monospace",fontWeight:"700",fontSize:"16px",color:"#fff",zIndex:1},
  sets:{display:"flex",flexWrap:"wrap",gap:"8px",alignItems:"center",marginTop:"12px"},
  dot:{width:"38px",height:"38px",borderRadius:"50%",border:"2px solid",cursor:"pointer",fontSize:"13px",fontWeight:"700",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"},
  restBtn:{padding:"6px 14px",borderRadius:"20px",border:"1px solid",background:"transparent",cursor:"pointer",fontSize:"12px",fontWeight:"700",marginLeft:"auto"},
  overlay:{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"},
  modalCard:{background:"rgba(255,255,255,0.08)",backdropFilter:"blur(28px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"24px",padding:"32px 28px",textAlign:"center",minWidth:"260px"},
  modalTitle:{margin:"0 0 16px",fontSize:"18px",fontWeight:"700",color:"rgba(255,255,255,0.85)"},
  btn:{padding:"8px 16px",borderRadius:"20px",border:"none",cursor:"pointer",color:"#fff",fontSize:"13px",fontWeight:"600"},
  sm:{width:"32px",height:"32px",borderRadius:"50%",border:"none",cursor:"pointer",color:"#fff",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.1)"},
  row:{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",marginTop:"14px"},
  finishBtn:{width:"100%",padding:"14px",borderRadius:"16px",border:"none",cursor:"pointer",color:"#fff",fontSize:"15px",fontWeight:"700"},
};
