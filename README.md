# 📊 Gerador de Relatórios Web

Painel web + API para registrar dados, visualizar gráficos e exportar relatórios em PDF.

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## O que faz?

Uma aplicação completa (front + back) que permite:

- **Registrar dados** (vendas, leads, gastos, etc.) via formulário ou API
- **Visualizar resumo** em cards (total, média, categorias)
- **Gerar gráficos** de barras por categoria
- **Exportar relatório em PDF** com detalhamento completo
- **Deletar registros** individualmente

**Zero dependência externa. Sem banco de dados. Roda local ou em qualquer VPS.**

## Casos de uso

| Cenário | Como usar |
|---|---|
| 📈 **Controle de vendas** | Registre vendas por categoria e acompanhe o desempenho |
| 💰 **Controle financeiro** | Receitas e despesas com relatório mensal em PDF |
| 📋 **Relatório para cliente** | Gere PDFs profissionais para entregar ao cliente |
| 🎯 **Tracker de metas** | Acompanhe progresso de metas com gráficos |
| 📊 **Dashboard de leads** | Painel para visualizar leads por canal |

## Preview

O painel tem visual dark mode moderno com:
- Cards de resumo no topo
- Formulário para adicionar dados
- Gráfico de barras por categoria
- Tabela com todos os registros

## Setup rápido

```bash
git clone https://github.com/SEU_USUARIO/gerador-relatorio-web.git
cd gerador-relatorio-web
npm install
node server.js
```

Abra `http://localhost:3000` no navegador.

## API Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/dados` | Lista todos os registros |
| `POST` | `/api/dados` | Cria um registro `{ label, valor, categoria }` |
| `DELETE` | `/api/dados/:id` | Remove um registro |
| `GET` | `/api/resumo` | Retorna total, média e soma por categoria |
| `GET` | `/api/relatorio/pdf` | Baixa relatório em PDF |
| `GET` | `/api/grafico` | Retorna gráfico PNG por categoria |

### Exemplo de uso via API

```bash
curl -X POST http://localhost:3000/api/dados \
  -H "Content-Type: application/json" \
  -d '{"label": "Venda loja", "valor": 150.00, "categoria": "vendas"}'
```

## Tecnologias

- **Express** — servidor HTTP e API REST
- **PDFKit** — geração de PDF no servidor
- **Chart.js + chartjs-node-canvas** — gráficos renderizados no servidor
- **HTML/CSS/JS** — frontend sem framework (leve e rápido)

## Deploy

Para rodar 24/7:

```bash
npm install -g pm2
pm2 start server.js --name relatorio
pm2 save && pm2 startup
```

Ou faça deploy gratuito no [Render](https://render.com) ou [Railway](https://railway.app).

## Licença

MIT — use como quiser.
