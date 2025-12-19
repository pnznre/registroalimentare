let voceInModifica = null;

// DOM
const giorno = document.getElementById("giorno");
const ora = document.getElementById("ora");
const categoria = document.getElementById("categoria");
const num = document.getElementById("num");
const tipo = document.getElementById("tipo");
const scala = document.getElementById("scala");
const testo = document.getElementById("testo");
const headerDay = document.getElementById("headerDay");
const listaVoci = document.getElementById("listaVoci");

// ==================== AVVIO ====================
document.addEventListener("DOMContentLoaded", () => {
  initDB();
  onDBReady(() => {
    mostraVoci();
    impostaDataOraCorrente();
    aggiornaIntestazioneGiorno();
    gestisciCategoria();
  });
});

// ==================== FORM ====================
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

// ==================== REGISTRO ====================
function mostraVoci() {
  if (!listaVoci) return;
  listaVoci.innerHTML = "";

  leggiTutteLeVoci(voci => {
    // Ordina tutte le voci per timestamp decrescente
    voci.sort((a,b) => b.timestamp - a.timestamp);

    // Prendi solo le prime 5 voci
    const ultime5 = voci.slice(0, 5);

    ultime5.forEach(v => {
      const div = document.createElement("div");
      div.className = "voce";

      const dataDisplay = formattaGiornoDisplay(v.giorno);

      div.innerHTML = `
        <strong>${dataDisplay} ${v.ora}</strong><br>
        <em>${v.categoria}</em><br>
        ${v.num ? v.num + " " + v.tipo + "<br>" : ""}
        ${v.scala ? "Scala: " + v.scala + "<br>" : ""}
        ${v.testo || ""}
        <div style="margin-top:6px">
          <button onclick="modificaVoce(${v.id})">✏️</button>
          <button onclick="eliminaVoce(${v.id})">🗑️</button>
        </div>
      `;
      listaVoci.appendChild(div);
    });
  });
}

// ==================== MODIFICA ====================
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
    gestisciCategoria();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ==================== UTIL ====================
function resetForm() {
  document.getElementById("registroForm").reset();
  impostaDataOraCorrente();
  voceInModifica = null;
  gestisciCategoria();
}

function impostaDataOraCorrente() {
  if (!giorno || !ora) return;
  const now = new Date();
  giorno.value = now.toISOString().slice(0,10);
  ora.value = now.toTimeString().slice(0,5);
}

function aggiornaIntestazioneGiorno() {
  const giorni = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
  const oggi = new Date();
  headerDay.textContent = oggi.toLocaleDateString("it-IT") + " " + giorni[oggi.getDay()];
}

function formattaGiornoDisplay(giornoStr) {
  const parts = giornoStr.split("-");
  if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return giornoStr;
}

function gestisciCategoria() {
  const scalaContainer = document.getElementById("scalaContainer");
  const numTipo = document.querySelectorAll(".numTipo");
  if (!scalaContainer) return;

  if (categoria.value === "Sintomi" || categoria.value === "Bagno") {
    scalaContainer.style.display = "flex";
    numTipo.forEach(e => e.style.display = "none");
  } else {
    scalaContainer.style.display = "none";
    numTipo.forEach(e => e.style.display = "flex");
  }
}
