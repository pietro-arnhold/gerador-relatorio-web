const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = path.join(__dirname, "data.json");

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/api/dados", (req, res) => {
  res.json(loadData());
});

app.post("/api/dados", (req, res) => {
  const { label, valor, categoria } = req.body;
  if (!label || valor === undefined) {
    return res.status(400).json({ error: "label e valor são obrigatórios" });
  }
  const data = loadData();
  const entry = {
    id: Date.now(),
    label,
    valor: Number(valor),
    categoria: categoria || "geral",
    data: new Date().toISOString(),
  };
  data.push(entry);
  saveData(data);
  res.status(201).json(entry);
});

app.delete("/api/dados/:id", (req, res) => {
  let data = loadData();
  const before = data.length;
  data = data.filter((d) => d.id !== Number(req.params.id));
  if (data.length === before) return res.status(404).json({ error: "não encontrado" });
  saveData(data);
  res.json({ ok: true });
});

app.get("/api/resumo", (req, res) => {
  const data = loadData();
  const total = data.reduce((s, d) => s + d.valor, 0);
  const porCategoria = {};
  for (const d of data) {
    porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + d.valor;
  }
  res.json({
    total_registros: data.length,
    soma_total: total,
    media: data.length ? +(total / data.length).toFixed(2) : 0,
    por_categoria: porCategoria,
  });
});

app.get("/api/relatorio/pdf", async (req, res) => {
  const data = loadData();
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=relatorio.pdf");
  doc.pipe(res);

  doc.fontSize(22).text("Relatório de Dados", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).fillColor("#666").text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, { align: "center" });
  doc.moveDown(2);

  const total = data.reduce((s, d) => s + d.valor, 0);
  doc.fontSize(14).fillColor("#000").text(`Total de registros: ${data.length}`);
  doc.text(`Soma total: R$ ${total.toFixed(2)}`);
  doc.text(`Média: R$ ${data.length ? (total / data.length).toFixed(2) : "0.00"}`);
  doc.moveDown(2);

  doc.fontSize(16).text("Detalhamento", { underline: true });
  doc.moveDown();

  const tableTop = doc.y;
  const col = { label: 50, cat: 220, valor: 350, data: 430 };

  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Label", col.label, tableTop);
  doc.text("Categoria", col.cat, tableTop);
  doc.text("Valor", col.valor, tableTop);
  doc.text("Data", col.data, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  doc.font("Helvetica");
  let y = tableTop + 25;
  for (const d of data) {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.text(d.label.substring(0, 25), col.label, y);
    doc.text(d.categoria, col.cat, y);
    doc.text(`R$ ${d.valor.toFixed(2)}`, col.valor, y);
    doc.text(new Date(d.data).toLocaleDateString("pt-BR"), col.data, y);
    y += 20;
  }

  doc.end();
});

app.get("/api/grafico", async (req, res) => {
  const data = loadData();
  const porCategoria = {};
  for (const d of data) {
    porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + d.valor;
  }

  const canvas = new ChartJSNodeCanvas({ width: 600, height: 400, backgroundColour: "white" });
  const labels = Object.keys(porCategoria);
  const valores = Object.values(porCategoria);
  const cores = ["#4dc9f6", "#f67019", "#f53794", "#537bc4", "#acc236", "#166a8f", "#00a950", "#58595b"];

  const image = await canvas.renderToBuffer({
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Valor por categoria (R$)",
          data: valores,
          backgroundColor: cores.slice(0, labels.length),
        },
      ],
    },
    options: {
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } },
    },
  });

  res.setHeader("Content-Type", "image/png");
  res.send(image);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
