# Careas Apps - Conversor de Memorial

**AI Coding Agent**: Ferramenta web para conversao de coordenadas de memorial descritivo. Usado no fluxo de trabalho ANM para SIGAREAS.

## Stack

**Backend**: Flask + poligonal (aidbag)
**Frontend**: Vite + React 19 + Tailwind CSS + shadcn/ui + Plotly.js

## Estrutura

```
careas_apps/
├── backend/
│   ├── main.py          # Flask API (/flask/convert)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # App principal + PlotArea
│   │   ├── InputArea.tsx    # Input de coordenadas
│   │   ├── OutputArea.tsx   # Output formatado
│   │   ├── plotUtils.ts     # Plotly chart generation
│   │   ├── types.ts         # TypeScript types
│   │   └── components/ui/   # shadcn/ui components
│   └── vite.config.ts       # Vite + proxy config
└── debug/                   # Scripts de desenvolvimento
```

## API Endpoints

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/flask/convert` | POST | Converte coordenadas, retorna points para plot |

## Formatos Suportados

**Entrada**: scm (SCM/Cadastro Mineiro), gtmpro (TrackMaker), dmshemi (hemisferio: `09°38'38.000" S 65°59'09.000" W`)
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
cd frontend && npm run dev
```

## Docker Build

Requires GitHub PAT to clone private `aidbag` dependency. The token is passed as a
**BuildKit secret**, never a `--build-arg`: build-args are recorded in the image config
history, and this image is publicly pullable from ghcr.io.

```bash
# Token from env var (compose reads it into the `github_token` secret)
GITHUB_TOKEN=ghp_your_token docker compose build

# Or use .env file (already in .gitignore)
echo "GITHUB_TOKEN=ghp_your_token" > .env
docker compose build
```

### Local Testing (without Traefik)

Use `docker run` directly since `docker-compose.yml` targets VPS with Traefik:

```bash
cd ~/Projects/amiticia/repositories/side-projects/careas_apps
GITHUB_TOKEN=ghp_your_token docker build -t careas_apps:test \
    --secret id=github_token,env=GITHUB_TOKEN .
docker run -p 8000:8000 careas_apps:test
```

Open http://localhost:8000

**CI/CD**: GitHub Actions uses `secrets.TOKEN` (configured in repo settings), mounted the
same way via `build-push-action`'s `secrets:` input.

⚠️ **Never reintroduce `ARG GITHUB_TOKEN` / `--build-arg`.** A PAT leaked that way on
2026-08-07 and had to be rotated — it was readable with an anonymous `docker pull` plus
`docker history`.

## Deploy

Docker container published to `ghcr.io/eusoubrasileiro/careas_apps:latest`.
Deployed to gis.anm.amiticia.cc via nginx-proxy.
