// ---------- TIME FUNCTIONS ----------

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

// ---------- PLANT TABLE ----------

function addRow() {
  const body = document.getElementById("tableBody");

  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="time" class="plantStart"></td>
    <td><input type="time" class="batchingStart"></td>
    <td><input type="time" class="batchingStop"></td>
    <td><input type="time" class="plantStop"></td>
    <td><input type="text" class="effectiveHrs" readonly></td>
    <td><input type="text" class="idlingHrs" readonly></td>
    <td><input type="text" class="runningHrs" readonly></td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
  `;

  body.appendChild(row);
}

function deleteRow(btn) {
  if (confirm("Delete this row?")) {
    btn.parentElement.parentElement.remove();
    calculateAllRows();
  }
}

function calculateAllRows() {
  const rows = document.querySelectorAll("#tableBody tr");

  let totalRun = 0;
  let totalEff = 0;
  let totalIdle = 0;

  rows.forEach(row => {

    const ps = row.querySelector(".plantStart").value;
    const bs = row.querySelector(".batchingStart").value;
    const be = row.querySelector(".batchingStop").value;
    const pe = row.querySelector(".plantStop").value;

    const eff = row.querySelector(".effectiveHrs");
    const idle = row.querySelector(".idlingHrs");
    const run = row.querySelector(".runningHrs");

    if (ps && bs && be && pe) {

      const runMin = timeToMinutes(pe) - timeToMinutes(ps);
      const effMin = timeToMinutes(be) - timeToMinutes(bs);
      const idleMin = runMin - effMin;

      run.value = minutesToTime(runMin);
      eff.value = minutesToTime(effMin);
      idle.value = minutesToTime(idleMin);

      totalRun += runMin;
      totalEff += effMin;
      totalIdle += idleMin;
    }
  });

  document.getElementById("totalRunning").textContent = minutesToTime(totalRun);
  document.getElementById("totalEffective").textContent = minutesToTime(totalEff);
  document.getElementById("totalIdling").textContent = minutesToTime(totalIdle);
}

// ---------- PRODUCTION ----------

function convertHours(val) {
  if (val.includes(":")) {
    let [h, m] = val.split(":").map(Number);
    return h + m / 60;
  }
  if (val.includes(".")) {
    let [h, m] = val.split(".").map(Number);
    return h + m / 60;
  }
  return parseFloat(val);
}

function calculateProduction() {

  const mt = parseFloat(document.getElementById("mtValue").value);
  const hrsText = document.getElementById("productionEffectiveHrs").value;
  const fuel = parseFloat(document.getElementById("fuelLiters").value);

  if (!mt || !hrsText || !fuel) return;

  const hrs = convertHours(hrsText);

  const tph = mt / hrs;
  const cons = fuel / mt;

  document.getElementById("tphValue").value = tph.toFixed(2);
  document.getElementById("fuelConsumption").value = cons.toFixed(2);
}

// ---------- GENERATOR 550 ----------

function calculateGenerator() {

  const s = parseFloat(document.getElementById("genStart").value);
  const e = parseFloat(document.getElementById("genStop").value);
  const f = parseFloat(document.getElementById("genFuel").value);

  if (!s || !e) return;

  const run = e - s;

  document.getElementById("genRunning").value = run.toFixed(2);

  if (f && run > 0) {
    document.getElementById("genConsumption").value = (f / run).toFixed(2);
  }
}

// ---------- GENERATOR 80 ----------

function calculateGenerator80() {

  const s = parseFloat(document.getElementById("gen80Start").value);
  const e = parseFloat(document.getElementById("gen80Stop").value);
  const f = parseFloat(document.getElementById("gen80Fuel").value);

  if (!s || !e) return;

  const run = e - s;

  document.getElementById("gen80Running").value = run.toFixed(2);

  if (f && run > 0) {
    document.getElementById("gen80Consumption").value = (f / run).toFixed(2);
  }
}

// ---------- BITUMEN ----------

function addBitumenRow() {

  const body = document.getElementById("bitumenBody");

  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="time" class="bitStart"></td>
    <td><input type="time" class="bitStop"></td>
    <td><input type="text" class="bitRunning" readonly></td>
    <td><input type="number" class="bitFuel"></td>
    <td><input type="text" class="bitConsumption" readonly></td>
    <td><button class="delete-btn" onclick="deleteBitumenRow(this)">Delete</button></td>
  `;

  body.appendChild(row);
}

function deleteBitumenRow(btn) {

  let confirmDelete = confirm("Delete this row?");

  if (confirmDelete) {
    let row = btn.parentElement.parentElement;
    row.remove();
  }

}

function calculateBitumen() {

  const rows = document.querySelectorAll("#bitumenBody tr");

  let totalMin = 0;
  let totalFuel = 0;

  rows.forEach(row => {

    const s = row.querySelector(".bitStart").value;
    const e = row.querySelector(".bitStop").value;
    const f = parseFloat(row.querySelector(".bitFuel").value);

    const runField = row.querySelector(".bitRunning");
    const consField = row.querySelector(".bitConsumption");

    if (s && e) {

      const min = timeToMinutes(e) - timeToMinutes(s);

      runField.value = minutesToTime(min);

      totalMin += min;

      if (f && min > 0) {
        const hrs = min / 60;
        consField.value = (f / hrs).toFixed(2);
        totalFuel += f;
      }
    }
  });

  document.getElementById("bitTotalRunning").textContent = minutesToTime(totalMin);
  document.getElementById("bitTotalFuel").textContent = totalFuel.toFixed(2);

  if (totalMin > 0) {
    const hrs = totalMin / 60;
    document.getElementById("bitOverallConsumption").textContent =
      (totalFuel / hrs).toFixed(2);
  }
}

// ---------- AUTO CALC ----------

document.addEventListener("input", function (e) {

  // plant
  if (
    e.target.classList.contains("plantStart") ||
    e.target.classList.contains("batchingStart") ||
    e.target.classList.contains("batchingStop") ||
    e.target.classList.contains("plantStop")
  ) {
    calculateAllRows();
  }

  // production
  if (
    e.target.id === "mtValue" ||
    e.target.id === "productionEffectiveHrs" ||
    e.target.id === "fuelLiters"
  ) {
    calculateProduction();
  }

  // generator 550
  if (
    e.target.id === "genStart" ||
    e.target.id === "genStop" ||
    e.target.id === "genFuel"
  ) {
    calculateGenerator();
  }

  // generator 80
  if (
    e.target.id === "gen80Start" ||
    e.target.id === "gen80Stop" ||
    e.target.id === "gen80Fuel"
  ) {
    calculateGenerator80();
  }

  // bitumen
  if (
    e.target.classList.contains("bitStart") ||
    e.target.classList.contains("bitStop") ||
    e.target.classList.contains("bitFuel")
  ) {
    calculateBitumen();
  }

});

// ---------- PRINT ----------

function printReport() {
  window.print();
}

// ---------- AUTO DATE ----------

window.onload = function () {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");

  document.getElementById("reportDate").value = `${y}-${m}-${da}`;
};
function downloadPDF(){

  const element = document.querySelector(".container");

  if (!element) return;

  
  setTimeout(() => {

    html2pdf()
      .set({
        margin: 0.3,
        filename: 'Daily_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .from(element)
      .save();

  }, 500); // 👈 0.5 second delay

}


