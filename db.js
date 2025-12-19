let db;

/* =========================
   INIZIALIZZAZIONE DATABASE
========================= */
function initDB() {
  const request = indexedDB.open("registroAlimentareDB", 1);

  request.onupgradeneeded = e => {
    db = e.target.result;
    const store = db.createObjectStore("voci", {
      keyPath: "id",
      autoIncrement: true
    });
    store.createIndex("giorno", "giorno", { unique: false });
  };

  request.onsuccess = e => {
    db = e.target.result;
    mostraVoci();
  };

  request.onerror = () => {
    alert("Errore apertura database");
  };
}

/* =========================
   CRUD
========================= */
function salvaVoce(voce) {
  const tx = db.transaction("voci", "readwrite");
  tx.objectStore("voci").add(voce);
}

function aggiornaVoce(voce) {
  const tx = db.transaction("voci", "readwrite");
  tx.objectStore("voci").put(voce);
}

function eliminaVoce(id) {
  if (!confirm("Cancellare questa voce?")) return;
  const tx = db.transaction("voci", "readwrite");
  tx.objectStore("voci").delete(id);
  tx.oncomplete = mostraVoci;
}

function leggiTutteLeVoci(callback) {
  const tx = db.transaction("voci", "readonly");
  const store = tx.objectStore("voci");
  const req = store.getAll();
  req.onsuccess = () => callback(req.result || []);
}

/* =========================
   EXPORT
========================= */
function exportJSON() {
  leggiTutteLeVoci(dati => {
    if (!dati.length) return alert("Nessun dato");

    const blob = new Blob(
      [JSON.stringify(dati, null, 2)],
      { type: "application/json" }
    );
    scaricaFile(blob, "registro_alimentare.json");
  });
}

function exportCSV() {
  leggiTutteLeVoci(dati => {
    if (!dati.length) return alert("Nessun dato da esportare");

    // intestazioni (13 colonne)
    const header = [
      "Data","Ora","Num","Tipo",
      "Alimenti","Bevande","Sonno",
      "ScalaSintomi","Sintomi",
      "ScalaBagno","Bagno",
      "Osservazioni","Altro"
    ];

    const righe = [header.join(",")];

    dati.forEach(v => {
      // formatta la data gg/mm/aaaa
      let dataFormatted = "";
      if (v.giorno) {
        const d = new Date(v.giorno);
        const dd = String(d.getDate()).padStart(2,'0');
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const yyyy = d.getFullYear();
        dataFormatted = `${dd}/${mm}/${yyyy}`;
      }

      const riga = [
        dataFormatted,
        v.ora || "",
        v.num || "",
        v.tipo || "",
        v.categoria === "Alimenti" ? v.testo || "" : "",
        v.categoria === "Bevande" ? v.testo || "" : "",
        v.categoria === "Sonno" ? v.testo || "" : "",
        v.categoria === "Sintomi" ? v.scala || "" : "",
        v.categoria === "Sintomi" ? v.testo || "" : "",
        v.categoria === "Bagno" ? v.scala || "" : "",
        v.categoria === "Bagno" ? v.testo || "" : "",
        v.categoria === "Osservazioni" ? v.testo || "" : "",
        (v.categoria && !["Alimenti","Bevande","Sonno","Sintomi","Bagno","Osservazioni"].includes(v.categoria)) ? v.testo || "" : ""
      ];

      // escape doppie virgolette
      righe.push(riga.map(c => `"${String(c).replace(/"/g,'""')}"`).join(","));
    });

    const blob = new Blob([righe.join("\n")], { type: "text/csv;charset=utf-8;" });
    scaricaFile(blob, "registro_alimentare.csv");
  });
}


function scaricaFile(blob, nome) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  a.click();
  URL.revokeObjectURL(a.href);
}
