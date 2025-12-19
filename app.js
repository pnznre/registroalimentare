let voceInModifica = null;

/* =========================
   AVVIO APP
========================= */
document.addEventListener("DOMContentLoaded", () => {
  initDB();
  impostaDataOraCorrente();
  aggiornaIntestazioneGiorno();
});

/* =========================
   FORM
========================= */
function inviaDati() {
  const voce = {
    giorno: giorno.value,
    ora: ora.value,
    categoria: categoria.value,
    num: num.value,
    tipo: tipo.value,
    scala: scala.value,
    testo: testo.value,
    timestamp: Date.now()
  };

  if (!voce.giorno || !voce.ora) {
    alert("Giorno e ora obbligatori");
    return;
  }

  if (voceInModifica) {
    voce.id = voceInModifica;
    aggiornaVoce(voce);
    voceInModifica = null;
  } else {
    salvaVoce(voce);
  }

  resetForm();
  mostraVoci();
}

/* =========================
   ELENCO
========================= */
function mostraVoci() {
  const contenitore = document.getElementById("listaVoci");
  if (!contenitore) return;

  contenitore.innerHTML = "";

  leggiTutteLeVoci(voci => {
    voci.sort((a,b) => b.timestamp - a.timestamp);

    voci.forEach(v => {
      const div = document.createElement("div");
      div.className = "voce";

      div.innerHTML = `
        <strong>${v.giorno} ${v.ora}</strong><br>
        <em>${v.categoria}</em><br>
        ${v.num ? v.num + " " + v.tipo + "<br>" : ""}
        ${v.scala ? "Scala: " + v.scala + "<br>" : ""}
        ${v.testo || ""}
        <div style="margin-top:6px">
          <button onclick="modificaVoce(${v.id})">✏️</button>
          <button onclick="eliminaVoce(${v.id})">🗑️</button>
        </div>
      `;
      contenitore.appendChild(div);
    });
  });
}

/* =========================
   MODIFICA
========================= */
function modificaVoce(id) {
  leggiTutteLeVoci(voci => {
    const v = voci.find(x => x.id === id);
    if (!v) return;

    giorno.value = v.giorno;
    ora.value = v.ora;
    categoria.value = v.categoria;
    num.value = v.num || "";
    tipo.value = v.tipo || "";
    scala.value = v.scala || "";
    testo.value = v.testo || "";

    voceInModifica = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   UTILITÀ
========================= */
function resetForm() {
  document.getElementById("registroForm").reset();
  impostaDataOraCorrente();
  voceInModifica = null;
}

function impostaDataOraCorrente() {
  const now = new Date();
  giorno.value = now.toISOString().slice(0,10);
  ora.value = now.toTimeString().slice(0,5);
}

function aggiornaIntestazioneGiorno() {
  const giorni = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
  const oggi = new Date();
  headerDay.textContent =
    oggi.toLocaleDateString("it-IT") +
    " " +
    giorni[oggi.getDay()];
}
