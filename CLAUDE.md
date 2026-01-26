# Careas Apps - Conversor de Memorial

**AI Coding Agent**: Ferramenta web para conversao de coordenadas de memorial descritivo. Usado no fluxo de trabalho ANM para SIGAREAS.

## Stack

**Backend**: Flask + poligonal (aidbag)
**Frontend**: React 18 + Bootstrap 5 + Plotly.js

## Estrutura

```
careas_apps/
├── backend/
│   ├── main.py          # Flask API (/flask/convert, /flask/plot)
│   └── requirements.txt
├── frontend/src/
│   ├── index.js         # App principal + PlotArea
│   ├── InputArea.js     # Input de coordenadas
│   ├── OutputArea.js    # Output formatado
│   └── index.css
└── debug/               # Scripts de desenvolvimento
```

## API Endpoints

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/flask/convert` | POST | Converte coordenadas entre formatos |
| `/flask/plot` | POST | Retorna JSON Plotly para visualizacao |

## Formatos Suportados

**Entrada**: scm (SCM/Cadastro Mineiro), gtmpro (TrackMaker)
**Saida**: sigareas, gtmpro, ddegree (decimal)

## Funcionalidades

- Conversao de formatos de coordenadas
- Ajuste para rumos verdadeiros (NSEW)
- Visualizacao do poligono com Plotly
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

## Deploy

Docker container publicado em gis.anm.amiticia.cc via Portainer.
