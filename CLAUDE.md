# Careas Apps - Conversor de Memorial

**AI Coding Agent**: Ferramenta web para conversao de coordenadas de memorial descritivo. Usado no fluxo de trabalho ANM para SIGAREAS.

## Stack

**Backend**: Flask + poligonal (aidbag)
**Frontend**: React 18 + Bootstrap 5 + Plotly.js

## Estrutura

```
careas_apps/
├── backend/
│   ├── main.py          # Flask API (/flask/convert)
│   └── requirements.txt
├── frontend/src/
│   ├── App.tsx          # App principal + PlotArea
│   ├── plotUtils.ts     # Plotly chart generation
│   ├── InputArea.tsx    # Input de coordenadas
│   ├── OutputArea.tsx   # Output formatado
│   └── index.css
└── debug/               # Scripts de desenvolvimento
```

## API Endpoints

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/flask/convert` | POST | Converte coordenadas, retorna points para plot |

## Formatos Suportados

**Entrada**: scm (SCM/Cadastro Mineiro), gtmpro (TrackMaker)
**Saida**: sigareas, gtmpro, ddegree (decimal)

## Funcionalidades

- Conversao de formatos de coordenadas
- Ajuste para rumos verdadeiros (NSEW)
- Visualizacao do poligono com Plotly (client-side)
- Upload de arquivo ou input manual
- Download do resultado

## Dependencia Principal

Usa `poligonal` do aidbag:
- `readMemorial()` - parse de coordenadas
- `formatMemorial()` - output formatado
- `forceverdPoligonal()` - ajuste rumos verdadeiros

## Desenvolvimento

```bash
# Backend
cd backend && python main.py -d

# Frontend
cd frontend && npm start
```

## Docker Build

Requires GitHub PAT to clone private `aidbag` dependency:

```bash
# Token must be on same line (env var inline)
GITHUB_TOKEN=ghp_your_token docker compose build

# Or use .env file (add to .gitignore!)
echo "GITHUB_TOKEN=ghp_your_token" > .env
docker compose build

# Run locally
docker compose up
```

**CI/CD**: GitHub Actions uses `secrets.TOKEN` (configured in repo settings).

## Deploy

Docker container published to `ghcr.io/eusoubrasileiro/careas_apps:latest`.
Deployed to gis.anm.amiticia.cc via nginx-proxy.
