const valores = { carro: 20, moto: 10, caminhao: 50 };
let registros = [];
let historico = JSON.parse(localStorage.getItem("historico")) || [];
let donoLogado = false;
const senhaCorreta = "1234";

// Chart.js
const ctx = document.getElementById("graficoHistorico").getContext("2d");
const grafico = new Chart(ctx, {
  type: "bar",
  data: { labels: [], datasets: [{ label: "Lavagens por dia", data: [], backgroundColor: "#00bfff" }] },
  options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

// === Funções principais ===
function adicionarRegistro() {
  const funcionario = document.getElementById("funcionario").value.trim();
  const veiculo = document.getElementById("veiculo").value;
  if (!funcionario) return;

  registros.push({ funcionario, veiculo });
  historico.push({ funcionario, veiculo, data: new Date().toLocaleString() });

  salvarHistorico();
  document.getElementById("funcionario").value = "";
  atualizarTela();
}

function atualizarTela() {
  // Lista registros
  const lista = document.getElementById("listaRegistros");
  lista.innerHTML = "";
  registros.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.funcionario} lavou um ${r.veiculo} (+R$ ${valores[r.veiculo]})`;
    lista.appendChild(li);
  });

  // Ganhos
  const ganhos = registros.reduce((acc, r) => {
    acc[r.funcionario] = (acc[r.funcionario] || 0) + valores[r.veiculo];
    return acc;
  }, {});
  const listaGanhos = document.getElementById("listaGanhos");
  listaGanhos.innerHTML = "";
  for (const [nome, total] of Object.entries(ganhos)) {
    const li = document.createElement("li");
    li.textContent = `${nome}: R$ ${total}`;
    listaGanhos.appendChild(li);
  }

  // Resumo
  const resumo = { carro: 0, moto: 0, caminhao: 0 };
  registros.forEach(r => resumo[r.veiculo]++);
  const resumoDia = document.getElementById("resumoDia");
  resumoDia.innerHTML = `
    <li>Carros: ${resumo.carro}</li>
    <li>Motos: ${resumo.moto}</li>
    <li>Caminhões: ${resumo.caminhao}</li>
  `;

  // Histórico
  const historicoUl = document.getElementById("historicoRegistros");
  historicoUl.innerHTML = "";
  historico.forEach(h => {
    const li = document.createElement("li");
    li.textContent = `${h.data} - ${h.funcionario} lavou ${h.veiculo}`;
    historicoUl.appendChild(li);
  });

  // Gráfico
  const dataHoje = new Date().toLocaleDateString();
  const countHoje = registros.length;
  const idx = grafico.data.labels.indexOf(dataHoje);
  if (idx === -1) {
    grafico.data.labels.push(dataHoje);
    grafico.data.datasets[0].data.push(countHoje);
  } else {
    grafico.data.datasets[0].data[idx] = countHoje;
  }
  grafico.update();
}

// === Login dono ===
function loginDono() {
  const senha = document.getElementById("senhaDono").value;
  if (senha === senhaCorreta) {
    donoLogado = true;
    document.getElementById("painelDono").style.display = "block";
    document.getElementById("loginDono").style.display = "none";
  } else {
    alert("Senha incorreta!");
  }
}

function logoutDono() {
  donoLogado = false;
  document.getElementById("painelDono").style.display = "none";
}

// === Painel dono ===
function mostrarAba(aba) {
  document.getElementById("aba-historico").style.display = aba === "historico" ? "block" : "none";
  document.getElementById("aba-grafico").style.display = aba === "grafico" ? "block" : "none";
}

// === LocalStorage ===
function salvarHistorico() {
  localStorage.setItem("historico", JSON.stringify(historico));
}

// === Finalizar Dia ===
document.getElementById("finalizarDia").addEventListener("click", () => {
  registros = [];
  atualizarTela();
});

// === Limpar Histórico ===
document.getElementById("limparHistorico").addEventListener("click", () => {
  if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
    historico = [];
    salvarHistorico();
    atualizarTela();
  }
});

// === Exportações ===
document.getElementById("exportarPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Histórico de Lavagens", 10, 10);
  historico.forEach((h, i) => {
    doc.text(`${h.data} - ${h.funcionario} lavou ${h.veiculo}`, 10, 20 + i * 10);
  });
  doc.save("historico.pdf");
});

document.getElementById("exportarExcel").addEventListener("click", () => {
  const ws = XLSX.utils.json_to_sheet(historico);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Histórico");
  XLSX.writeFile(wb, "historico.xlsx");
});

document.getElementById("exportarGanhosPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Ganhos por Funcionário", 10, 10);

  const ganhos = historico.reduce((acc, r) => {
    acc[r.funcionario] = (acc[r.funcionario] || 0) + valores[r.veiculo];
    return acc;
  }, {});

  let i = 0;
  for (const [nome, total] of Object.entries(ganhos)) {
    doc.text(`${nome}: R$ ${total}`, 10, 20 + i * 10);
    i++;
  }
  doc.save("ganhos.pdf");
});

document.getElementById("exportarGanhosExcel").addEventListener("click", () => {
  const ganhos = historico.reduce((acc, r) => {
    acc[r.funcionario] = (acc[r.funcionario] || 0) + valores[r.veiculo];
    return acc;
  }, {});
  const ws = XLSX.utils.json_to_sheet(Object.entries(ganhos).map(([funcionario, total]) => ({ funcionario, total })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ganhos");
  XLSX.writeFile(wb, "ganhos.xlsx");
});

// === Perfil do dono ===
document.getElementById("perfilDono").addEventListener("click", () => {
  if (donoLogado) {
    document.getElementById("painelDono").style.display =
      document.getElementById("painelDono").style.display === "block" ? "none" : "block";
  } else {
    document.getElementById("loginDono").style.display = "block";
  }
});

// === Tema com localStorage ===
const body = document.body;
const toggleBtn = document.getElementById("toggleTema");
const temaSalvo = localStorage.getItem("tema");
if (temaSalvo === "light") body.classList.add("light");

toggleBtn.textContent = body.classList.contains("light") ? "☀️" : "🌙";

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("light");
  if (body.classList.contains("light")) {
    toggleBtn.textContent = "☀️";
    localStorage.setItem("tema", "light");
  } else {
    toggleBtn.textContent = "🌙";
    localStorage.setItem("tema", "dark");
  }
});

// === Inicializa ===
atualizarTela();
